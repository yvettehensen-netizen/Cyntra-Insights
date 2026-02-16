import { Router } from "express";
import { supabaseService } from "./supabaseService.js";

const router = Router();

const supabase = supabaseService;

const SRI_BANDEN = [
  { naam: "Autonomous", max: 35, kleur: "green" },
  { naam: "SRE", max: 55, kleur: "orange" },
  { naam: "CTO Freeze", max: 75, kleur: "red" },
  { naam: "Exec Committee", max: 100, kleur: "deep-red" },
];

function nuIso() {
  return new Date().toISOString();
}

function clamp(waarde, min, max) {
  return Math.min(max, Math.max(min, waarde));
}

function toNum(waarde, fallback = 0) {
  const num = Number(waarde);
  return Number.isFinite(num) ? num : fallback;
}

function afronden(waarde, decimalen = 2) {
  return Number(toNum(waarde).toFixed(decimalen));
}

function gemiddelde(getallen) {
  if (!getallen.length) return 0;
  return getallen.reduce((som, n) => som + toNum(n, 0), 0) / getallen.length;
}

function standaardafwijking(getallen) {
  if (getallen.length < 2) return 0;
  const gem = gemiddelde(getallen);
  const variatie =
    getallen.reduce((som, n) => som + (toNum(n, 0) - gem) ** 2, 0) /
    (getallen.length - 1);
  return Math.sqrt(variatie);
}

function severityNaarRank(severity) {
  const waarde = String(severity || "").toLowerCase();
  if (waarde === "critical") return 4;
  if (waarde === "high") return 3;
  if (waarde === "medium") return 2;
  if (waarde === "low") return 1;
  return 0;
}

function rankNaarSeverity(rank) {
  if (rank >= 4) return "critical";
  if (rank >= 3) return "high";
  if (rank >= 2) return "medium";
  return "low";
}

function governanceKleur(severity) {
  const s = String(severity || "low").toLowerCase();
  if (s === "critical") return "deep-red";
  if (s === "high") return "red";
  if (s === "medium") return "orange";
  return "green";
}

function sriBand(score) {
  const sri = toNum(score, 0);
  return SRI_BANDEN.find((band) => sri <= band.max) || SRI_BANDEN[SRI_BANDEN.length - 1];
}

function organisatieIdUitQuery(req) {
  const raw = req.query.organisation_id || req.query.organisatie_id || "";
  return String(raw || "").trim();
}

function parseIntOr(waarde, fallback) {
  const parsed = Number.parseInt(String(waarde ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function dagenTerug(dagen) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dagen);
  return d.toISOString().slice(0, 10);
}

function datumVandaag() {
  return new Date().toISOString().slice(0, 10);
}

function berekenLineaireHelling(waarden) {
  if (waarden.length < 2) return 0;
  let somX = 0;
  let somY = 0;
  let somXY = 0;
  let somXX = 0;

  for (let i = 0; i < waarden.length; i += 1) {
    const x = i;
    const y = toNum(waarden[i], 0);
    somX += x;
    somY += y;
    somXY += x * y;
    somXX += x * x;
  }

  const teller = waarden.length * somXY - somX * somY;
  const noemer = waarden.length * somXX - somX * somX;
  if (noemer === 0) return 0;
  return teller / noemer;
}

async function veiligeQuery(queryFn, fallback = []) {
  try {
    const { data, error } = await queryFn();
    if (error) return fallback;
    return data || fallback;
  } catch {
    return fallback;
  }
}

function metOrgFilter(queryBuilder, organisatieId) {
  if (!organisatieId) return queryBuilder;
  return queryBuilder.eq("organisation_id", organisatieId);
}

async function haalSriData(organisatieId, rangeDagen = 90) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      huidige_sri: 0,
      sri_band: sriBand(0).naam,
      drift_delta_7d: 0,
      risicosnelheid: 0,
      governance_state: "low",
      governance_kleur: "green",
      actieve_escalaties: 0,
      volatility_indicator: 0,
      sri_trend: [],
      band_transities: [],
      freeze_trigger_lijnen: [75, 90],
      drempel_lijnen: { autonomous: 35, sre: 55, cto_freeze: 75, exec_committee: 90 },
    };
  }

  const sriRowsRaw = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("sri_evolution")
        .select(
          "organisation_id,date,sri,trend,risk_velocity,evolution_score,confidence_band_lower,confidence_band_upper,drift_flag,risk_cluster"
        )
        .gte("date", dagenTerug(Math.max(rangeDagen, 90)))
        .order("date", { ascending: true }),
      organisatieId
    )
  );

  const driftRows = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("model_drift_log")
        .select("analysis_date,drift_score,severity,drift_type")
        .gte("analysis_date", dagenTerug(14))
        .order("analysis_date", { ascending: true }),
      organisatieId
    )
  );

  const escalaties = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("governance_escalation_log")
      .select("triggered_at,severity,status,action_type,reason")
      .neq("status", "resolved")
      .order("triggered_at", { ascending: false })
      .limit(50)
  );

  const governanceSignals = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("governance_log")
        .select("signal_date,severity,status,action_type")
        .gte("signal_date", dagenTerug(90))
        .order("signal_date", { ascending: false })
        .limit(200),
      organisatieId
    )
  );

  const sriRows = sriRowsRaw.map((row) => {
    const score = toNum(row.sri, 0);
    return {
      datum: String(row.date || ""),
      sri: afronden(score, 2),
      trend: afronden(toNum(row.trend, 0), 4),
      risicosnelheid: afronden(toNum(row.risk_velocity, 0), 3),
      evolution_score: afronden(toNum(row.evolution_score, score), 2),
      confidence_band_lower: afronden(toNum(row.confidence_band_lower, score - 2), 2),
      confidence_band_upper: afronden(toNum(row.confidence_band_upper, score + 2), 2),
      drift_flag: Boolean(row.drift_flag),
      risk_cluster: String(row.risk_cluster || "MEDIUM"),
      band: sriBand(score).naam,
    };
  });

  const laatste = sriRows[sriRows.length - 1] || null;

  const recenteDrift = driftRows
    .filter((item) => String(item.analysis_date || "") >= dagenTerug(7))
    .map((item) => toNum(item.drift_score, 0));

  const vorigeDrift = driftRows
    .filter((item) => {
      const d = String(item.analysis_date || "");
      return d < dagenTerug(7) && d >= dagenTerug(14);
    })
    .map((item) => toNum(item.drift_score, 0));

  const driftDelta7d = afronden(gemiddelde(recenteDrift) - gemiddelde(vorigeDrift), 2);

  const governanceSeverityRank = Math.max(
    ...governanceSignals.map((g) => severityNaarRank(g.severity)),
    ...escalaties.map((e) => severityNaarRank(e.severity)),
    1
  );

  const transities = [];
  for (let i = 1; i < sriRows.length; i += 1) {
    if (sriRows[i - 1].band !== sriRows[i].band) {
      transities.push({
        datum: sriRows[i].datum,
        van: sriRows[i - 1].band,
        naar: sriRows[i].band,
      });
    }
  }

  const volatiliteit = afronden(standaardafwijking(sriRows.slice(-14).map((item) => item.sri)), 2);

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || laatste?.organisatie_id || null,
    huidige_sri: laatste ? laatste.sri : 0,
    sri_band: laatste ? laatste.band : sriBand(0).naam,
    drift_delta_7d: driftDelta7d,
    risicosnelheid: laatste ? laatste.risicosnelheid : 0,
    governance_state: rankNaarSeverity(governanceSeverityRank),
    governance_kleur: governanceKleur(rankNaarSeverity(governanceSeverityRank)),
    actieve_escalaties: escalaties.length,
    volatility_indicator: volatiliteit,
    sri_trend: sriRows.slice(-Math.max(7, rangeDagen)),
    band_transities: transities,
    freeze_trigger_lijnen: [75, 90],
    drempel_lijnen: {
      autonomous: 35,
      sre: 55,
      cto_freeze: 75,
      exec_committee: 90,
    },
  };
}

