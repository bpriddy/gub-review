/**
 * Types mirroring the GUB backend's ReviewSession shape.
 *
 * Kept here (not imported from the backend SDK) because the review page
 * is a magic-link UI for Drive proposals — the backend's drive.review.ts
 * owns the canonical types, and they're stable. If the backend changes
 * the wire shape, this file must match.
 *
 * Source: gcp-universal-backend/src/modules/integrations/google-drive/drive.review.ts
 */

export interface Reviewer {
  id: string;
  email: string;
  fullName: string;
}

export interface FieldChangeItem {
  proposalId: string;
  entityType: 'account' | 'campaign';
  entityId: string;
  entityName: string;
  property: string;
  currentValue: unknown;
  proposedValue: unknown;
  reasoning: string | null;
  confidence: number | null;
  sourceFileIds: string[];
  expiresAt: string;
  createdAt: string;
}

export interface AdditionalUpdateItem {
  text: string;
  source_file_ids: string[];
}

/**
 * Batched unstructured updates for status synthesis. Served by the backend;
 * this UI does not render decision cards for them yet — they stay pending
 * until that surface lands.
 */
export interface AdditionalUpdate {
  proposalId: string;
  entityType: 'account' | 'campaign';
  entityId: string;
  entityName: string;
  items: AdditionalUpdateItem[];
  sourceFileIds: string[];
  expiresAt: string;
  createdAt: string;
}

/**
 * One insight_op review card (D7 #43). `text` is the op's final insight
 * text (for UPDATE, the merged newText). `targetText`/`targetStale` let the
 * UI render old→new and pre-warn when approval would reject as stale (the
 * target moved since propose — B1's optimistic-concurrency ruling).
 */
export interface InsightOpItem {
  proposalId: string;
  entityType: 'account' | 'campaign';
  /** Container entity id; null for an unresolved new-campaign candidate. */
  entityId: string | null;
  entityName: string;
  op: 'ADD' | 'UPDATE' | 'SUPERSEDE';
  text: string;
  targetInsightId: string | null;
  /** Current text of the target insight (UPDATE/SUPERSEDE), if it still exists. */
  targetText: string | null;
  /** True when the target moved/vanished since propose — approve will reject as stale. */
  targetStale: boolean;
  unresolvedEntity: boolean;
  reasoning: string | null;
  confidence: number | null;
  sourceFileIds: string[];
  expiresAt: string;
  createdAt: string;
}

export interface NewEntityGroupField {
  proposalId: string;
  property: string;
  proposedValue: unknown;
}

export interface NewEntityGroup {
  proposalGroupId: string;
  entityType: 'account' | 'campaign';
  parentAccountId: string | null;
  parentAccountName: string | null;
  sourceDriveFolderId: string;
  fields: NewEntityGroupField[];
  /**
   * Discovery-time observations riding inside the group (Phase 7). Not
   * rendered/editable in this UI yet; approving the group applies the
   * stored items as-is.
   */
  observations: AdditionalUpdateItem[];
  /** Server-internal reference; the client never sends it back. */
  attachedAdditionalUpdateProposalId: string | null;
  reasoning: string | null;
  confidence: number | null;
  sourceFileIds: string[];
  expiresAt: string;
  createdAt: string;
}

export interface ReviewSession {
  reviewer: Reviewer;
  fieldChanges: FieldChangeItem[];
  newEntityGroups: NewEntityGroup[];
  additionalUpdates: AdditionalUpdate[];
  insightOps: InsightOpItem[];
  entitySnapshots: Record<string, Record<string, string | null>>;
  proposalTtlDays: number | null;
}

export type Decision =
  | {
      proposalId: string;
      decision: 'approve' | 'reject';
      /** Only meaningful for kind='field_change'. */
      overrideValue?: string | null;
      /** Only meaningful for kind='additional_update' (no UI here yet). */
      overrideItems?: AdditionalUpdateItem[];
    }
  | {
      proposalGroupId: string;
      decision: 'approve' | 'reject';
      fieldOverrides?: Record<string, string | null>;
      /** Edited observations for the attached additional_update (no UI here yet). */
      overrideObservations?: AdditionalUpdateItem[];
    };

export interface ApplyDecisionsResult {
  approved: number;
  rejected: number;
  errors: Array<{ target: string; reason: string }>;
  /** Per-entity outcome of the post-approval status_markdown synthesis. */
  synthesized: Array<{
    entityType: 'account' | 'campaign';
    entityId: string;
    entityName: string;
    status: 'ok' | 'failed';
    error?: string;
  }>;
}
