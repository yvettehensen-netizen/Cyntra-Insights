import type { OrganizationAccount, SubscriptionType } from "./types";

export type SubscriptionPlan = {
  type: SubscriptionType;
  analysesPerMonth: number | null;
  omschrijving: string;
};

const PLANS: Record<SubscriptionType, SubscriptionPlan> = {
  Starter: {
    type: "Starter",
    analysesPerMonth: 3,
    omschrijving: "Starter: 3 analyses per maand",
  },
  Professional: {
    type: "Professional",
    analysesPerMonth: 10,
    omschrijving: "Professional: 10 analyses per maand",
  },
  Enterprise: {
    type: "Enterprise",
    analysesPerMonth: null,
    omschrijving: "Enterprise: onbeperkte analyses",
  },
};

export class SubscriptionManager {
  readonly name = "Subscription Manager";

  getPlan(type: SubscriptionType): SubscriptionPlan {
    return PLANS[type];
  }

  listPlans(): SubscriptionPlan[] {
    return [PLANS.Starter, PLANS.Professional, PLANS.Enterprise];
  }

  canStartAnalysis(
    organization: OrganizationAccount,
    analysesUsedThisMonth: number
  ): { allowed: boolean; reason?: string; remaining: number | null } {
    const plan = this.getPlan(organization.abonnementstype);
    if (plan.analysesPerMonth == null) {
      return { allowed: true, remaining: null };
    }

    const remaining = Math.max(0, plan.analysesPerMonth - analysesUsedThisMonth);
    if (remaining <= 0) {
      return {
        allowed: false,
        remaining,
        reason: `Analysequotum bereikt voor ${plan.type} (${plan.analysesPerMonth} per maand).`,
      };
    }

    return { allowed: true, remaining };
  }
}
