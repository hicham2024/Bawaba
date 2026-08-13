# Audit des pages de Bawaba

Date : 13 août 2026  
Référence visuelle : `https://mourabitoun.netlify.app/`

## Inventaire et état

| Étape | Publication | État général | Décision |
|---:|---|---|---|
| 1 | Mourabitoun | Excellent | Référence visuelle, aucune modification. |
| 2 | Traités Maroc–Grande-Bretagne | Très bon | Déjà harmonisée : hero monumental, palette vert/or, navigation et papier éditorial. |
| 3 | Frontières et traité de Lalla Maghnia | Très bon | Déjà harmonisée et sans débordement. |
| 4 | Touat, Gourara et Tidikelt | Très bon | Déjà harmonisée, archives et sommaire fonctionnels. |
| 5 | Algérie, fabrication coloniale | Très bon | Déjà harmonisée, couverture et structure éditoriale cohérentes. |
| 6 | Abdelkader et la France | Très bon | Déjà harmonisée dans `/cadderdz/`, treize archives conservées. |
| 7 | Guerre des Sables | Corrigé | Ancienne version beige remplacée par la refonte Mourabitoun ; dix archives intégrées localement. |
| 8 | Zirides et Hammadides | Corrigé | Ancienne page blanche remplacée par une couverture historique, navigation fixe et article éditorial vert/or. |
| 9 | Charles de Gaulle et l’Algérie | Corrigé | Ancienne interface bleu SaaS remplacée par une couverture archivistique et le système visuel Mourabitoun. |

## Problèmes corrigés

- Les trois pages restantes n’avaient pas la même présence visuelle que Mourabitoun.
- La page Guerre des Sables utilisée par Bawaba pointait encore vers l’ancienne version Netlify.
- Les pages Zirides/Hammadides et De Gaulle ne possédaient ni couverture immersive, ni navigation persistante, ni retour cohérent vers le portail.
- Les destinations de ces trois cartes dépendaient de sites Netlify séparés et non de la base GitHub Bawaba.
- Bawaba contenait une référence d’image de fond inexistante, supprimée pour éviter un avertissement de build.

## Vérifications

- Les neuf cartes du portail sont présentes.
- Recherche interne testée avec « ديغول » : une seule publication affichée, puis réinitialisation à neuf résultats.
- Fenêtre de soutien PayPal et QR testés.
- Toutes les ancres des trois pages corrigées pointent vers une section existante.
- Aucun débordement horizontal au viewport de contrôle 1363 × 936.
- Aucun message d’erreur provenant de l’application dans la console.
- Les dix archives Guerre des Sables sont locales ; la dernière archive est chargée après navigation vers la conclusion.
- Les huit destinations publiques existantes contrôlées répondent en HTTP 200 avant publication.

## Limites de l’audit

Les captures et la comparaison visuelle ont été réalisées dans le navigateur cloud. Les risques d’accessibilité visibles ont été contrôlés (contraste, structure des titres, textes alternatifs, taille des liens), mais cela ne constitue pas un audit WCAG exhaustif avec lecteur d’écran.

