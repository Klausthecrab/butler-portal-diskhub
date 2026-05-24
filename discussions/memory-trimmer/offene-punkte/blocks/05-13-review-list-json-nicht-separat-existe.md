### #13 — 🔗 review-list.json nicht separat existent
*— · 24.05.2026*

▌Problem:
Die Zielbedingung in B3 (und history-summaries) referenziert `review-list.json` als Datenquelle. Diese Datei existiert nicht als separates JSON — die review_list-Daten stecken in `trimmer-*.json` unter `steps[].step="review_list"`.

▌Ziel:
Konsistente Datenquelle — entweder review-list.json extrahieren oder Doku anpassen.

▌Optionen:
1. review-list.json als separates Artefakt beim Trimmer-Lauf erzeugen
2. Endpunkt-Doku korrigieren, dass Daten aus trimmer-Logs stammen
3. History-Summaries-Parser auf trimmer-Logs statt review-list.json umstellen

▌Aufwand: Gering