function maakHeatmapCellen(driftRows) {
  const sleutel = new Map();

  for (const row of driftRows) {
    const datum = String(row.analysis_date || "");
    const driftType = String(row.drift_type || "onbekend");
    const id = `${datum}:${driftType}`;
    const huidig = sleutel.get(id) || { datum, drift_type: driftType, intensiteit: 0, severity: "low" };

    const score = toNum(row.drift_score, 0);
    const severity = String(row.severity || "low").toLowerCase();

    huidig.intensiteit = afronden(Math.max(huidig.intensiteit, score), 2);
    if (severityNaarRank(severity) > severityNaarRank(huidig.severity)) {
      huidig.severity = severity;
    }

    sleutel.set(id, huidig);
  }

  return Array.from(sleutel.values()).sort((a, b) =>
    `${a.datum}:${a.drift_type}`.localeCompare(`${b.datum}:${b.drift_type}`)
  );
}

async function haalDriftData(organisatieId) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      drift_intensiteit_heatmap: [],
      drift_clusters: [],
      severity_classificatie: { low: 0, medium: 0, high: 0, critical: 0 },
      besluit_omkeringen_detectie: { aantal: 0, events: [] },
      drift_tijdlijn: [],
    };
  }

  const modelDrift = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("model_drift_log")
        .select("analysis_date,drift_type,drift_score,severity,details")
        .gte("analysis_date", dagenTerug(90))
        .order("analysis_date", { ascending: true }),
      organisatieId
    )
  );

  const decisionDrift = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("decision_drift_log")
      .select("detected_at,analysis_type,drift_type,drift_severity,drift_score,description")
      .gte("detected_at", `${dagenTerug(90)}T00:00:00.000Z`)
      .order("detected_at", { ascending: false })
      .limit(300)
  );

  const clusters = new Map();
  for (const row of modelDrift) {
    const type = String(row.drift_type || "onbekend");
    if (!clusters.has(type)) {
      clusters.set(type, {
        cluster: type,
        gemiddelde_score: 0,
        hoogste_score: 0,
        aantal: 0,
        severity_rank: 0,
      });
    }

    const item = clusters.get(type);
    const score = toNum(row.drift_score, 0);
    item.aantal += 1;
    item.gemiddelde_score += score;
    item.hoogste_score = Math.max(item.hoogste_score, score);
    item.severity_rank = Math.max(item.severity_rank, severityNaarRank(row.severity));
  }

  const driftClusters = Array.from(clusters.values())
    .map((item) => ({
      cluster: item.cluster,
      gemiddelde_score: afronden(item.gemiddelde_score / Math.max(item.aantal, 1), 2),
      hoogste_score: afronden(item.hoogste_score, 2),
      aantal: item.aantal,
      severity: rankNaarSeverity(item.severity_rank),
    }))
    .sort((a, b) => b.gemiddelde_score - a.gemiddelde_score);

  const severityClassificatie = modelDrift.reduce(
    (acc, row) => {
      const sleutel = String(row.severity || "low").toLowerCase();
      if (!(sleutel in acc)) return acc;
      acc[sleutel] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, critical: 0 }
  );

  const omkeringen = decisionDrift
    .filter((row) => {
      const driftType = String(row.drift_type || "").toLowerCase();
      const severity = String(row.drift_severity || "").toLowerCase();
      return (
        (driftType.includes("confidence") ||
          driftType.includes("risk") ||
          driftType.includes("execution") ||
          driftType.includes("contract")) &&
        (severity === "high" || severity === "critical")
      );
    })
    .slice(0, 25)
    .map((row) => ({
      tijdstip: row.detected_at,
      analyse_type: row.analysis_type,
      drift_type: row.drift_type,
      severity: row.drift_severity,
      score: afronden(toNum(row.drift_score, 0), 2),
      omschrijving: row.description || "Besluitomkering gedetecteerd",
    }));

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    drift_intensiteit_heatmap: maakHeatmapCellen(modelDrift),
    drift_clusters: driftClusters,
    severity_classificatie: severityClassificatie,
    besluit_omkeringen_detectie: {
      aantal: omkeringen.length,
      events: omkeringen,
    },
    drift_tijdlijn: modelDrift
      .slice(-50)
      .map((row) => ({
        datum: row.analysis_date,
        drift_type: row.drift_type,
        score: afronden(toNum(row.drift_score, 0), 2),
        severity: row.severity,
      })),
  };
}

