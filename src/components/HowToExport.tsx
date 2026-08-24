import { DPR_JSON_URL } from "../parser/index";

export function HowToExport({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`panel howto${compact ? " howto--compact" : ""}`}>
      <h2>Comment obtenir le JSON</h2>
      <ol>
        <li>
          Connectez-vous sur{" "}
          <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer">
            impots.gouv.fr
          </a>{" "}
          (FranceConnect ou numéro fiscal).
        </li>
        <li>
          Une fois connecté, ouvrez le lien DPR dans le <strong>même navigateur</strong> :{" "}
          <a href={DPR_JSON_URL} target="_blank" rel="noopener noreferrer">
            cfspart.impots.gouv.fr/enp/dpr.do
          </a>
        </li>
        <li>
          Si un JSON s&apos;affiche : sélectionnez tout (<kbd>Ctrl+A</kbd> / <kbd>Cmd+A</kbd>), copiez, et
          collez ci-dessus.
        </li>
        <li>
          L&apos;analyse reste sur votre appareil — seuls <code>indCompteEtranger</code> (verdict) et{" "}
          <code>mailDec1</code> (préremplissage e-mail pour la procédure de régularisation) sont utilisés.
        </li>
      </ol>
      {!compact && (
        <p className="muted">
          <code>indCompteEtranger</code> vaut <strong>1</strong> quand l&apos;administration sait déjà
          qu&apos;un compte à l&apos;étranger vous est rattaché (CRS, FATCA, déclarations passées…).{" "}
          <strong>0</strong> = rien de signalé. <code>mailDec1</code> sert uniquement à préremplir votre
          e-mail si vous demandez la procédure — rien n&apos;est envoyé sans votre accord.
        </p>
      )}
    </section>
  );
}
