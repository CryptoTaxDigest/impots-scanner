import type { ScanResult } from "../parser/types";
import { PLATFORM_HINTS } from "../parser/mappers";
import { RegularizeLeadForm } from "./RegularizeLeadForm";

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

function VerdictBanner({ result }: { result: ScanResult }) {
  const { indCompteEtranger, annRev } = result;

  if (indCompteEtranger === "1") {
    return (
      <div className="verdict verdict--alert" role="status">
        <p className="verdict__eyebrow">indCompteEtranger = 1</p>
        <h2 className="verdict__title">L&apos;État sait qu&apos;un compte à l&apos;étranger vous est rattaché</h2>
        <p className="verdict__body">
          Si vous ne l&apos;avez pas déclaré (3916 / 3916-BIS), contactez proactivement votre centre des
          Finances publiques{annRev ? ` — données ${annRev}` : ""}.
        </p>
      </div>
    );
  }

  if (indCompteEtranger === "0") {
    return (
      <div className="verdict verdict--ok" role="status">
        <p className="verdict__eyebrow">indCompteEtranger = 0</p>
        <h2 className="verdict__title">Rien de signalé côté comptes à l&apos;étranger</h2>
        <p className="verdict__body">
          Dans vos données préremplies{annRev ? ` (${annRev})` : ""}, l&apos;administration n&apos;a pas
          l&apos;indicateur « compte à l&apos;étranger ». Vous pouvez respirer — mais déclarez quand même
          ce que vous ouvrez cette année.
        </p>
      </div>
    );
  }

  return (
    <div className="verdict verdict--unknown" role="status">
      <p className="verdict__eyebrow">indCompteEtranger introuvable</p>
      <h2 className="verdict__title">JSON incomplet ou mauvaise source</h2>
      <p className="verdict__body">
        Reconnectez-vous sur impots.gouv, ouvrez le lien DPR, et copiez la page JSON entière.
      </p>
    </div>
  );
}

export function ResultsPanel({
  result,
  onDownload,
  embed: _embed,
}: {
  result: ScanResult;
  onDownload: () => void;
  embed: boolean;
}) {
  const { accounts, warnings, metadata, indCompteEtranger, annRev } = result;
  const cryptoCount = accounts.filter((a) => a.kind === "crypto").length;
  const bankCount = accounts.filter((a) => a.kind === "bank").length;

  return (
    <section className="panel results" aria-live="polite">
      <VerdictBanner result={result} />

      {indCompteEtranger === "1" && <RegularizeLeadForm annRev={annRev} />}

      {accounts.length > 0 && (
        <>
          <div className="results__summary">
            <div className="stat">
              <span className="stat__value">{accounts.length}</span>
              <span className="stat__label">
                compte{accounts.length > 1 ? "s" : ""} détaillé{accounts.length > 1 ? "s" : ""}
              </span>
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
        </>
      )}

      {warnings.map((w) => (
        <p key={w} className="warning">
          {w}
        </p>
      ))}

      <div className="results__actions">
        <button type="button" className="btn btn--primary" onClick={onDownload}>
          Télécharger le rapport (.md)
        </button>
      </div>

      <p className="muted results__meta">
        Source : {metadata.fileName} · Format : {metadata.format.toUpperCase()} ·{" "}
        {new Date(metadata.parsedAt).toLocaleString("fr-FR")}
      </p>
    </section>
  );
}
