import type { AnalysisSession, OrganizationAccount, SubscriptionType } from "./types";
import { OrganizationAccountManager } from "./OrganizationAccountManager";
import { AnalysisSessionManager } from "./AnalysisSessionManager";
import { ReportDeliveryService } from "./ReportDeliveryService";
import { SubscriptionManager } from "./SubscriptionManager";
import { StrategicDatasetCollector } from "./StrategicDatasetCollector";
import {
  OrganisationDiscoveryEngine,
  OrganisationDataCollector,
  StrategicContextBuilder,
  type DiscoveredOrganisation,
} from "@/aurelius/discovery";

export class SaaSPlatformFacade {
  readonly organizations = new OrganizationAccountManager();
  readonly sessions = new AnalysisSessionManager();
  readonly reports = new ReportDeliveryService();
  readonly subscriptions = new SubscriptionManager();
  readonly datasetCollector = new StrategicDatasetCollector();
  readonly discovery = new OrganisationDiscoveryEngine();
  readonly dataCollector = new OrganisationDataCollector();
  readonly contextBuilder = new StrategicContextBuilder();
  private readonly enforceQuota =
    String((import.meta as any)?.env?.VITE_ENFORCE_ANALYSIS_QUOTA || "false").toLowerCase() === "true";

  ensureOrganization(input: {
    organization_id?: string;
    organisatie_naam: string;
    sector: string;
    organisatie_grootte: string;
    abonnementstype: SubscriptionType;
  }): OrganizationAccount {
    return this.organizations.upsertOrganization(input);
  }

  private resolveOrganizationForAnalysis(input: {
    organization_id: string;
    input_data: string;
    analysis_type?: string;
    organization_name?: string;
    sector?: string;
    organisatie_grootte?: string;
    abonnementstype?: SubscriptionType;
  }): OrganizationAccount {
    const existing = this.organizations.getOrganization(input.organization_id);
    if (existing) return existing;

    return this.organizations.upsertOrganization({
      organization_id: input.organization_id,
      organisatie_naam: input.organization_name || "Herstelde organisatie",
      sector: input.sector || "Onbekende sector",
      organisatie_grootte: input.organisatie_grootte || "Onbekende grootte",
      abonnementstype: input.abonnementstype || "Starter",
    });
  }

  async startStrategischeAnalyse(input: {
    organization_id: string;
    input_data: string;
    analysis_type?: string;
    organization_name?: string;
    sector?: string;
    organisatie_grootte?: string;
    abonnementstype?: SubscriptionType;
  }): Promise<AnalysisSession> {
    const organization = this.resolveOrganizationForAnalysis(input);

    const used = this.sessions.sessionsUsedInCurrentMonth(organization.organization_id);
    const quota = this.subscriptions.canStartAnalysis(organization, used);
    if (!quota.allowed && this.enforceQuota) {
      throw new Error(quota.reason || "Abonnementslimiet bereikt.");
    }

    const created = this.sessions.createSession({
      organization_id: organization.organization_id,
      organization_name: organization.organisatie_naam,
      input_data: input.input_data,
      analysis_type: input.analysis_type,
    });

    const completed = await this.sessions.runSession({
      session_id: created.session_id,
      organization_name: organization.organisatie_naam,
      sector: input.sector || organization.sector,
      current_session: created,
    });

    this.organizations.addAnalysisToOrganization(organization.organization_id, completed.session_id);
    this.datasetCollector.collectFromSession(completed);
    return completed;
  }

  discoverOrganisations(input: { sector: string; zoekterm: string }): DiscoveredOrganisation[] {
    return this.discovery.discover(input);
  }

  async scanOrganisationAndAnalyze(input: {
    organisation_name: string;
    sector: string;
    website?: string;
    location?: string;
    abonnementstype?: SubscriptionType;
  }): Promise<AnalysisSession> {
    const organisation: DiscoveredOrganisation = {
      organisation_name: input.organisation_name,
      sector: input.sector,
      website: input.website || "https://onbekend.example",
      location: input.location || "Onbekende locatie",
    };

    const context = this.dataCollector.collect(organisation);
    const strategicContext = this.contextBuilder.build({ organisationContext: context });

    const org = this.ensureOrganization({
      organisatie_naam: context.bedrijfsnaam,
      sector: context.sector,
      organisatie_grootte: context.aantal_werknemers,
      abonnementstype: input.abonnementstype || "Starter",
    });

    const inputData = [
      strategicContext.organisatiecontext,
      strategicContext.sectorcontext,
      "Strategische spanningen:",
      ...strategicContext.strategische_spanningen.map((item, idx) => `${idx + 1}. ${item}`),
    ].join("\n");

    return this.startStrategischeAnalyse({
      organization_id: org.organization_id,
      input_data: inputData,
      analysis_type: "Organisatie scanner analyse",
    });
  }
}
