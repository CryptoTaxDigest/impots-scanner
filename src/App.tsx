import { useCallback, useMemo, useState } from "react";
import type { ScanResult } from "./parser/types";
import { buildReportMarkdown, DPR_JSON_URL, scanFile, scanJsonText } from "./parser/index";
import { DropZone } from "./components/DropZone";
import { JsonPaste } from "./components/JsonPaste";
import { ResultsPanel } from "./components/ResultsPanel";
import { HowToExport } from "./components/HowToExport";

export const COPY = {
  iframeTitle: "Ce que l'État sait sur vous — scan comptes étrangers (3916-BIS)",
  headline: "Ce que l'État sait déjà sur vous",
  lead:
    "Connectez-vous sur impots.gouv, ouvrez le lien DPR, collez le JSON — en 30 secondes vous savez si l'administration a déjà un compte à l'étranger à votre nom.",
  leadEmbed: "Comptes à l'étranger · indCompteEtranger · analyse locale",
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

  const handleJson = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const scan = await scanJsonText(text);
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

      <section className="panel panel--steps">
        <div className="steps">
          <a className="steps__link btn btn--secondary" href={DPR_JSON_URL} target="_blank" rel="noopener noreferrer">
            1. Ouvrir le lien DPR (connecté)
          </a>
          <span className="steps__arrow" aria-hidden="true">
            →
          </span>
          <span className="steps__label">2. Coller le JSON</span>
        </div>
        <JsonPaste onAnalyze={handleJson} loading={loading} />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="panel panel--alt">
        <p className="muted panel__alt-label">Ou importez un fichier exporté</p>
        <DropZone onFile={handleFile} loading={loading} />
      </section>

      {!result && !loading && <HowToExport compact={embed} />}

      {result && <ResultsPanel result={result} onDownload={downloadReport} embed={embed} />}

      <footer className="footer">
        <p>
          Outil éducatif — pas un conseil fiscal.{" "}
          <a href="https://github.com/CryptoTaxDigest/impots-scanner" target="_blank" rel="noopener noreferrer">
            Code open source
          </a>
        </p>
        {!embed && (
          <p className="footer__note">
            Les logiciels listent ce que <em>vous</em> devez déclarer. Ce scan lit{" "}
            <code>indCompteEtranger</code> et <code>mailDec1</code> — verdict local, e-mail prérempli si
            besoin.
          </p>
        )}
      </footer>
    </div>
  );
}
