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

## Paiements et notifications (octobre 2026)

L’article `/algerie-ottomane/` reste gratuit. `almoravides-research` est
le livre Mourabitoun en arabe, à 9,99 EUR, livré manuellement. Les livres
jeunesse restent à 4,99 EUR avec leur livraison numérique existante.
La validation administrative d’un virement recherche marque `paid_manual`
sans exiger de PDF dans le stockage privé.

`netlify/lib/payments.mjs` centralise les prix et la vérification PayPal.
Tous les paiements confirmés déclenchent un e-mail à
`oueledsanhaja@gmail.com`. Les commandes restent enregistrées dans
`paypal-orders` et les notifications dans `payment-notifications`.
Les échecs temporaires sont repris toutes les dix minutes par la fonction
planifiée `payment-notification-retry`. Une acceptation par Resend ne prouve
pas la réception dans la boîte de destination : contrôler aussi ses événements
et les indésirables lors de l’achat réel de validation.

Variables serveur requises : `PAYPAL_ENV=live`, `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (expéditeur
vérifié). Ne jamais placer ces secrets dans le frontend.

Tests : `node --test tests/payments.test.mjs`, `npm run build`,
`node scripts/check-seo.mjs`. Le build utilise explicitement `vite.config.js`
et inclut la page d’achat recherche, les trois versions Ceuta–Melilla et la
navigation des articles. Les publications `/mourabitoun/` et `/lalamaghnia/`
sont des proxys vers des sites distincts : leur code n’est pas dans ce dépôt.
