import type { AccountKind, AccountSource, ForeignAccount } from "./types";

/** Known crypto/fintech labels for display */
export const PLATFORM_HINTS: Record<string, { slug: string; label: string }> = {
  revolut: { slug: "revolut", label: "Revolut" },
  n26: { slug: "n26", label: "N26" },
  binance: { slug: "binance", label: "Binance" },
  kraken: { slug: "kraken", label: "Kraken" },
  coinbase: { slug: "coinbase", label: "Coinbase" },
  bitpanda: { slug: "bitpanda", label: "Bitpanda" },
  swissborg: { slug: "swissborg", label: "SwissBorg" },
  bitstamp: { slug: "bitstamp", label: "Bitstamp" },
  crypto: { slug: "crypto-com", label: "Crypto.com" },
  ledger: { slug: "ledger", label: "Ledger" },
  metamask: { slug: "metamask", label: "MetaMask" },
  wise: { slug: "wise", label: "Wise" },
  traderepublic: { slug: "traderepublic", label: "Trade Republic" },
  degiro: { slug: "degiro", label: "DEGIRO" },
};

const COUNTRY_CODES = new Set([
  "FR", "DE", "GB", "UK", "US", "LT", "LU", "IE", "NL", "BE", "CH", "ES", "IT", "PT", "MT", "CY", "SG", "AE",
]);

export function guessPlatform(institution: string): string | undefined {
  const lower = institution.toLowerCase();
  for (const [needle, meta] of Object.entries(PLATFORM_HINTS)) {
    if (lower.includes(needle)) return meta.slug;
  }
  return undefined;
}

export function normalizeCountry(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim().toUpperCase();
  if (v.length === 2 && COUNTRY_CODES.has(v)) return v;
  if (v.includes("LITUAN")) return "LT";
  if (v.includes("LUXEMB")) return "LU";
  if (v.includes("IRLAND")) return "IE";
  if (v.includes("ALLEMAGNE") || v === "GERMANY") return "DE";
  if (v.includes("ROYAUME") || v.includes("UNITED KINGDOM")) return "GB";
  return v.length <= 3 ? v : undefined;
}

export function inferKind(fields: Record<string, unknown>, institution: string): AccountKind {
  const blob = JSON.stringify(fields).toLowerCase();
  const inst = institution.toLowerCase();
  if (
    blob.includes("actif") && blob.includes("numer") ||
    blob.includes("psan") ||
    blob.includes("crypto") ||
    blob.includes("digital asset") ||
    inst.includes("binance") ||
    inst.includes("kraken") ||
    inst.includes("coinbase")
  ) {
    return "crypto";
  }
  if (
    blob.includes("assurance") ||
    blob.includes("capitalisation") ||
    blob.includes("life insurance")
  ) {
    return "insurance";
  }
  if (
    blob.includes("iban") ||
    blob.includes("bancaire") ||
    blob.includes("bank") ||
    blob.includes("compte")
  ) {
    return "bank";
  }
  return "other";
}

export function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const direct = obj[key];
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    const lowerKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
    if (lowerKey) {
      const v = obj[lowerKey];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return undefined;
}

export function accountFromRecord(
  record: Record<string, unknown>,
  source: AccountSource,
  index: number,
): ForeignAccount | null {
  const institution =
    pickString(record, [
      "nomEtablissement",
      "nomPSAN",
      "nomOrganisme",
      "libelleEtablissement",
      "libelleBanque",
      "denomination",
      "nom",
      "institution",
      "organisme",
      "etablissement",
    ]) ?? "Établissement non identifié";

  if (institution === "Établissement non identifié") {
    const values = Object.values(record).filter((v) => typeof v === "string" && v.length > 3);
    if (values.length === 0) return null;
  }

  const kind = inferKind(record, institution);
  const country = normalizeCountry(
    pickString(record, ["pays", "paysDomiciliation", "country", "codePays", "paysEtablissement"]),
  );
  const accountRef = pickString(record, [
    "numeroCompte",
    "iban",
    "identifiant",
    "numCompte",
    "reference",
    "email",
    "adresseEmail",
  ]);
  const url = pickString(record, ["url", "siteWeb", "urlPSAN"]);
  const openedAt = pickString(record, ["dateOuverture", "dateOuvertureCompte", "dateSouscription"]);
  const closedAt = pickString(record, ["dateCloture", "dateFermeture"]);

  return {
    id: `acc-${index}-${institution.slice(0, 12).replace(/\W/g, "")}`,
    kind,
    institution,
    country,
    accountRef: accountRef ? redactRef(accountRef) : undefined,
    url,
    openedAt,
    closedAt,
    source,
    platformHint: guessPlatform(institution),
    confidence: institution !== "Établissement non identifié" ? "high" : "low",
  };
}

export function redactRef(ref: string): string {
  if (ref.length <= 8) return ref;
  return `${ref.slice(0, 4)}…${ref.slice(-4)}`;
}

export function dedupeAccounts(accounts: ForeignAccount[]): ForeignAccount[] {
  const seen = new Set<string>();
  return accounts.filter((a) => {
    const key = `${a.kind}|${a.institution.toLowerCase()}|${a.accountRef ?? ""}|${a.country ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
