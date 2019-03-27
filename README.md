# OC-Mentors-DefenseAddOn

Rappel du principe.
Au chargement de la page de soutenance une barre de menu apparait permettant
- de sauvegarder le commentaire saisi
- de recharger un commentaire saisi
- de supprimer les commentaires saisis (supprime tous les commentaires enregistrés dans le stockage local du navigateur)
- de cacher le bandeau d'acceptation des cookies
- saisir un commentaire au format markdown qui sera publié dans l'interface de commentaire de soutenance (après transformation au format html)
- afficher un commentaire écrit dans la zone de saisie de commentaire transformé au format markdown (pour stockage manuel dans un fichier texte)

Nouvelles fonctionnalités:
- définir un commentaire par défaut qui sera proposé dans le commentaire de soutenance
- définir une signature par défaut qui sera ajoutée au commentaire
- définir un prefixe pour positionner devant l'identifiant unique de stockage des commentaires (permet de regrouper les commentaires enregistrés lors de la consultation des données stockées dans le navigateur)

Correction de BUG
L'interface ayant été mise à jour le plugin ne trouvait plus les éléments de reférence, c'est désormais corrigé

ROADMAP
- faire un plugin autonome (ne nécessitant plus tampermonkey ou greasemonkey)
- utiliser un dépot github pour alimenter automatiquement le commentaire par défaut en fonction du projet évalué (un commentaire type par type de projet)
- exporter les commentaire dans un fichier texte (markdown)
- exporter tous les commentaires stockés dans un fichier texte