function maakRisicoBuckets(scores) {
  const buckets = [
    { band: "0-20", min: 0, max: 20, aantal: 0 },
    { band: "21-40", min: 21, max: 40, aantal: 0 },
    { band: "41-60", min: 41, max: 60, aantal: 0 },
    { band: "61-80", min: 61, max: 80, aantal: 0 },
    { band: "81-100", min: 81, max: 100, aantal: 0 },
  ];

  for (const score of scores) {
    const gevonden = buckets.find((bucket) => score >= bucket.min && score <= bucket.max);
    if (gevonden) gevonden.aantal += 1;
  }

  return buckets.map((item) => ({ band: item.band, aantal: item.aantal }));
}

function projecteerNegentigDagen(sriRows) {
  if (!sriRows.length) return [];
  const laatste = sriRows[sriRows.length - 1];
  const recenteScores = sriRows.slice(-21).map((row) => toNum(row.sri, 0));
  const slope = berekenLineaireHelling(recenteScores);
  const volatiliteit = standaardafwijking(recenteScores);

  const punten = [];
  const startDatum = new Date(`${String(laatste.date || datumVandaag())}T00:00:00.000Z`);
  let huidige = toNum(laatste.sri, 0);

  for (let dag = 7; dag <= 90; dag += 7) {
    huidige = clamp(huidige + slope * 7, 0, 100);
    const d = new Date(startDatum);
    d.setUTCDate(d.getUTCDate() + dag);
    const decay = clamp(100 - dag * 0.45, 55, 100);

    punten.push({
      datum: d.toISOString().slice(0, 10),
      score: afronden(huidige, 2),
      ondergrens: afronden(clamp(huidige - volatiliteit * 1.2, 0, 100), 2),
      bovengrens: afronden(clamp(huidige + volatiliteit * 1.2, 0, 100), 2),
      confidence_decay: afronden(decay, 2),
    });
  }

  return punten;
}

async function haalRiskEvolutionData(organisatieId) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      risico_distributie: [],
      waargenomen_trend: [],
      projectie_90_dagen: [],
      confidence_decay_overlay: [],
      risico_acceleratie_vector: { huidig: 0, trend_7d: 0, richting: "stabiel" },
    };
  }

  const sriRows = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("sri_evolution")
        .select("organisation_id,date,sri,risk_velocity,evolution_score")
        .gte("date", dagenTerug(120))
        .order("date", { ascending: true }),
      organisatieId
    )
  );

  const risicoRows = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .from("analyses")
        .select("risk_score,created_at")
        .gte("created_at", `${dagenTerug(120)}T00:00:00.000Z`)
        .order("created_at", { ascending: true }),
      organisatieId
    )
  );

  const confidenceRows = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("decision_performance_daily")
      .select("day,avg_confidence")
      .gte("day", dagenTerug(120))
      .order("day", { ascending: true })
  );

  const velocityRows = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("risk_velocity_log")
      .select("calculated_at,risk_velocity,velocity_direction")
      .gte("calculated_at", `${dagenTerug(30)}T00:00:00.000Z`)
      .order("calculated_at", { ascending: true })
  );

  const risicoScores = risicoRows
    .map((row) => toNum(row.risk_score, NaN))
    .filter((value) => Number.isFinite(value));

  const observed = sriRows.map((row) => ({
    datum: row.date,
    score: afronden(toNum(row.sri, 0), 2),
    risicosnelheid: afronden(toNum(row.risk_velocity, 0), 3),
  }));

  const velocityRecent = velocityRows.map((row) => toNum(row.risk_velocity, 0));
  const velocityHuidig = velocityRecent.length ? velocityRecent[velocityRecent.length - 1] : 0;
  const velocityTrend = velocityRecent.length
    ? velocityHuidig - gemiddelde(velocityRecent.slice(0, Math.max(1, velocityRecent.length - 1)))
    : 0;

  const direction = Math.abs(velocityHuidig) < 1 ? "stabiel" : velocityHuidig > 0 ? "stijgend" : "dalend";

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    risico_distributie: maakRisicoBuckets(risicoScores),
    waargenomen_trend: observed,
    projectie_90_dagen: projecteerNegentigDagen(sriRows),
    confidence_decay_overlay: confidenceRows.map((row) => ({
      datum: row.day,
      confidence: afronden(toNum(row.avg_confidence, 0) * 100, 2),
    })),
    risico_acceleratie_vector: {
      huidig: afronden(velocityHuidig, 3),
      trend_7d: afronden(velocityTrend, 3),
      richting: direction,
    },
  };
}

