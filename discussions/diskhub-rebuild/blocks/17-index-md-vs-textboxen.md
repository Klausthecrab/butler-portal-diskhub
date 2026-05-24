### Index.md vs textboxen
*— · 24.05.2026*

Index.md klar abgrenzen von Textboxen. meine Erwartung: 
Der unterschied im backend und der Handhabung hat sich aufgrund von wenig technischem Verständnis und schlechter visueller trennung aufgebaut. mir ist aufgefallen das "echte textboxen" "buttons" haben, "index.md" einträge nicht.

- textboxen sollen das vorherrschende element werden, was noch keine Sub-Diskussion ist.
- Es gibt quasi das Element "(Sub-)Diskussion": das hat wiederum Elemente und kann "selbst geöffnet" werden
- Textboxen : enthalten text aber keine eigenen Elemente.
also quasi "Diskussionen"= Ordner, "Textboxen" = .md Files. 

- wir müssen diskutieren: kann unsere Struktur / meine vision damit leben nur textboxen und keine "index.md" elemente mehr zu haben? oder haben die auch eine Daseinsberechtigung?
- mein Vorschlag: für dinge, die sich bewusst garnicht weiterentwickeln sollen gibt es Index.md einträge. diese sollen farblich anders als Textboxen dargestellt werden. Bspw "Readme". oder wie bei "memory trimmer": "Architektur", "Setup", "Komponenten": diese "technischen" Dinge könnte man bspw nochmal konzeptionell sauber definieren. Sie zeigen einen verifizierbaren "Ist"-Zustand. den könnte man dann dort festhalten.

Frage: bringt es was das programatisch / referenziell zu machen?:
statt hardcoded:"Python 3.12, Flask-Backend im Dashboard-Blueprint
Frontend: React (kein Router, Page-Komponente)
via n8n gesteuert (Cron-Trigger → run_memory_trimmer.sh → hermes CLI)"

einfach schreiben "befehl der selber checkt was das frontend ist. der wird ausgeführt sobald ich das akkordeon öffne...quasi ein "live / ondemand scan, ggf mit abruf "letzter run". als puffer.

Frage: bringt es was dazu einen (nur für KI lesbar) kommentar zu verfassen: bspw: das UI rendert bei index.md nur bestimmten text, da gibt es aber noch kommentar wie bspw "hi hermi. hier ist ein kommentar von vergangenheits KI zu zukunfts hermi: diese Parameter beschreiben die technischen Details vom Portal "XYZ" , sind vom "dd.mm.yyyy". Das erspart die Ressourcen, diese Dinge selbst zu prüfen. "
Diese muss man dann aber auch pflegen. (automatisch; semi: bei erkennung; monitoring cron)
