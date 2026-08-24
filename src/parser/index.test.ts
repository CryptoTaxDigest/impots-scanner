import { describe, expect, it } from "vitest";
import {
  extractIndCompteEtranger,
  extractIndCompteEtrangerFromText,
  extractMailDec1,
  extractMailDec1FromText,
} from "./ind-compte-etranger";
import { scanFile, scanJsonText } from "./index";

const FIXTURE_3916 = {
  annee: 2025,
  formulaires: {
    "3916": {
      comptes: [
        {
          type: "bancaire",
          nomEtablissement: "REVOLUT PAYMENTS UAB",
          pays: "LT",
          numeroCompte: "LT601234567890123456",
          dateOuverture: "2019-03-15",
        },
        {
          type: "actifs_numeriques",
          nomPSAN: "BINANCE France SAS",
          pays: "FR",
          url: "https://www.binance.com",
          numeroCompte: "user@example.com",
          dateOuverture: "2020-06-01",
        },
      ],
    },
  },
};

/** Anonymized real-world DPR shape — only indCompteEtranger matters for verdict. */
const FIXTURE_DPR_IND = {
  annRev: "2025",
  spiDec1: "303346435XXXX",
  nmNaiDec1: "DOE",
  prnmDec1: "JANE",
  dateNaisDec1: "01011990",
  lieuNaisDec1: "75 PARIS",
  rib: { ribIban: "FR76XXXX", ribBic: "BANKFRPP" },
  mailDec1: "jane.doe@example.com",
  telDec1: "0600000000",
  indCompteEtranger: "1",
};

describe("indCompteEtranger", () => {
  it("reads flag from JSON object", () => {
    expect(extractIndCompteEtranger(FIXTURE_DPR_IND)).toBe("1");
    expect(extractIndCompteEtranger({ indCompteEtranger: "0" })).toBe("0");
  });

  it("reads flag via regex from raw text without parsing PII", () => {
    const blob = JSON.stringify(FIXTURE_DPR_IND);
    expect(extractIndCompteEtrangerFromText(blob)).toBe("1");
    expect(extractIndCompteEtrangerFromText('  "indCompteEtranger": "0"  ')).toBe("0");
  });
  it("reads mailDec1 from JSON for email prefill", () => {
    expect(extractMailDec1(FIXTURE_DPR_IND)).toBe("jane.doe@example.com");
    expect(extractMailDec1FromText(JSON.stringify(FIXTURE_DPR_IND))).toBe("jane.doe@example.com");
  });
});

describe("scanJsonText", () => {
  it("returns alert verdict when indCompteEtranger is 1", async () => {
    const result = await scanJsonText(JSON.stringify(FIXTURE_DPR_IND));
    expect(result.indCompteEtranger).toBe("1");
    expect(result.annRev).toBe("2025");
    expect(result.mailDec1).toBe("jane.doe@example.com");
  });

  it("returns ok verdict when indCompteEtranger is 0", async () => {
    const result = await scanJsonText(JSON.stringify({ ...FIXTURE_DPR_IND, indCompteEtranger: "0" }));
    expect(result.indCompteEtranger).toBe("0");
  });
});

describe("scanFile", () => {
  it("parses JSON DPR export with 3916 accounts", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify(FIXTURE_3916));
    const result = await scanFile({ fileName: "dpr-2025.json", bytes: bytes.buffer as ArrayBuffer });

    expect(result.accounts.length).toBe(2);
    expect(result.accounts[0].institution).toContain("REVOLUT");
    expect(result.accounts[0].kind).toBe("bank");
    expect(result.accounts[1].kind).toBe("crypto");
    expect(result.accounts[1].platformHint).toBe("binance");
    expect(result.taxYears).toContain("2025");
    expect(result.indCompteEtranger).toBeNull();
  });

  it("rejects unsupported formats", async () => {
    const bytes = new TextEncoder().encode("not json");
    await expect(scanFile({ fileName: "data.csv", bytes: bytes.buffer as ArrayBuffer })).rejects.toThrow(
      /Format non supporté/,
    );
  });
});