function maakAuthorityRouting() {
  return [
    {
      band: "Autonomous",
      sri_min: 0,
      sri_max: 35,
      eigenaar: "Autonome operatie",
      escalatiepad: "Team Lead",
      actie: "Doorgaan met standaard monitorcyclus",
    },
    {
      band: "SRE",
      sri_min: 36,
      sri_max: 55,
      eigenaar: "SRE / Operations",
      escalatiepad: "Head of Analytics",
      actie: "Verscherpte controle en dagelijkse review",
    },
    {
      band: "CTO Freeze",
      sri_min: 56,
      sri_max: 75,
      eigenaar: "CTO",
      escalatiepad: "Risk Officer",
      actie: "Release freeze overwegen en herstelplan starten",
    },
    {
      band: "Exec Committee",
      sri_min: 76,
      sri_max: 100,
      eigenaar: "Executive Committee",
      escalatiepad: "Board",
      actie: "Direct bestuurlijk ingrijpen en governance override",
    },
  ];
}

async function haalGovernanceData(organisatieId) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      authority_routing_tabel: maakAuthorityRouting(),
      escalation_ladder: [],
      actieve_freeze_flags: [],
      governance_override_acties: [],
      governance_state: { status: "low", kleur: "green" },
    };
  }

  const escalaties = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("governance_escalation_log")
      .select("triggered_at,action_type,reason,severity,status")
      .neq("status", "resolved")
      .order("triggered_at", { ascending: false })
      .limit(120)
  );

  const governance = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .schema("ops")
        .from("governance_log")
        .select("signal_date,action_type,severity,urgency_level,actionable_description,status")
        .gte("signal_date", dagenTerug(120))
        .order("signal_date", { ascending: false })
        .limit(200),
      organisatieId
    )
  );

  const sri = await haalSriData(organisatieId, 30);

  const severityRank = Math.max(
    ...escalaties.map((item) => severityNaarRank(item.severity)),
    ...governance.map((item) => severityNaarRank(item.severity)),
    severityNaarRank(sri.governance_state)
  );

  const freezeFlags = escalaties
    .filter((item) => String(item.action_type || "").toLowerCase().includes("freeze"))
    .map((item) => ({
      actie: item.action_type,
      status: item.status,
      severity: item.severity,
      reden: item.reason,
      gestart_op: item.triggered_at,
    }));

  const ladder = escalaties.slice(0, 20).map((item) => ({
    tijdstip: item.triggered_at,
    actie: item.action_type,
    severity: item.severity,
    status: item.status,
    reden: item.reason,
  }));

  const overrides = governance
    .filter((item) => {
      const type = String(item.action_type || "").toLowerCase();
      return type.includes("board") || type.includes("freeze") || type.includes("escalate");
    })
    .slice(0, 20)
    .map((item) => ({
      datum: item.signal_date,
      actie: item.action_type,
      urgency: item.urgency_level,
      severity: item.severity,
      beschrijving: item.actionable_description,
      status: item.status,
    }));

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    authority_routing_tabel: maakAuthorityRouting(),
    escalation_ladder: ladder,
    actieve_freeze_flags: freezeFlags,
    governance_override_acties: overrides,
    governance_state: {
      status: rankNaarSeverity(severityRank),
      kleur: governanceKleur(rankNaarSeverity(severityRank)),
      sri_band: sri.sri_band,
      actieve_escalaties: escalaties.length,
    },
  };
}

function topWoorden(teksten, limit = 3) {
  const verboden = new Set([
    "de", "het", "een", "en", "of", "van", "voor", "met", "op", "in", "te", "is", "zijn", "als", "to", "from", "required", "analysis_type",
  ]);

  const telling = new Map();
  for (const tekst of teksten) {
    String(tekst || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, " ")
      .split(/\s+/)
      .filter((woord) => woord.length > 3 && !verboden.has(woord))
      .forEach((woord) => {
        telling.set(woord, (telling.get(woord) || 0) + 1);
      });
  }

  return Array.from(telling.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([woord, count]) => ({ naam: woord, impact: count }));
}

