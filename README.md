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
