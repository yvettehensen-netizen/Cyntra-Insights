// ============================================================
// src/aurelius/orchestrator/learning/logLearning.ts
// AUDITABLE LEARNING TRACE
// ============================================================

import type { CyntraLearningItem } from "../charter/types";

export interface LearningAuditEntry {
  timestamp: string;
  item: CyntraLearningItem;
}

const auditLog: LearningAuditEntry[] = [];

export function recordLearning(item: CyntraLearningItem) {
  auditLog.push({
    timestamp: new Date().toISOString(),
    item,
  });
}

export function getLearningAuditTrail() {
  return auditLog;
}
