### UI umsortierung
*— · 26.05.2026*

**Problem**
ich möchte im Diskhub UI Dinge ändern:
1) Sub-Diskussionen und Textboxen sollen einheitlich sein:
1.1) wenn "eingeklappt" sollen jeweils nur ein einzeilige Titelzeile angezeigt werden (Akkordeon). Unterschied zwischen Textbox und Sub-Diskussionen: 
Textboxen= abgerundete Ecken. Sub-Diskussion= nicht abgerundete Ecken. 
2) Farbschema von Sub-Diskussionen an Farbschema (grün bei erledigt bspw) von Textboxen übernehmen.
3) Von Oben : erst Inhaltsverzeichnis und dann Boxen & Sub-Diskussionen.
4) Sub-Diskussionen & Textboxen sollen gemeinsam (gemischt) dargestellt werden. in einer Reihe, sortiert nach Nummer bzw Zeitpunkt zu dem sie angelegt wurden. (Neu= unten).
5) "blocks" und "Index": diese beiden Elemente sind in jeder Sub-Diskussion vorhanden. Für mich, in der Nutzung aber als dargestellte Elemente im UI nicht notwendig. Daher mein Vorschlag: diese nicht als eigenständige Sub-Diskussionen anzeigen. Diesen Punkt ganz besonders detailiert mir mit deinen Worten erklären

**Lösung**

### 1) Einheitliches Akkordeon für Sub-Diskussionen & Textboxen
- **Verhalten:** Beide sind zugeklappt = nur eine einzeilige Titelzeile sichtbar. Aufgeklappt = voller Inhalt.
- **Optischer Unterschied:** Textboxen haben `border-radius` (abgerundet), Sub-Diskussionen haben `border-radius: 0` (eckig).
- **Gilt für:** Haupt-Diskussion **und** jede verschachtelte Sub-Diskussion (Punkt 3).

### 2) Farbschema von Sub-Diskussionen
- Sub-Diskussionen übernehmen die gleiche Status-Farbgebung wie Textboxen:
  - Erledigt (`(✓ erledigt)` im Titel) → grüner Header / grüne Border
  - Offen → neutrales Standard-Farbschema
- **Prüfbar:** Eine erledigte Sub-Diskussion zeigt grün, eine offene zeigt Standardfarbe.

### 3) Reihenfolge: Inhaltsverzeichnis → Boxen & Subs
- In **jeder** Diskussionsebene (Haupt + Subs) gilt: Inhaltsverzeichnis (Index/TOC) wird **oberhalb** von Boxen und Sub-Diskussionen gerendert.
- **Prüfbar:** Scrollt man auf eine Diskussion, sieht man zuerst das Inhaltsverzeichnis, darunter die Liste der Textboxen und Sub-Diskussionen.

### 4) Gemischte Darstellung
- Sub-Diskussionen und Textboxen werden in **einer** gemeinsamen Liste dargestellt, nicht getrennt.
- **Sortierung:** Aufsteigend nach Nummer (Präfix im Dateinamen, z.B. `01-`, `02-`, `107-`). Fallback: chronologisch nach Erstelldatum.
- Neue Elemente (höchste Nummer) = **unten**.
- **Prüfbar:** In der Liste sind Sub X, Box Y und Sub Z durcheinander sortiert nach ihrer Nummer, nicht nach Typ getrennt.

### 5) `blocks/` und `index/` Ordner unsichtbar machen
- Die Ordner `blocks/` und `index/` werden nicht als eigene Sub-Diskussionen im UI gelistet.
- **Begründung:** Sie sind interne Strukturordner, kein Inhalt für den User.
- **Prüfbar:** Eine Sub-Diskussion zeigt nur ihre echten Subs + Textboxen, nicht die Ordner `blocks` und `index` als eigene Einträge.
- **Umsetzungshinweis:** Backend (`routes.py`) filtert `blocks` und `index` aus der Sub-Lese-Loop (`os.listdir`) heraus.

**Status**
🔜 offen