async function haalPatternLearningData(organisatieId) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      recurrent_patterns: [],
      decision_type_cluster: [],
      stagnation_signals: 0,
      escalation_frequency: 0,
      decision_memory: [],
      audit_logs: [],
      decision_pattern_clusters: [],
      herhaalde_faal_signaturen: [],
      dominante_structurele_bottlenecks: [],
      learning_density_score: 0,
    };
  }

  const [patterns, decisionDrift, escalaties, decisionMemoryRows, auditRows] = await Promise.all([
    veiligeQuery(() =>
      supabase
        .schema("ops")
        .from("decision_patterns")
        .select("vector,cluster_label,frequency,pattern_stability_score,pattern_acceleration_index,last_seen")
        .gte("last_seen", `${dagenTerug(120)}T00:00:00.000Z`)
        .order("last_seen", { ascending: false })
        .limit(400)
    ),
    veiligeQuery(() =>
      supabase
        .schema("ops")
        .from("decision_drift_log")
        .select("detected_at,analysis_type,drift_type,drift_severity,drift_score,description")
        .gte("detected_at", `${dagenTerug(120)}T00:00:00.000Z`)
        .order("detected_at", { ascending: false })
        .limit(500)
    ),
    veiligeQuery(() =>
      supabase
        .schema("ops")
        .from("governance_escalation_log")
        .select("reason")
        .gte("triggered_at", `${dagenTerug(120)}T00:00:00.000Z`)
        .limit(300)
    ),
    veiligeQuery(() =>
      metOrgFilter(
        supabase
          .from("decision_memory")
          .select(
            "analysis_id,timestamp,gate_score,gate_status,repair_attempts,decision_velocity,activated_lenses,dominant_risk_axes,dominant_claim_axes"
          )
          .gte("timestamp", `${dagenTerug(120)}T00:00:00.000Z`)
          .order("timestamp", { ascending: false })
          .limit(240),
        organisatieId
      )
    ),
    veiligeQuery(() =>
      metOrgFilter(
        supabase
          .from("analysis_audit_log")
          .select("analysis_id,timestamp,repair_attempts,single_call_mode,duration_ms")
          .gte("timestamp", `${dagenTerug(120)}T00:00:00.000Z`)
          .order("timestamp", { ascending: false })
          .limit(240),
        organisatieId
      )
    ),
  ]);

  const decisionMemory = decisionMemoryRows.map((row) => ({
    analysis_id: String(row.analysis_id || ""),
    timestamp: row.timestamp,
    gate_score: afronden(toNum(row.gate_score, 0), 2),
    gate_status: String(row.gate_status || "PASS").toUpperCase(),
    repair_attempts: parseIntOr(row.repair_attempts, 0),
    decision_velocity: afronden(toNum(row.decision_velocity, 0), 2),
    activated_lenses: Array.isArray(row.activated_lenses) ? row.activated_lenses.map((v) => String(v)) : [],
    dominant_risk_axes: Array.isArray(row.dominant_risk_axes) ? row.dominant_risk_axes.map((v) => String(v)) : [],
    dominant_claim_axes: Array.isArray(row.dominant_claim_axes) ? row.dominant_claim_axes.map((v) => String(v)) : [],
  }));

  const auditLogs = auditRows.map((row) => ({
    analysis_id: String(row.analysis_id || ""),
    timestamp: row.timestamp,
    repair_attempts: parseIntOr(row.repair_attempts, 0),
    single_call_mode: Boolean(row.single_call_mode),
    duration_ms: parseIntOr(row.duration_ms, 0),
  }));

  const gefilterdePatterns = organisatieId
    ? patterns.filter((item) => {
        const vec = item.vector && typeof item.vector === "object" ? item.vector : {};
        return String(vec.organisation_id || "") === organisatieId;
      })
    : patterns;

  const clusters = gefilterdePatterns
    .map((item) => ({
      cluster_label: item.cluster_label,
      frequentie: toNum(item.frequency, 0),
      stabiliteit: afronden(toNum(item.pattern_stability_score, 0), 2),
      acceleratie: afronden(toNum(item.pattern_acceleration_index, 0), 3),
      last_seen: item.last_seen,
    }))
    .sort((a, b) => b.frequentie - a.frequentie)
    .slice(0, 25);

  const signatuurMap = new Map();
  for (const row of decisionDrift) {
    const sleutel = `${row.analysis_type || "onbekend"}::${row.drift_type || "drift"}`;
    if (!signatuurMap.has(sleutel)) {
      signatuurMap.set(sleutel, {
        signatuur: sleutel,
        aantal: 0,
        severity_rank: 0,
      });
    }

    const item = signatuurMap.get(sleutel);
    item.aantal += 1;
    item.severity_rank = Math.max(item.severity_rank, severityNaarRank(row.drift_severity));
  }

  const signaturen = Array.from(signatuurMap.values())
    .map((item) => ({
      signatuur: item.signatuur,
      aantal: item.aantal,
      ernst: rankNaarSeverity(item.severity_rank),
    }))
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, 20);

  const bottlenecks = topWoorden(escalaties.map((row) => row.reason), 4);
  const recurrentMap = new Map();
  for (const row of decisionMemory) {
    const risk = row.dominant_risk_axes[0] || "risk:onbekend";
    const claim = row.dominant_claim_axes[0] || "claim:onbekend";
    const sleutel = `${risk} -> ${claim}`;
    recurrentMap.set(sleutel, (recurrentMap.get(sleutel) || 0) + 1);
  }

  const recurrentPatterns = Array.from(recurrentMap.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([naam, count]) => `${naam} (${count}x)`);

  const decisionTypeMap = new Map();
  for (const row of decisionMemory) {
    const status = String(row.gate_status || "PASS").toUpperCase();
    const type =
      status === "FAIL"
        ? "type:herstel"
        : status === "REPAIR"
        ? "type:stabilisatie"
        : "type:doorpak";

    decisionTypeMap.set(type, (decisionTypeMap.get(type) || 0) + 1);

    for (const lens of row.activated_lenses) {
      const key = `lens:${String(lens || "").trim().toLowerCase() || "onbekend"}`;
      decisionTypeMap.set(key, (decisionTypeMap.get(key) || 0) + 1);
    }
  }

  const decisionTypeCluster = Array.from(decisionTypeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([naam]) => naam);

  let stagnationSignals = 0;
  const memoryAsc = [...decisionMemory].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
  for (let i = 1; i < memoryAsc.length; i += 1) {
    const prev = memoryAsc[i - 1];
    const cur = memoryAsc[i];
    const stableScore = Math.abs(toNum(cur.gate_score, 0) - toNum(prev.gate_score, 0)) <= 1.5;
    const stableVelocity = Math.abs(toNum(cur.decision_velocity, 0) - toNum(prev.decision_velocity, 0)) <= 0.4;
    const sameStatus = String(cur.gate_status || "") === String(prev.gate_status || "");
    if (stableScore && stableVelocity && sameStatus) stagnationSignals += 1;
  }

  const memoryEscalaties = decisionMemory.filter(
    (row) => String(row.gate_status || "PASS").toUpperCase() !== "PASS" || toNum(row.repair_attempts, 0) > 0
  ).length;
  const auditEscalaties = auditLogs.filter(
    (row) => !row.single_call_mode || toNum(row.repair_attempts, 0) > 0
  ).length;
  const escalationFrequency = afronden((memoryEscalaties + auditEscalaties) / (120 / 7), 2);

  const leerdichtheid = clamp(
    ((clusters.length * 1.6 + signaturen.length * 1.2 + bottlenecks.length * 3) / 40) * 100,
    0,
    100
  );

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    recurrent_patterns: recurrentPatterns.length
      ? recurrentPatterns
      : ["Geen recurrente spanningspatronen in de laatste periode"],
    decision_type_cluster: decisionTypeCluster.length
      ? decisionTypeCluster
      : ["Geen dominant besliscluster"],
    stagnation_signals: stagnationSignals,
    escalation_frequency: escalationFrequency,
    decision_memory: decisionMemory.slice(0, 60),
    audit_logs: auditLogs.slice(0, 60),
    decision_pattern_clusters: clusters,
    herhaalde_faal_signaturen: signaturen,
    dominante_structurele_bottlenecks: bottlenecks,
    learning_density_score: afronden(leerdichtheid, 1),
  };
}

