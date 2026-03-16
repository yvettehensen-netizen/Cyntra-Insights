import {
  StrategicAutopilotAgent,
  type StrategicAutopilotInput,
  type StrategicAutopilotOutput,
} from "./StrategicAutopilotAgent";

export type SchedulerFrequency = "dagelijks" | "wekelijks";

export type SchedulerConfig = {
  enabled: boolean;
  frequency: SchedulerFrequency;
};

export type SchedulerState = SchedulerConfig & {
  last_run_at: string | null;
  next_run_at: string | null;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export class AutonomousAnalysisScheduler {
  readonly name = "Autonomous Analysis Scheduler";

  private state: SchedulerState = {
    enabled: false,
    frequency: "dagelijks",
    last_run_at: null,
    next_run_at: null,
  };

  constructor(private readonly agent = new StrategicAutopilotAgent()) {}

  configure(config: Partial<SchedulerConfig>): SchedulerState {
    this.state = {
      ...this.state,
      ...config,
    };
    if (!this.state.enabled) {
      this.state.next_run_at = null;
      return this.getState();
    }
    const now = new Date();
    this.state.next_run_at = this.computeNextRun(now).toISOString();
    return this.getState();
  }

  getState(): SchedulerState {
    return { ...this.state };
  }

  private computeNextRun(from: Date): Date {
    return this.state.frequency === "wekelijks" ? addDays(from, 7) : addDays(from, 1);
  }

  async runNow(input: StrategicAutopilotInput): Promise<StrategicAutopilotOutput> {
    const result = await this.agent.run(input);
    const now = new Date();
    this.state.last_run_at = now.toISOString();
    this.state.next_run_at = this.state.enabled ? this.computeNextRun(now).toISOString() : null;
    return result;
  }

  async runIfDue(input: StrategicAutopilotInput, now = new Date()): Promise<StrategicAutopilotOutput | null> {
    if (!this.state.enabled || !this.state.next_run_at) return null;
    if (now < new Date(this.state.next_run_at)) return null;
    return this.runNow(input);
  }
}

