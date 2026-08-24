/** DPR field: "1" = administration knows of a foreign account, "0" = none flagged. */
export type IndCompteEtranger = "0" | "1";

const IND_REGEX = /"indCompteEtranger"\s*:\s*"([01])"/;

export function extractIndCompteEtrangerFromText(text: string): IndCompteEtranger | null {
  const match = text.match(IND_REGEX);
  return match ? (match[1] as IndCompteEtranger) : null;
}

export function extractIndCompteEtranger(payload: unknown): IndCompteEtranger | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>).indCompteEtranger;
  if (value === "0" || value === "1") {
    return value;
  }
  if (value === 0 || value === 1) {
    return String(value) as IndCompteEtranger;
  }
  return null;
}

export function extractAnnRev(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }
  const value = (payload as Record<string, unknown>).annRev;
  if (typeof value === "string" || typeof value === "number") {
    return String(value).slice(0, 4);
  }
  return undefined;
}
