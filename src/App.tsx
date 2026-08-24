import { useCallback, useMemo, useState } from "react";
import type { ScanResult } from "./parser/types";
import { buildReportMarkdown, scanFile } from "./parser/index";
import { DropZone } from "./components/DropZone";
import { ResultsPanel } from "./components/ResultsPanel";
import { HowToExport } from "./components/HowToExport";

export const COPY = {
  iframeTitle: "Ce que l'État sait sur vous — scan comptes étrangers (3916-BIS)",
  headline: "Ce que l'État sait déjà sur vous",
  lead:
    "Vous savez ce que vous devez déclarer. Mais savez-vous ce que l'administration a déjà enregistré ? Uploadez votre export impots.gouv — résultat en local, rien n'est envoyé.",
  leadEmbed: "Comptes à l'étranger · 3916-BIS · scan local en 30 secondes",
  hook: "Fermez l'écart d'information avant votre déclaration.",
} as const;

export function App({ embed = false }: { embed?: boolean }) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const bytes = await file.arrayBuffer();
      const scan = await scanFile({ fileName: file.name, bytes });
      setResult(scan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback(() => {
    if (!result) return;
    const md = buildReportMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etat-sait-sur-vous-rapport.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const shellClass = useMemo(() => (embed ? "app app--embed" : "app"), [embed]);

  return (
    <div className={shellClass}>
      {!embed && (
        <header className="hero">
          <p className="eyebrow">Open source · analyse locale</p>
          <h1>{COPY.headline}</h1>
          <p className="lead">{COPY.lead}</p>
          <p className="hook">{COPY.hook}</p>
        </header>
      )}

      {embed && (
        <header className="hero hero--compact">
          <h1>{COPY.headline}</h1>
          <p className="lead">{COPY.leadEmbed}</p>
        </header>
      )}

      <section className="panel">
        <DropZone onFile={handleFile} loading={loading} />
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {!result && !loading && <HowToExport compact={embed} />}

      {result && (
        <ResultsPanel result={result} onDownload={downloadReport} embed={embed} />
      )}

      <footer className="footer">
        <p>
          Outil éducatif — pas un conseil fiscal.{" "}
          <a href="https://github.com/CryptoTaxDigest/impots-scanner" target="_blank" rel="noopener noreferrer">
            Code open source
          </a>
        </p>
        {!embed && (
          <p className="footer__note">
            Les logiciels listent ce que <em>vous</em> devez déclarer. Ce scan montre ce que{" "}
            <em>l&apos;État</em> a déjà enregistré — déclarations passées, CRS/FATCA, données préremplies.
          </p>
        )}
      </footer>
    </div>
  );
}
