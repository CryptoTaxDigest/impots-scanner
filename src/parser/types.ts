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
