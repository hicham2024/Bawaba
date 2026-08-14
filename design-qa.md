# Design QA — Accueil Bawaba

Date : 14 août 2026

## Preuves

- Source visuelle : `qa/source-selected.png`
- Implémentation rendue : `qa/implementation-home-final.jpg`
- État soutien rendu : `qa/implementation-support-final.jpg`
- Comparaison groupée : `qa/comparison-home-final-vertical.jpg`
- Comparaison focalisée galerie/soutien : `qa/comparison-focus-final.jpg`
- Viewport de référence normalisé : 1348 × 926 px.
- Viewport de l’implémentation : 1348 × 926 CSS px, densité navigateur standard.
- État comparé : accueil RTL, haut de page, filtres réinitialisés, aucun modal.

## Findings

- Aucun écart P0, P1 ou P2 restant.
- La formulation « الأبحاث والوثائق المنشورة » visible dans le concept a été remplacée intentionnellement, à la demande de l’utilisateur, par « مختارات من ملفات البوابة ».
- L’implémentation utilise les vrais dossiers, images et destinations déjà présents dans Bawaba ; les textes fictifs du concept ne sont pas repris.
- Le soutien est proposé exclusivement par PayPal avec le QR officiel fourni par le propriétaire ; aucune donnée bancaire n’est collectée par le site.

## Surfaces de fidélité

| Surface | Résultat |
|---|---|
| Typographie | Noto Kufi Arabic, graisse et échelle proches du concept ; hiérarchie RTL claire et lisible. |
| Espacement et rythme | Navigation fine, héros patrimonial ample, carte Historio, galerie et soutien alignés sur la composition sélectionnée. |
| Couleurs et tokens | Vert émeraude, ivoire, or et terre cuite cohérents avec le concept et la famille Mourabitoun. |
| Images | Nouveau fond patrimonial optimisé en WebP et vraies images documentaires locales dans les cartes ; aucun emplacement factice. |
| Contenu | Neuf dossiers réels conservés ; titre de section refusé supprimé du code et du rendu. |
| Interactions | Recherche/filtrage, remise à zéro, galerie RTL, modal PayPal et lancement Historio fonctionnels. |
| Responsive | Mise en page une colonne sous 1060 px, galerie tactile, navigation scrollable et modals adaptés sous 720 px. |

## Historique de comparaison

1. Première comparaison : la structure et la palette correspondaient au concept, avec un héros et un panneau de soutien plus lisibles grâce aux vrais contenus.
2. **P2 — navigation de la galerie RTL** : les flèches utilisaient un déplacement horizontal dépendant du navigateur et pouvaient ne pas bouger. Correction : navigation indexée par carte avec `scrollIntoView`, flèches inversées selon le sens RTL.
3. Comparaison post-correction : la galerie se déplace jusqu’à `scrollLeft: -998` après navigation ; aucun écart P0/P1/P2 restant.

## Contrôles navigateur

- Rendu ouvert dans le navigateur cloud : oui.
- Filtre « شارل » : 1 résultat visible ; remise à zéro : 9 résultats.
- Galerie RTL : navigation suivante et précédente testée.
- Soutien : ouverture/fermeture du modal PayPal et affichage du nouveau QR testés.
- Historio : modal ouvert et URL de recherche encodée vérifiée.
- Console applicative : aucune erreur de page ; seuls des messages provenant de l’extension de contrôle du navigateur ont été observés.
- Build Vite : réussi, 15 modules transformés.

## Écarts acceptés

- Les images des cartes sont les documents et couvertures réels de Bawaba, plutôt que les contenus fictifs de l’image générée.
- Le héros est légèrement plus haut afin de préserver la lisibilité du vrai texte arabe et du formulaire Historio.
- Le profil public PayPal peut afficher le nom configuré par son propriétaire au moment de la confirmation du paiement.

## Follow-up Polish

- Aucun écart visuel ou fonctionnel bloquant restant.

final result: passed
