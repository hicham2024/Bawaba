# Bawaba — بوابة البحوث التاريخية

Portail arabe de recherches historiques et de documents d’archives.

## Développement local

```bash
npm install
npm run dev
```

## Build Netlify

```bash
npm run build
```

Netlify publie `dist/client` selon `netlify.toml`.

## Vérification du référencement

Après la compilation, lancer `node scripts/check-seo.mjs` pour vérifier que le
catalogue est disponible sans JavaScript et que les URL du sitemap correspondent
aux pages publiées et à leurs adresses canoniques.

Le catalogue de l'accueil est défini directement dans les cartes HTML de
`index.html`. Les filtres utilisent leurs attributs `data-era` et `data-topic`.
Pour ajouter une recherche, ajouter une carte et son URL dans
`public/sitemap.xml`. Ne pas ajouter les pages de paiement ou d'administration.
Les dates `lastmod` sont omises tant qu'elles ne peuvent pas être maintenues
fidèlement. Après publication, soumettre le sitemap dans Google Search Console
et inspecter les nouvelles pages ; le dépôt ne donne pas accès aux statistiques
ni à l'état d'indexation Google.

## Paiement par virement bancaire

Le parcours client est disponible dans `acheter.html`. Chaque demande reçoit une référence unique, puis apparaît dans `/admin-bank-transfer.html`. Après contrôle du virement dans ING, le bouton de validation envoie automatiquement le PDF avec Resend.

Variables Netlify nécessaires :

- `BANK_TRANSFER_ADMIN_KEY` : clé d’accès à la page de validation (à défaut, `WERO_ADMIN_KEY` est acceptée).
- `RESEND_API_KEY` : clé API Resend.
- `RESEND_FROM_EMAIL` : expéditeur vérifié sur le domaine `bawaba.eu`, par exemple `Bawaba <envoi@bawaba.eu>`.
- `BANK_TRANSFER_IBAN` : facultative pour remplacer l’IBAN configuré pour le compte ING.

Les études intégrées au dépôt se trouvent dans :

- `cadderdz/`
- `treaties/`
- `guerredesables/`
- `banihamad/`
- `degaulle/`

Voir `AUDIT-PAGES.md` et `design-qa.md` pour les contrôles de design et de fonctionnement.
plusieurs liens
