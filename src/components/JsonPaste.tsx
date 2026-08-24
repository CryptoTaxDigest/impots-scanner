import { useState } from "react";

export function JsonPaste({
  onAnalyze,
  loading,
}: {
  onAnalyze: (text: string) => void;
  loading: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <div className="json-paste">
      <label className="json-paste__label" htmlFor="dpr-json">
        Collez le JSON affiché par impots.gouv
      </label>
      <textarea
        id="dpr-json"
        className="json-paste__input"
        rows={6}
        spellCheck={false}
        placeholder='{"annRev":"2025", ... "indCompteEtranger":"0"}'
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />
      <div className="json-paste__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={loading || !text.trim()}
          onClick={() => onAnalyze(text)}
        >
          {loading ? "Analyse…" : "Analyser le JSON"}
        </button>
        {text && (
          <button
            type="button"
            className="btn btn--outline"
            disabled={loading}
            onClick={() => setText("")}
          >
            Effacer
          </button>
        )}
      </div>
      <p className="muted json-paste__hint">
        Copiez toute la page (Ctrl+A / Cmd+A) une fois le JSON affiché — seul{" "}
        <code>indCompteEtranger</code> est lu pour le verdict.
      </p>
    </div>
  );
}
