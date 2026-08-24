export type AccountKind = "bank" | "crypto" | "insurance" | "other";

export type AccountSource = "prefilled" | "declared" | "unknown";

export interface ForeignAccount {
  id: string;
  kind: AccountKind;
  institution: string;
  country?: string;
  accountRef?: string;
  url?: string;
  openedAt?: string;
  closedAt?: string;
  source: AccountSource;
  platformHint?: string;
  confidence: "high" | "medium" | "low";
}

export interface ScanResult {
  accounts: ForeignAccount[];
  taxYears: string[];
  warnings: string[];
  /** DPR flag: "1" = foreign account known to DGFiP, "0" = none flagged. */
  indCompteEtranger: "0" | "1" | null;
  annRev?: string;
  /** DPR email on file (mailDec1) — used to prefill regularization form, never sent unless submitted. */
  mailDec1?: string;
  metadata: {
    fileName: string;
    parsedAt: string;
    format: "dpr" | "rgpd" | "unknown";
    accountCount: number;
  };
}

export interface ScanInput {
  fileName: string;
  bytes: ArrayBuffer;
}
