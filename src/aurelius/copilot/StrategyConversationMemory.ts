export type StrategyConversationRole = "ceo" | "copilot";

export type StrategyConversationTurn = {
  role: StrategyConversationRole;
  message: string;
  created_at: string;
};

export type StrategyConversation = {
  conversation_id: string;
  created_at: string;
  updated_at: string;
  turns: StrategyConversationTurn[];
};

const KEY = "cyntra_strategy_copilot_memory_v1";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function readAll(): Record<string, StrategyConversation> {
  try {
    const storage = globalThis.localStorage;
    const raw = storage?.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StrategyConversation>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StrategyConversation>): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(data));
  } catch {
    // best effort
  }
}

function createId(): string {
  return `copilot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class StrategyConversationMemory {
  readonly name = "Strategy Conversation Memory";

  ensureConversation(conversationId?: string): StrategyConversation {
    const all = readAll();
    const id = normalize(conversationId) || createId();
    const existing = all[id];
    if (existing) return existing;

    const created: StrategyConversation = {
      conversation_id: id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      turns: [],
    };
    all[id] = created;
    writeAll(all);
    return created;
  }

  appendTurn(conversationId: string, role: StrategyConversationRole, message: string): StrategyConversation {
    const all = readAll();
    const base = this.ensureConversation(conversationId);
    const id = base.conversation_id;
    const conversation = all[id] ?? base;

    conversation.turns.push({
      role,
      message: normalize(message),
      created_at: new Date().toISOString(),
    });
    conversation.updated_at = new Date().toISOString();

    all[id] = conversation;
    writeAll(all);
    return conversation;
  }

  getConversation(conversationId: string): StrategyConversation {
    return this.ensureConversation(conversationId);
  }

  getRecentContext(conversationId: string, limit = 6): string {
    const conversation = this.ensureConversation(conversationId);
    return conversation.turns
      .slice(-Math.max(1, limit))
      .map((turn) => `${turn.role.toUpperCase()}: ${turn.message}`)
      .join("\n");
  }
}
