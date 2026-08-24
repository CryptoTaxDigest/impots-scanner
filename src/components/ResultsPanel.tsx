import type { ScanResult } from "../parser/types";
import { PLATFORM_HINTS } from "../parser/mappers";

const KIND_LABELS: Record<string, string> = {
  bank: "Compte bancaire",
  crypto: "Actifs numériques",
  insurance: "Assurance-vie",
  other: "Autre",
};

const SOURCE_LABELS: Record<string, string> = {
  prefilled: "Prérempli par la DGFiP",
  declared: "Déclaré par vous",
  unknown: "Source non déterminée",
};

export function ResultsPanel({
  result,
  onDownload,
  embed: _embed,
}: {
  result: ScanResult;
  onDownload: () => void;
  embed: boolean;
}) {
  const { accounts, warnings, metadata } = result;
  const cryptoCount = accounts.filter((a) => a.kind === "crypto").length;
  const bankCount = accounts.filter((a) => a.kind === "bank").length;

  return (
    <section className="panel results" aria-live="polite">
      <div className="results__summary">
        <div className="stat">
          <span className="stat__value">{accounts.length}</span>
          <span className="stat__label">compte{accounts.length > 1 ? "s" : ""} détecté{accounts.length > 1 ? "s" : ""}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{bankCount}</span>
          <span className="stat__label">bancaires</span>
        </div>
        <div className="stat">
          <span className="stat__value">{cryptoCount}</span>
          <span className="stat__label">crypto / PSAN</span>
        </div>
      </div>

      {warnings.map((w) => (
        <p key={w} className="warning">{w}</p>
      ))}

      {accounts.length === 0 ? (
        <p className="muted">
          Essayez un export DPR plus récent, ou vérifiez que vos annexes 3916 sont bien incluses dans l&apos;export.
        </p>
      ) : (
        <ul className="account-list">
          {accounts.map((a) => (
            <li key={a.id} className="account-card">
              <div className="account-card__head">
                <span className={`badge badge--${a.kind}`}>{KIND_LABELS[a.kind]}</span>
                <span className="badge badge--source">{SOURCE_LABELS[a.source]}</span>
              </div>
              <h3>{a.institution}</h3>
              <dl className="account-card__meta">
                {a.country && (
                  <>
                    <dt>Pays</dt>
                    <dd>{a.country}</dd>
                  </>
                )}
                {a.accountRef && (
                  <>
                    <dt>Référence</dt>
                    <dd>{a.accountRef}</dd>
                  </>
                )}
                {a.openedAt && (
                  <>
                    <dt>Ouverture</dt>
                    <dd>{a.openedAt}</dd>
                  </>
                )}
                {a.closedAt && (
                  <>
                    <dt>Clôture</dt>
                    <dd>{a.closedAt}</dd>
                  </>
                )}
              </dl>
              {a.platformHint && (
                <p className="account-card__link">
                  Plateforme reconnue : {PLATFORM_HINTS[a.platformHint]?.label ?? a.platformHint}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="results__actions">
        <button type="button" className="btn btn--primary" onClick={onDownload}>
          Télécharger le rapport (.md)
        </button>
      </div>

      <p className="muted results__meta">
        Fichier : {metadata.fileName} · Format : {metadata.format.toUpperCase()} ·{" "}
        {new Date(metadata.parsedAt).toLocaleString("fr-FR")}
      </p>
    </section>
  );
}
