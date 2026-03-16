export type RealityClaim = {
  claim: string;
  evidence: string[];
  grounded: boolean;
};

export type RealityReport = {
  dominantClaims: RealityClaim[];
  contradictorySignals: string[];
  evidenceConfidenceScore: number;
};

function sentences(text: string): string[] {
  return String(text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export class RealityEngine {
  parseEvidence(evidenceText: string): string[] {
    return sentences(evidenceText);
  }

  extractClaims(claimText: string): string[] {
    return sentences(claimText).filter((line) => /[A-Za-zÀ-ÿ]/.test(line));
  }

  validateClaimsAgainstEvidence(claims: string[], evidence: string[]): RealityClaim[] {
    const evidenceLower = evidence.map((item) => item.toLowerCase());
    return claims.map((claim) => {
      const tokens = claim
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 5);
      const matched = evidence.filter((line, index) =>
        tokens.some((token) => evidenceLower[index].includes(token))
      );
      return {
        claim,
        evidence: matched.slice(0, 3),
        grounded: matched.length >= 3,
      };
    });
  }

  detectContradictions(claims: string[], evidence: string[]): string[] {
    const source = `${claims.join("\n")}\n${evidence.join("\n")}`;
    const contradictions: string[] = [];
    if (/bestuurlijke inertie/i.test(source) && /\b(consortium|triage|contract|budget)\b/i.test(source)) {
      contradictions.push(
        "Dominante claim stuurt op bestuurlijke inertie terwijl bewijs sterker wijst op extern gestuurde instroom- en contractlogica."
      );
    }
    return contradictions;
  }

  run(params: { claimText: string; evidenceText: string }): RealityReport {
    const evidence = this.parseEvidence(params.evidenceText);
    const claims = this.extractClaims(params.claimText);
    const dominantClaims = this.validateClaimsAgainstEvidence(claims, evidence);
    const contradictorySignals = this.detectContradictions(claims, evidence);
    const groundedCount = dominantClaims.filter((item) => item.grounded).length;
    const evidenceConfidenceScore =
      dominantClaims.length === 0 ? 0 : Math.round((groundedCount / dominantClaims.length) * 100);

    return {
      dominantClaims,
      contradictorySignals,
      evidenceConfidenceScore,
    };
  }
}
