import { describe, expect, it } from "vitest";
import { scanFile } from "./index";

const FIXTURE = {
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

describe("scanFile", () => {
  it("parses JSON DPR export with 3916 accounts", async () => {
    const bytes = new TextEncoder().encode(JSON.stringify(FIXTURE));
    const result = await scanFile({ fileName: "dpr-2025.json", bytes: bytes.buffer as ArrayBuffer });

    expect(result.accounts.length).toBe(2);
    expect(result.accounts[0].institution).toContain("REVOLUT");
    expect(result.accounts[0].kind).toBe("bank");
    expect(result.accounts[1].kind).toBe("crypto");
    expect(result.accounts[1].platformHint).toBe("binance");
    expect(result.taxYears).toContain("2025");
  });

  it("rejects unsupported formats", async () => {
    const bytes = new TextEncoder().encode("not json");
    await expect(scanFile({ fileName: "data.csv", bytes: bytes.buffer as ArrayBuffer })).rejects.toThrow(
      /Format non supporté/,
    );
  });
});
