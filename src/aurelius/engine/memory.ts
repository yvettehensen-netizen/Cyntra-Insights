// src/aurelius/engine/memory.ts
import { supabase } from "../../lib/supabaseClient";

interface UserContext {
  userId: string;
  companyName?: string;
  industry?: string;
  revenue?: string;
  employees?: number;
  preferences?: Record<string, any>;
  lastAnalysis?: Date;
}

interface AnalysisHistoryEntry {
  id?: string;
  userId: string;
  analysisType: string;
  input: any;
  output: any;
  timestamp: Date;
}

export class AureliusMemory {
  private localStorageKey = "aurelius_user_context";

  /**
   * Slaat user context op in localStorage en Supabase (indien ingelogd)
   */
  async storeUserContext(context: UserContext): Promise<void> {
    // Local fallback
    localStorage.setItem(this.localStorageKey, JSON.stringify(context));

    // Supabase sync als user ingelogd is
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        company_name: context.companyName,
        industry: context.industry,
        revenue: context.revenue,
        employees: context.employees,
        preferences: context.preferences,
        updated_at: new Date().toISOString(),
      })
      .select();
  }

  /**
   * Haalt user context op – eerst local, dan Supabase
   */
  async getUserContext(): Promise<UserContext | null> {
    // Probeer localStorage eerst
    const localData = localStorage.getItem(this.localStorageKey);
    if (localData) {
      try {
        return JSON.parse(localData) as UserContext;
      } catch {
        // corrupt data – clean up
        localStorage.removeItem(this.localStorageKey);
      }
    }

    // Fallback naar Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return null;

    const context: UserContext = {
      userId: user.id,
      companyName: data.company_name,
      industry: data.industry,
      revenue: data.revenue,
      employees: data.employees,
      preferences: data.preferences || {},
    };

    // Sync naar localStorage voor offline gebruik
    localStorage.setItem(this.localStorageKey, JSON.stringify(context));

    return context;
  }

  /**
   * Update specifieke velden in user context
   */
  async updateCompanyProfile(profile: Partial<UserContext>): Promise<void> {
    const existing = await this.getUserContext();
    const updated: UserContext = {
      userId: existing?.userId || "anonymous",
      ...existing,
      ...profile,
    };
    await this.storeUserContext(updated);
  }

  /**
   * Slaat analyse op in Supabase history
   */
  async appendAnalysisHistory(entry: AnalysisHistoryEntry): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("User not authenticated – analysis not saved to history");
      return null;
    }

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        analysis_type: entry.analysisType,
        analysis_name: `${entry.analysisType.charAt(0).toUpperCase() + entry.analysisType.slice(1)} Analyse`,
        input_data: entry.input,
        result: entry.output,
        status: "completed",
        created_at: entry.timestamp.toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save analysis to Supabase:", error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Haalt laatste analyse op (optioneel gefilterd op type)
   */
  async getLastAnalysis(analysisType?: string): Promise<any | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let query = supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (analysisType) {
      query = query.eq("analysis_type", analysisType);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;

    return {
      id: data.id,
      type: data.analysis_type,
      name: data.analysis_name,
      input: data.input_data,
      output: data.result,
      timestamp: new Date(data.created_at),
    };
  }

  /**
   * Haalt recente analyse geschiedenis op
   */
  async getAnalysisHistory(limit: number = 10): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      type: item.analysis_type,
      name: item.analysis_name || `${item.analysis_type} Analyse`,
      timestamp: new Date(item.created_at),
    }));
  }

  /**
   * Wist lokale context (bij logout bijv.)
   */
  clearLocalContext(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  /**
   * Anonymiseert gevoelige data voordat opslag of logging
   */
  anonymizeData<T extends Record<string, any>>(data: T): T {
    const anonymized = { ...data };
    const sensitiveFields = ["email", "phone", "address", "ssn", "bankAccount", "password", "token"];

    for (const key in anonymized) {
      if (Object.prototype.hasOwnProperty.call(anonymized, key)) {
        if (sensitiveFields.includes(key)) {
          anonymized[key] = "[REDACTED]" as any;
        } else if (typeof anonymized[key] === "string" && anonymized[key].includes("@")) {
          anonymized[key] = "[EMAIL_REDACTED]" as any;
        }
      }
    }

    return anonymized;
  }
}

// Singleton instance
export const aureliusMemory = new AureliusMemory();