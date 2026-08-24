export function HowToExport({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`panel howto${compact ? " howto--compact" : ""}`}>
      <h2>Comment obtenir votre export</h2>
      <ol>
        <li>
          Connectez-vous sur{" "}
          <a href="https://www.impots.gouv.fr" target="_blank" rel="noopener noreferrer">
            impots.gouv.fr
          </a>
        </li>
        <li>
          Depuis votre espace particulier, ouvrez la déclaration de revenus ou la rubrique{" "}
          <strong>« Déclaration par un tiers »</strong> (export DPR JSON).
        </li>
        <li>
          Téléchargez le fichier <code>.json</code> des données préremplies, ou votre export de données
          personnelles au format <code>.zip</code> si disponible.
        </li>
        <li>Déposez-le ci-dessus — l&apos;analyse reste sur votre appareil.</li>
      </ol>
      {!compact && (
        <p className="muted">
          L&apos;export DPR contient les informations que l&apos;administration préremplit, y compris les
          comptes à l&apos;étranger déjà connus (formulaires 3916 / 3916-BIS).{" "}
          <a
            href="https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/edi/cdc_edi_ir/edi-ir-vol-iii_2025-04-v2-4.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation EDI-IR (DGFiP)
          </a>
        </p>
      )}
    </section>
  );
}
