# Design QA — Bawaba

Date : 13 août 2026

## Preuves

- Source visuelle : `https://mourabitoun.netlify.app/`
- Implémentations : `/banihamad/`, `/degaulle/`, `/guerredesables/`, `/treaties/`
- Captures : navigateur cloud, comparaison groupée dans la même entrée visuelle le 13 août 2026.
- Viewport source et implémentations : 1363 × 936 CSS px, densité navigateur standard.
- État comparé : haut de page, navigation fermée, aucun modal.
- Focus complémentaire : sections de conclusion et chargement de la dernière archive Guerre des Sables.

## Surfaces de fidélité

| Surface | Résultat |
|---|---|
| Typographie | Titres arabes monumentaux, corps plus calme et hiérarchie proche de Mourabitoun. |
| Espacement | Hero plein écran, barre supérieure fine, lecture centrée et rythme vertical régulier. |
| Couleurs | Vert profond, doré, blanc cassé et voile brun identiques à la famille visuelle de référence. |
| Images | Vraies images historiques locales, sans hotlink dans le rendu final GitHub. Les crédits sont indiqués. |
| Contenu | Textes, citations, sources et archives d’origine conservés. |
| Interactions | Navigation fixe, sommaires, CTA, conclusion et retour en haut fonctionnels. |
| Responsive | Breakpoints téléphone/tablette présents ; navigation devient scrollable et le contenu passe sur une colonne. |

## Historique de comparaison

1. **P1 — Guerre des Sables** : l’URL publique utilisait encore l’ancienne page beige sans couverture. Correction : intégration de la refonte validée dans le dépôt Bawaba et remplacement du lien par `/guerredesables/`.
2. **P1 — Zirides/Hammadides** : aucune couverture ni identité portail. Correction : photo réelle de la Qal’a, voile vert/brun, titre plein écran, navigation fixe et surfaces éditoriales.
3. **P1 — De Gaulle** : palette bleu SaaS et densité de cartes incompatibles avec Mourabitoun. Correction : portrait d’archive, palette vert/or, hero plein écran, index des chapitres et article crème.
4. **P2 — Bawaba** : image de fond inexistante signalée au build. Correction : suppression de la référence morte ; gradient conservé.
5. Nouvelle comparaison groupée : aucun écart P0/P1/P2 restant.
6. **Contrôle documentaire final — Guerre des Sables** : les dix titres, notices et légendes ont été réalignés sur les pièces réellement affichées. Les anciennes légendes intégrées au bas des reproductions sont masquées par un cadrage mesuré, sans couper le document source.
7. **Traités Maroc–Grande-Bretagne** : la page publique existante a été importée sans changement de structure, son image de couverture a été localisée, son PDF de douze pages a été conservé et la carte Bawaba pointe maintenant vers une route interne.

## Contrôles navigateur

- Page rendue dans le navigateur cloud : oui.
- Interactions principales testées : oui.
- Console applicative : aucune erreur.
- Débordement horizontal : aucun au viewport contrôlé.
- Archives Guerre des Sables : 10/10 présentes, chargement différé vérifié.
- Correspondance titres/documents Guerre des Sables : 10/10 corrigée ; détail conservé dans `AUDIT-GUERRE-DES-SABLES-CONTENU.md` et dans le tableau FigJam d'audit.
- Traités : sept ancres valides, deux groupes d’onglets bilingues fonctionnels et PDF original présent.

## Écarts acceptés

- Chaque couverture utilise une image propre au sujet au lieu de reproduire l’architecture de Marrakech.
- Les pages déjà harmonisées gardent leurs variations éditoriales légères afin de préserver leurs documents et leur structure existante.

final result: passed
