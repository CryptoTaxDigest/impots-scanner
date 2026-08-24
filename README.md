# impots-scanner

> **Ce que l'État sait déjà sur vous** — scanner client-side pour exports impots.gouv (3916 / 3916-BIS)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Analyse **localement** votre export de données fiscales françaises et liste les comptes à l'étranger que l'administration a déjà enregistrés.

## Pourquoi cet outil ?

Les logiciels fiscalité crypto répondent à : *« Qu'est-ce que je dois déclarer ? »*

Cet outil répond à : *« Qu'est-ce que l'État sait déjà sur moi ? »*

C'est l'angle mort du **3916-BIS** : la liste des plateformes à déclarer vs. la liste de celles que la DGFiP a déjà via vos déclarations passées, CRS/FATCA, etc.

## Privacy by design

| Donnée | Stockée ? |
|--------|-----------|
| Fichier uploadé (JSON/ZIP) | ❌ Jamais — parsing en mémoire dans le navigateur |
| Comptes extraits | ❌ Jamais |
| Email | ❌ Pas collecté (v1) — téléchargement rapport local uniquement |

Voir [PRIVACY.md](./PRIVACY.md).

## Formats supportés

- **DPR JSON** — export « données préremplies » depuis impots.gouv (`.json`)
- **Archive ZIP** — export de données personnelles contenant un JSON (`.zip`)

Le parser recherche récursivement les structures liées aux formulaires **3916 / 3916-BIS** (comptes bancaires, PSAN/crypto, assurance-vie).

## Usage

### En ligne (GitHub Pages)

```
https://cryptotaxdigest.github.io/impots-scanner/
```

Mode embed (iframe) : ajoutez `?embed=1` à l'URL.

### Développement local

```bash
npm install
npm run dev
npm test
npm run build
```

## Intégrer sur votre site

Voir [docs/embed.md](./docs/embed.md).

## Contribuer

Corrections techniques et améliorations du parser : [CONTRIBUTING.md](./CONTRIBUTING.md) · [Issues](https://github.com/CryptoTaxDigest/impots-scanner/issues).

## Disclaimer

Outil **éducatif** — pas un conseil fiscal, juridique ou comptable. L'export peut être incomplet. Vérifiez toujours sur [impots.gouv.fr](https://www.impots.gouv.fr) et avec un professionnel si besoin.

## Liens

- [Documentation EDI-IR DGFiP (DPR / 3916)](https://www.impots.gouv.fr/sites/default/files/media/1_metier/3_partenaire/edi/cdc_edi_ir/edi-ir-vol-iii_2025-04-v2-4.pdf)
