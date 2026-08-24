import JSZip from "jszip";
import type { AccountSource, ForeignAccount, ScanInput, ScanResult } from "./types";
import { accountFromRecord, dedupeAccounts, pickString } from "./mappers";

const FORM_HINTS = ["3916", "3916B", "3916-BIS", "3916BIS", "3916-bis"];
const ACCOUNT_ARRAY_KEYS = [
  "comptes",
  "compte",
  "accounts",
  "listeComptes",
  "comptesEtrangers",
  "comptesActifsNumeriques",
  "declarations",
  "lignes",
];

export async function scanFile(input: ScanInput): Promise<ScanResult> {
  const lower = input.fileName.toLowerCase();
  const parsedAt = new Date().toISOString();
  const warnings: string[] = [];
  let format: ScanResult["metadata"]["format"] = "unknown";
  let jsonPayload: unknown;

  if (lower.endsWith(".zip")) {
    jsonPayload = await extractJsonFromZip(input.bytes, warnings);
    format = "rgpd";
  } else if (lower.endsWith(".json")) {
    jsonPayload = JSON.parse(new TextDecoder().decode(input.bytes));
    format = "dpr";
  } else {
    throw new Error("Format non supporté. Utilisez un fichier .json ou .zip exporté depuis impots.gouv.");
  }

  const taxYears = extractTaxYears(jsonPayload);
  const accounts = extractAccounts(jsonPayload);

  if (accounts.length === 0) {
    warnings.push(
      "Aucun compte à l'étranger détecté dans ce fichier. L'export peut être incomplet, ou les comptes 3916 ne sont pas inclus dans votre export DPR.",
    );
  }

  return {
    accounts: dedupeAccounts(accounts),
    taxYears,
    warnings,
    metadata: {
      fileName: input.fileName,
      parsedAt,
      format,
      accountCount: accounts.length,
    },
  };
}

async function extractJsonFromZip(bytes: ArrayBuffer, warnings: string[]): Promise<unknown> {
  const zip = await JSZip.loadAsync(bytes);
  const jsonFiles = Object.keys(zip.files).filter((n) => n.toLowerCase().endsWith(".json"));

  if (jsonFiles.length === 0) {
    throw new Error("Aucun fichier JSON trouvé dans l'archive ZIP.");
  }

  if (jsonFiles.length > 1) {
    warnings.push(`Archive contenant ${jsonFiles.length} fichiers JSON — analyse du plus pertinent.`);
  }

  const preferred =
    jsonFiles.find((n) => /dpr|declaration|impot|fiscal/i.test(n)) ?? jsonFiles[0];
  const content = await zip.file(preferred)!.async("string");
  return JSON.parse(content);
}

function extractTaxYears(payload: unknown): string[] {
  const years = new Set<string>();
  walk(payload, (key, value) => {
    if (/annee|year|mill[eé]sime/i.test(key) && (typeof value === "number" || typeof value === "string")) {
      years.add(String(value).slice(0, 4));
    }
    if (typeof value === "string" && /20\d{2}/.test(value) && key.toLowerCase().includes("annee")) {
      years.add(value.slice(0, 4));
    }
  });
  return [...years].sort();
}

function extractAccounts(payload: unknown): ForeignAccount[] {
  const accounts: ForeignAccount[] = [];
  let index = 0;

  walk(payload, (key, value, path) => {
    const keyUpper = key.toUpperCase();
    const in3916Context = FORM_HINTS.some((h) => path.toUpperCase().includes(h) || keyUpper.includes(h));

    if (Array.isArray(value) && (in3916Context || ACCOUNT_ARRAY_KEYS.includes(key.toLowerCase()))) {
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const acc = accountFromRecord(item as Record<string, unknown>, inferSource(path), index++);
          if (acc) accounts.push(acc);
        }
      }
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const obj = value as Record<string, unknown>;
      const looksLikeAccount =
        in3916Context ||
        pickString(obj, ["nomEtablissement", "nomPSAN", "iban", "numeroCompte"]) !== undefined;

      if (looksLikeAccount && pickString(obj, ["nomEtablissement", "nomPSAN", "nomOrganisme", "iban"])) {
        const acc = accountFromRecord(obj, inferSource(path), index++);
        if (acc) accounts.push(acc);
      }
    }
  });

  return accounts;
}

function inferSource(path: string): AccountSource {
  const p = path.toLowerCase();
  if (p.includes("prefill") || p.includes("prerempl") || p.includes("dpr")) return "prefilled";
  if (p.includes("declar") || p.includes("saisie")) return "declared";
  return "unknown";
}

function walk(
  node: unknown,
  visit: (key: string, value: unknown, path: string) => void,
  path = "",
): void {
  if (node === null || node === undefined) return;

  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, visit, `${path}[${i}]`));
    return;
  }

  if (typeof node !== "object") return;

  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const nextPath = path ? `${path}.${key}` : key;
    visit(key, value, nextPath);
    walk(value, visit, nextPath);
  }
}

export function buildReportMarkdown(result: ScanResult): string {
  const lines = [
    "# Rapport — Ce que l'État sait déjà sur vous",
    "",
    `Fichier : ${result.metadata.fileName}`,
    `Analysé le : ${new Date(result.metadata.parsedAt).toLocaleString("fr-FR")}`,
    `Comptes détectés : ${result.accounts.length}`,
    "",
    "> Outil éducatif open source. Pas un conseil fiscal.",
    "",
  ];

  if (result.taxYears.length) {
    lines.push(`Années fiscales repérées : ${result.taxYears.join(", ")}`, "");
  }

  if (result.accounts.length === 0) {
    lines.push("Aucun compte à l'étranger extrait de cet export.", "");
  } else {
    lines.push("## Comptes à l'étranger", "");
    for (const a of result.accounts) {
      lines.push(`### ${a.institution}`);
      lines.push(`- Type : ${kindLabel(a.kind)}`);
      if (a.country) lines.push(`- Pays : ${a.country}`);
      if (a.accountRef) lines.push(`- Référence : ${a.accountRef}`);
      if (a.openedAt) lines.push(`- Ouverture : ${a.openedAt}`);
      if (a.closedAt) lines.push(`- Clôture : ${a.closedAt}`);
      lines.push(`- Source dans l'export : ${sourceLabel(a.source)}`);
      lines.push("");
    }
  }

  if (result.warnings.length) {
    lines.push("## Avertissements", "");
    for (const w of result.warnings) lines.push(`- ${w}`);
  }

  return lines.join("\n");
}

function kindLabel(kind: ForeignAccount["kind"]): string {
  const map = { bank: "Compte bancaire", crypto: "Actifs numériques / PSAN", insurance: "Assurance-vie", other: "Autre" };
  return map[kind];
}

function sourceLabel(source: AccountSource): string {
  const map = { prefilled: "Prérempli DGFiP", declared: "Déclaré", unknown: "Non déterminé" };
  return map[source];
}