function berekenDecisionMetrics(row) {
  const gateScore = toNum(row.gate_score, 0);
  const decisionVelocity = toNum(row.decision_velocity, 0);
  const repairAttempts = toNum(row.repair_attempts, 0);
  const status = String(row.gate_status || "PASS").toUpperCase();
  const singleCallMode = Boolean(row.single_call_mode);
  const durationMs = toNum(row.duration_ms, 0);

  const statusBoost = status === "PASS" ? 20 : status === "REPAIR" ? 8 : -6;
  const irreversibility = clamp(
    gateScore * 0.55 + decisionVelocity * 0.22 + statusBoost - repairAttempts * 6,
    0,
    100
  );

  const lensCount = Array.isArray(row.activated_lenses) ? row.activated_lenses.length : 0;
  const axisCount = Array.isArray(row.dominant_risk_axes) ? row.dominant_risk_axes.length : 0;
  const ownership = clamp(
    92 - Math.abs(lensCount - 2) * 10 - Math.max(0, axisCount - 3) * 6 - repairAttempts * 4,
    0,
    100
  );

  const execution = clamp(
    gateScore * 0.6 +
      decisionVelocity * 0.25 +
      (singleCallMode ? 8 : -12) -
      repairAttempts * 7 -
      Math.min(22, durationMs / 4500),
    0,
    100
  );

  const strength = clamp(
    irreversibility * 0.35 + ownership * 0.25 + execution * 0.4,
    0,
    100
  );

  return {
    irreversibility,
    ownership,
    execution,
    strength,
  };
}

async function haalDecisionIntelligenceData(organisatieId) {
  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      irreversibility_score: 0,
      ownership_clarity_score: 0,
      ownership_clarity: 0,
      execution_probability: 0,
      decision_strength_index: 0,
      evolution_state: "Stilstand",
      evolution_delta: 0,
      history: [],
    };
  }

  const [decisionMemoryRows, auditRows] = await Promise.all([
    veiligeQuery(() =>
      metOrgFilter(
        supabase
          .from("decision_memory")
          .select(
            "analysis_id,timestamp,gate_score,gate_status,repair_attempts,decision_velocity,activated_lenses,dominant_risk_axes"
          )
          .gte("timestamp", `${dagenTerug(120)}T00:00:00.000Z`)
          .order("timestamp", { ascending: false })
          .limit(120),
        organisatieId
      )
    ),
    veiligeQuery(() =>
      metOrgFilter(
        supabase
          .from("analysis_audit_log")
          .select("analysis_id,timestamp,repair_attempts,single_call_mode,duration_ms")
          .gte("timestamp", `${dagenTerug(120)}T00:00:00.000Z`)
          .order("timestamp", { ascending: false })
          .limit(120),
        organisatieId
      )
    ),
  ]);

  const auditByAnalysisId = new Map();
  for (const row of auditRows) {
    const key = String(row.analysis_id || "");
    if (!key || auditByAnalysisId.has(key)) continue;
    auditByAnalysisId.set(key, row);
  }

  const history = decisionMemoryRows.map((row) => {
    const key = String(row.analysis_id || "");
    const audit = auditByAnalysisId.get(key);

    return {
      analysis_id: key,
      timestamp: row.timestamp,
      gate_score: afronden(toNum(row.gate_score, 0), 2),
      gate_status: String(row.gate_status || "PASS").toUpperCase(),
      repair_attempts: parseIntOr(row.repair_attempts, 0),
      decision_velocity: afronden(toNum(row.decision_velocity, 0), 2),
      single_call_mode: Boolean(audit?.single_call_mode ?? true),
      duration_ms: parseIntOr(audit?.duration_ms, 0),
      activated_lenses: Array.isArray(row.activated_lenses) ? row.activated_lenses.map((v) => String(v)) : [],
      dominant_risk_axes: Array.isArray(row.dominant_risk_axes) ? row.dominant_risk_axes.map((v) => String(v)) : [],
    };
  });

  const current = history[0] || null;
  const previousFive = history.slice(1, 6);

  const currentMetrics = current ? berekenDecisionMetrics(current) : null;
  const previousStrength = previousFive.map((row) => berekenDecisionMetrics(row).strength);
  const baseline = previousStrength.length ? gemiddelde(previousStrength) : toNum(currentMetrics?.strength, 0);

  const delta = toNum(currentMetrics?.strength, 0) - baseline;
  const evolutionState = delta > 2 ? "Verbetering" : delta < -2 ? "Verslechtering" : "Stilstand";

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    irreversibility_score: afronden(toNum(currentMetrics?.irreversibility, 0), 1),
    ownership_clarity_score: afronden(toNum(currentMetrics?.ownership, 0), 1),
    ownership_clarity: afronden(toNum(currentMetrics?.ownership, 0), 1),
    execution_probability: afronden(toNum(currentMetrics?.execution, 0), 1),
    decision_strength_index: afronden(toNum(currentMetrics?.strength, 0), 1),
    evolution_state: evolutionState,
    evolution_delta: afronden(delta, 2),
    history: history.slice(0, 6),
  };
}

function extractOnomkeerbaarUitAnalyse(analyses) {
  for (const analyse of analyses) {
    const bronnen = [analyse.content, analyse.result];

    for (const bron of bronnen) {
      if (!bron || typeof bron !== "object") continue;

      const directe = bron.decision_contract || bron.decisionContract || bron.decision_gate?.contract;
      if (directe && typeof directe === "object") {
        const veld = directe.irreversible_action || directe.point_of_no_return || directe.decision_statement;
        if (typeof veld === "string" && veld.trim()) return veld.trim();
      }

      const report = bron.report;
      if (report && typeof report === "object") {
        const contract = report.decision_contract || report.decisionContract;
        const veld = contract?.irreversible_action || contract?.point_of_no_return || contract?.decision_statement;
        if (typeof veld === "string" && veld.trim()) return veld.trim();
      }
    }
  }

  return "Geen expliciete onomkeerbare actie gevonden in de recente analyses.";
}

async function haalBoardSummaryData(organisatieId) {
  const sri = await haalSriData(organisatieId, 90);
  const governance = await haalGovernanceData(organisatieId);

  if (!supabase) {
    return {
      gegenereerd_op: nuIso(),
      organisatie_id: organisatieId || null,
      executive_thesis: "Geen board-thesis beschikbaar.",
      dominant_risico: "Geen risicodata beschikbaar.",
      onomkeerbaar_besluit: "Niet beschikbaar",
      authority_summary_90_dagen: "Niet beschikbaar",
      escalatie_exposure: {
        actief: 0,
        hoogste_ernst: "low",
      },
      governance_readiness_score: 0,
    };
  }

  const decision = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .from("decision_briefs")
        .select("executive_thesis,central_tension,created_at,status,confidence_score,confidence_level")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1),
      organisatieId
    ),
    []
  );

  const escalaties = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("governance_escalation_log")
      .select("severity,reason,status")
      .neq("status", "resolved")
      .order("triggered_at", { ascending: false })
      .limit(100)
  );

  const performance = await veiligeQuery(() =>
    supabase
      .schema("ops")
      .from("decision_performance_daily")
      .select("day,avg_confidence,contract_422_rate_pct")
      .gte("day", dagenTerug(90))
      .order("day", { ascending: false })
      .limit(90)
  );

  const analyses = await veiligeQuery(() =>
    metOrgFilter(
      supabase
        .from("analyses")
        .select("content,result,created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      organisatieId
    )
  );

  const dominant = escalaties
    .slice()
    .sort((a, b) => severityNaarRank(b.severity) - severityNaarRank(a.severity))[0];

  const hoogsteErnstRank = escalaties.length
    ? Math.max(...escalaties.map((row) => severityNaarRank(row.severity)))
    : severityNaarRank(governance.governance_state?.status || "low");

  const avgConfidence = gemiddelde(performance.map((row) => toNum(row.avg_confidence, 0)));
  const avgContract422 = gemiddelde(performance.map((row) => toNum(row.contract_422_rate_pct, 0)));

  const readiness = clamp(
    100 - toNum(sri.huidige_sri, 0) * 0.45 - escalaties.length * 8 - avgContract422 * 1.8 + avgConfidence * 32,
    0,
    100
  );

  const thesis = decision[0]?.executive_thesis
    ? String(decision[0].executive_thesis)
    : "Geen actieve executive thesis beschikbaar.";

  const authoritySummary = `Band ${sri.sri_band}. Verwachte authority-route 90 dagen: ${governance.authority_routing_tabel
    .map((item) => `${item.band} -> ${item.eigenaar}`)
    .join(" | ")}.`;

  return {
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    executive_thesis: thesis,
    dominant_risico: dominant?.reason || "Geen dominant risico gedetecteerd.",
    onomkeerbaar_besluit: extractOnomkeerbaarUitAnalyse(analyses),
    authority_summary_90_dagen: authoritySummary,
    escalatie_exposure: {
      actief: escalaties.length,
      hoogste_ernst: rankNaarSeverity(hoogsteErnstRank),
    },
    governance_readiness_score: afronden(readiness, 1),
  };
}

function stuurClientError(res, status, boodschap) {
  return res.status(status).json({
    error: boodschap,
    gegenereerd_op: nuIso(),
  });
}

function checkClient() {
  return Boolean(supabase);
}

function bouwStrategischeContext({ sri, drift, riskEvolution, governance, patternLearning, boardSummary }) {
  const sriBand = String(sri?.sri_band || "Autonomous");
  const risicoRichting = String(riskEvolution?.risico_acceleratie_vector?.richting || "stabiel");
  const driftErnst = String(sri?.governance_state || "low");
  const clusterTop = patternLearning?.decision_pattern_clusters?.[0]?.cluster_label || "geen dominant cluster";
  const escalaties = toNum(sri?.actieve_escalaties, 0);

  const statusregel =
    `${sriBand} band · drift ${driftErnst} · risicorichting ${risicoRichting} · ${escalaties} actieve escalaties`;

  const advies =
    sriBand === "Exec Committee" || driftErnst === "critical"
      ? "Bestuurlijk ingrijpen direct prioriteren; freeze-autoriteit en besluitherijking uitvoeren."
      : sriBand === "CTO Freeze" || driftErnst === "high"
      ? "Controle op uitrolpad verhogen; focus op cluster-stabilisatie en governance-routes."
      : "Monitoren op ritme, met nadruk op trendbehoud en patroonversterking.";

  const betekenis =
    `Dominant patroon: ${clusterTop}. ` +
    `Executive thesis: ${boardSummary?.executive_thesis || "niet beschikbaar"}`;

  const prioriteit = escalaties >= 3 || driftErnst === "critical" ? "hoog" : escalaties >= 1 ? "medium" : "normaal";

  return {
    statusregel,
    advies,
    betekenis,
    prioriteit,
  };
}

router.get("/overview", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const dagen = clamp(parseIntOr(req.query.days, 90), 7, 365);

  const [sri, drift, riskEvolution, governance, patternLearning, decisionIntelligence, boardSummary] =
    await Promise.all([
    haalSriData(organisatieId, dagen),
    haalDriftData(organisatieId),
    haalRiskEvolutionData(organisatieId),
    haalGovernanceData(organisatieId),
    haalPatternLearningData(organisatieId),
    haalDecisionIntelligenceData(organisatieId),
    haalBoardSummaryData(organisatieId),
  ]);

  const context = bouwStrategischeContext({
    sri,
    drift,
    riskEvolution,
    governance,
    patternLearning,
    boardSummary,
  });

  return res.json({
    gegenereerd_op: nuIso(),
    organisatie_id: organisatieId || null,
    context,
    sri,
    drift,
    risk_evolution: riskEvolution,
    governance,
    pattern_learning: patternLearning,
    decision_intelligence: decisionIntelligence,
    board_summary: boardSummary,
  });
});

router.get("/sri", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const dagen = clamp(parseIntOr(req.query.days, 90), 7, 365);
  const payload = await haalSriData(organisatieId, dagen);
  return res.json(payload);
});

router.get("/drift", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalDriftData(organisatieId);
  return res.json(payload);
});

router.get("/risk-evolution", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalRiskEvolutionData(organisatieId);
  return res.json(payload);
});

router.get("/risk", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalRiskEvolutionData(organisatieId);
  return res.json(payload);
});

router.get("/governance", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalGovernanceData(organisatieId);
  return res.json(payload);
});

router.get("/pattern-learning", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalPatternLearningData(organisatieId);
  return res.json(payload);
});

router.get("/decision-intelligence", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalDecisionIntelligenceData(organisatieId);
  return res.json(payload);
});

router.get("/board-summary", async (req, res) => {
  if (!checkClient()) return stuurClientError(res, 500, "Supabase configuratie ontbreekt op server.");

  const organisatieId = organisatieIdUitQuery(req);
  const payload = await haalBoardSummaryData(organisatieId);
  return res.json(payload);
});

export default router;
