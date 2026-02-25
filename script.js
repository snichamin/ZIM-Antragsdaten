
// >>>START<<< - Menu-Navigation
const items = document.querySelectorAll('.menu-item');
const panels = document.querySelectorAll('.panel');

items.forEach(item => {
    item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        document.getElementById(item.dataset.target).classList.add('active');

        // PanelController refresh aufrufen, falls vorhanden
        const panelController = window.panelControllers?.[item.dataset.target];
        if (panelController) panelController.refresh();
    });
});

// Alle Panels + Menuitems initial deaktivieren
items.forEach(i => i.classList.remove('active'));
panels.forEach(p => p.classList.remove('active'));
// >>>ENDE<<< - Menu-Navigation



// >>>START<<< - Month / Year Picker (MM.JJJJ)
    flatpickr(".monthpicker", {
        locale: "de",
        plugins: [new monthSelectPlugin({
            shorthand: true,
            dateFormat: "m/Y",
            altFormat: "F Y"
        })]
    });
// >>>ENDE<<< - Month / Year Picker (MM.JJJJ)



// >>>START<<< - Day / Month / Year Picker (TT.MM.JJJJ)
    flatpickr(".datepicker", {
    locale: "de",
    dateFormat: "d.m.Y",
    allowInput: true
    });
// >>>ENDE<<< - Day / Month / Year Picker (TT.MM.JJJJ)  



// >>>START<<< - Zeichenzähler
    document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".counted-input").forEach(input => {
        const counter = input
        .nextElementSibling
        .querySelector(".char-count");

        const update = () => {
        counter.textContent = input.value.length;
        };

        input.addEventListener("input", update);
        update();
    });

    });
// >>>ENDE<<< - Zeichenzähler



// >>>START<<< - IBAN-Berechnung
    document.addEventListener("DOMContentLoaded", () => {
    const ibanInput = document.getElementById("iban");
    const ibanCounter = document.getElementById("iban-counter");
    const MAX_IBAN_LENGTH = 22;

    ibanInput.addEventListener("input", () => {
        // 1️⃣ Cursor speichern
        let cursorPos = ibanInput.selectionStart;

        // 2️⃣ Rohwert: nur Buchstaben/Zahlen, alles uppercase
        let raw = ibanInput.value.replace(/\s/g, "").replace(/[^A-Z0-9]/gi, "").toUpperCase();

        // 3️⃣ Auf 22 Zeichen begrenzen
        if (raw.length > MAX_IBAN_LENGTH) raw = raw.slice(0, MAX_IBAN_LENGTH);

        // 4️⃣ In 4er-Gruppen formatieren
        let formatted = raw.replace(/(.{4})/g, "$1 ").trim();

        // 5️⃣ Wert im Input setzen
        ibanInput.value = formatted;

        // 6️⃣ Cursor korrigieren (Verschiebung durch Leerzeichen)
        let spacesBefore = (formatted.slice(0, cursorPos).match(/\s/g) || []).length;
        let newCursorPos = cursorPos + spacesBefore;
        ibanInput.setSelectionRange(newCursorPos, newCursorPos);

        // 7️⃣ Char-Counter aktualisieren
        ibanCounter.textContent = raw.length;
        
    });
    });
// >>>ENDE<<< - IBAN-Berechnung



// >>>START<<< - Ort nach PLZ ermitteln
    // Alle PLZ-Felder finden, die "plz-" enthalten
    const plzInputs = document.querySelectorAll("input[class*='plz-']");

    plzInputs.forEach(plzInput => {
    // finde die Klasse, die mit "plz-" beginnt
    const plzClass = Array.from(plzInput.classList).find(c => c.startsWith("plz-"));
    if (!plzClass) return;

    // extrahiere die Nummer
    const num = plzClass.split("-")[1];

    // finde das zugehörige Ort-Feld
    const ortInput = Array.from(document.querySelectorAll("input")).find(input =>
        Array.from(input.classList).includes(`ort-${num}`)
    );
    if (!ortInput) return;

    // Event Listener
    plzInput.addEventListener("change", () => {
        const plz = plzInput.value.trim();
        if (!plz) {
            ortInput.value = "";
            return;
        }

        // API-Aufruf
        fetch(`https://api.zippopotam.us/de/${plz}`)
            .then(response => {
                if (!response.ok) throw new Error("PLZ nicht gefunden");
                return response.json();
            })
            .then(data => {
                ortInput.value = (data.places && data.places.length > 0) ? data.places[0]["place name"] : "";
            })
            .catch(error => {
                console.error(error);
                ortInput.value = "";
            });
    });
});
// >>>ENDE<<< - Ort nach PLZ ermitteln



// >>>START<<< - Sonstige - als Input anzeigen
document.addEventListener("DOMContentLoaded", () => {

    const select = document.getElementById("behoerdeSelect");
    const input = document.getElementById("behoerdeSonstige");

    function toggleSonstige() {
        if (select.value === "sonstige") {
            select.style.display = "none";
            input.style.display = "inline-block";
            input.focus();
        } else {
            input.style.display = "none";
            select.style.display = "inline-block";
        }
    }

    // 🔹 Initial prüfen (wichtig für CSV)
    toggleSonstige();

    // 🔹 Wenn Auswahl geändert wird
    select.addEventListener("change", toggleSonstige);

    // 🔹 Wenn Input verlassen wird
    input.addEventListener("blur", () => {
        if (input.value.trim() === "") {
            select.value = "wählen";
            toggleSonstige();
        }
    });

});
// >>>ENDE - Sonstige - als Input anzeigen<<<



// >>>START<<< - Checkboxen
    document.addEventListener("DOMContentLoaded", () => {

        document.querySelectorAll('input[type="checkbox"][id*="checkbox-"]').forEach(checkbox => {

            const id = checkbox.id;

            const inverted = id.startsWith('-');
            const soft = id.startsWith('?'); // visibility hidden

            // Nummer extrahieren
            const numMatch = id.match(/(\d+)$/);
            if (!numMatch) return;
            const num = numMatch[1];

            const content = document.getElementById(`togglecontent-${num}`);
            if (!content) return;

            // echtes Anfangs-display merken
            const initialDisplay = getComputedStyle(content).display === "none"
                ? (content.tagName === "TR" ? "table-row" : "block")
                : getComputedStyle(content).display;

            const updateContent = () => {

                if (!inverted && !soft) {
                    // NORMAL
                    content.style.display = checkbox.checked ? initialDisplay : "none";
                    content.style.visibility = "visible";
                }

                else if (inverted) {
                    // MINUS → hart ausblenden
                    content.style.display = checkbox.checked ? "none" : initialDisplay;
                    content.style.visibility = "visible";
                }

                else if (soft) {
                    // FRAGEZEICHEN → weich ausblenden
                    content.style.display = initialDisplay;
                    content.style.visibility = checkbox.checked ? "hidden" : "visible";
                }
            };

            // Initial
            updateContent();

            // Change + Scroll bei normalen Checkboxen
            checkbox.addEventListener("change", () => {
                updateContent();

                if (!inverted && !soft && checkbox.checked) {
                    content.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });

        });

    });
// >>>ENDE<<< - Checkboxen



// >>>START<<< - Select
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('select[id*="select-"]').forEach(select => {

        const id = select.id;
        const inverted = id.startsWith('-');

        // Nummer extrahieren
        const numMatch = id.match(/(\d+)$/);
        if (!numMatch) return;
        const num = numMatch[1];

        const content = document.getElementById(`select-content-${num}`);
        if (!content) return;

        // echtes Anfangs-display merken
        const initialDisplay = getComputedStyle(content).display === "none"
            ? (content.tagName === "TR" ? "table-row" : "block")
            : getComputedStyle(content).display;

        const updateFromSelect = () => {

            const val = select.value.trim().toLowerCase();

            let show;

            if (!inverted) {
                // positiv → JA zeigt
                show = val === "ja";
            } else {
                // negativ → NEIN zeigt
                show = val === "nein";
            }

            content.style.display = show ? initialDisplay : "none";

            // sanft scrollen nur bei positiven Selects, wenn gerade sichtbar geworden
            if (!inverted && show) {
                content.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        };

        // Initial
        updateFromSelect();

        // Change
        select.addEventListener("change", updateFromSelect);

    });

});
// >>>ENDE<<< - Select



// >>>START<<< - Select-Reverse
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('select[id*="select-"]').forEach(select => {

        const id = select.id;
        const inverted = id.startsWith('-');

        // Nummer extrahieren
        const numMatch = id.match(/(\d+)$/);
        if (!numMatch) return;
        const num = numMatch[1];

        const content = document.getElementById(`select-content-rev-${num}`);
        if (!content) return;

        // echtes Anfangs-display merken
        const initialDisplay = getComputedStyle(content).display === "none"
            ? (content.tagName === "TR" ? "table-row" : "block")
            : getComputedStyle(content).display;

        const updateFromSelect = () => {

            const val = select.value.trim().toLowerCase();

            let show;

            if (!inverted) {
                // positiv → JA zeigt
                show = val === "nein";
            } else {
                // negativ → NEIN zeigt
                show = val === "ja";
            }

            content.style.display = show ? initialDisplay : "none";

            // sanft scrollen nur bei positiven Selects, wenn gerade sichtbar geworden
            if (!inverted && show) {
                content.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        };

        // Initial
        updateFromSelect();

        // Change
        select.addEventListener("change", updateFromSelect);

    });

});
// >>>ENDE<<< - Select-Reverse



// >>>START<<< - Formate
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('input[data-format]').forEach(input => {

        // --- Wert aus Input parsen ---
        function parseValue(val) {
            if (!val || !val.match(/\d/)) return null;

            return parseFloat(
                val.replace(/[^\d,-]/g, '')
                   .replace(/\./g, '')
                   .replace(',', '.')
            );
        }

        // --- Zahl formatieren ---
        function formatNumber(num, decimals) {
            return num.toLocaleString('de-DE', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }

        // --- Format anwenden ---
        function applyFormat() {
            const format = input.dataset.format;
            let value = parseValue(input.value);

            if (value === null || isNaN(value)) {
                input.value = "";
                return;
            }

            switch (format) {
                case "%":
                    input.value = formatNumber(value, 2) + " %";
                    break;
                case "T€":
                    value = Math.round(value);
                    input.value = formatNumber(value, 0) + " T€";
                    break;
                case "number0":
                    value = Math.round(value);
                    input.value = formatNumber(value, 0);
                    break;
                case "number2":
                    input.value = formatNumber(value, 2);
                    break;
                default:
                    input.value = value;
            }
        }

        // --- Eingabe bereinigen ---
        input.addEventListener('input', () => {
            if (!input.value) return;
            input.value = input.value.replace(/[^\d,-]/g, '');
        });

        // --- Format beim Verlassen ---
        input.addEventListener('blur', applyFormat);

    });

});
// >>>ENDE<<< - Formate



// >>>START<<< - Anlage8 - Summenzeilen
    document.addEventListener("DOMContentLoaded", () => {

        // Zahl aus Input lesen (format-sicher)
        const getNumber = (id) => {
            const el = document.getElementById(id);
            if (!el || !el.value) return 0;

            return parseFloat(
                el.value
                .replace(/[^\d,-]/g, '')
                .replace(/\./g, '')
                .replace(',', '.')
            ) || 0;
        };

        // Zahl setzen + Formatter auslösen
        const setNumber = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;

            // rohe Zahl setzen
            el.value = value.toString().replace('.', ',');

            // bestehenden Formatter nutzen
            el.dispatchEvent(new Event("blur", { bubbles: true }));
        };

        // 1) E-Summen (Z1–Z3)
        for (let i = 1; i <= 5; i++) {

            const inputIds = [`Z1-W${i}`, `Z2-W${i}`, `Z3-W${i}`];

            const updateE = () => {
                let sum = 0;
                inputIds.forEach(id => sum += getNumber(id));
                setNumber(`A8sum-${i}e`, sum);
            };

            inputIds.forEach(id => {
                const input = document.getElementById(id);
                if (!input) return;
                input.addEventListener("input", () => {
                    updateE();
                    updateR(i);
                });
            });

            updateE();
        }

        // 2) A-Summen (Z4–Z8)
        for (let i = 1; i <= 5; i++) {

            const inputIds = [`Z4-W${i}`, `Z5-W${i}`, `Z6-W${i}`, `Z7-W${i}`, `Z8-W${i}`];

            const updateA = () => {
                let sum = 0;
                inputIds.forEach(id => sum += getNumber(id));
                setNumber(`A8sum-${i}a`, sum);
            };

            inputIds.forEach(id => {
                const input = document.getElementById(id);
                if (!input) return;
                input.addEventListener("input", () => {
                    updateA();
                    updateR(i);
                });
            });

            updateA();
        }

        // 3) R-Summen (E – A)
        const updateR = (i) => {
            const sumE = getNumber(`A8sum-${i}e`);
            const sumA = getNumber(`A8sum-${i}a`);
            const total = sumE - sumA;

            // Wert in Input setzen
            setNumber(`A8sum-${i}r`, total);

            // 🔥 Am Ende direkt Validierung aufrufen
            pruefeGegenfinanzierung();

            // Farbe setzen, wenn negativ
            const el = document.getElementById(`A8sum-${i}r`);
            if (!el) return;
            if (total < 0) {
                el.style.color = "red";
            } else {
                el.style.color = "black"; // Standardfarbe
            }
        };

        for (let i = 1; i <= 5; i++) updateR(i);


    });
// >>>ENDE<<< - Anlage8 - Summenzeilen



// >>>START<<< - Anlage 8 - Berechnung % und T€ (LOGIK OHNE FORMATIERUNG)
    document.addEventListener("DOMContentLoaded", function () {

        const numRows = 8;     // Z1 bis Z8
        const numYears = 5;    // W1–W5 / P1–P4

        for (let r = 1; r <= numRows; r++) {
            for (let y = 1; y <= numYears; y++) {

                const wInput = document.getElementById(`Z${r}-W${y}`);
                const pInput = document.getElementById(`Z${r}-P${y}`);

                // WERT-FELDER (T€)
                if (wInput) {
                    let oldValue = "";

                    // ursprünglichen Wert merken
                    wInput.addEventListener("focus", () => {
                        oldValue = wInput.value;
                    });

                    wInput.addEventListener("blur", () => {

                        // nichts geändert → nichts tun
                        if (wInput.value === oldValue) return;

                        let raw = wInput.value
                            .replace(/\s*T€/, "")
                            .replace(/\./g, "")
                            .replace(",", ".");

                        let value = parseFloat(raw);
                        if (isNaN(value)) {
                            wInput.value = "";
                            return;
                        }

                        // formatieren
                        wInput.value = formatTEuro(value);

                        // manuelle Änderung → vorheriges Prozent löschen
                        if (y > 1) {
                            const prevP = document.getElementById(`Z${r}-P${y - 1}`);
                            if (prevP) prevP.value = "";
                        }

                        // Kette neu berechnen
                        updateChain(r, y);
                    });
                }

                // PROZENT-FELDER (%)
                if (pInput) {
                    pInput.addEventListener("blur", () => {

                        let raw = pInput.value
                            .replace("%", "")
                            .replace(",", ".");

                        let value = parseFloat(raw);
                        if (isNaN(value)) {
                            pInput.value = "";
                            return;
                        }

                        // formatieren
                        pInput.value = formatPercent(value);

                        // Kette neu berechnen
                        updateChain(r, y);
                    });
                }
            }
        }

        // KETTENBERECHNUNG
        function updateChain(row, startYear) {

            for (let y = startYear; y < numYears; y++) {

                const wPrev = document.getElementById(`Z${row}-W${y}`);
                const pCurr = document.getElementById(`Z${row}-P${y}`);
                const wNext = document.getElementById(`Z${row}-W${y + 1}`);

                if (!wPrev || !pCurr || !wNext) break;

                // leeres Prozentfeld → keine Berechnung
                if (pCurr.value.trim() === "") break;

                let base = parseFloat(
                    wPrev.value
                        .replace(/\s*T€/, "")
                        .replace(/\./g, "")
                        .replace(",", ".")
                );

                let perc = parseFloat(
                    pCurr.value
                        .replace("%", "")
                        .replace(",", ".")
                );

                if (isNaN(base) || isNaN(perc)) break;

                const result = base * (1 + perc / 100);
                wNext.value = formatTEuro(result);

                wNext.dispatchEvent(new Event("input", { bubbles: true }));
                
            }
        }

        // FORMATIERUNG
        function formatTEuro(val) {
            return val.toLocaleString("de-DE", {
                maximumFractionDigits: 0
            }) + " T€";
        }

        function formatPercent(val) {
            return val.toFixed(2).replace(".", ",") + " %";
        }

    });
// >>>ENDE<<< - Anlage 8 - Berechnung % und T€ (LOGIK OHNE FORMATIERUNG)



// >>>START<<< - Jahre füllen
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("einreichung");

  // NEU: Titel-Element und Originaltitel merken
  const titleEl = document.getElementById("finanzplanung-title");
  const originalTitle = titleEl ? titleEl.textContent : null;

  // Originalinhalt aller relevanten Elemente speichern
  const elements = {};
  [
    "antragsjahr",
    "vorjahr",
    "folgejahr1",
    "folgejahr2",
    "folgejahr3",
    "antragsjahrm2",
    "antragsjahrm3"
  ].forEach(cls => {
    elements[cls] = [];
    document.querySelectorAll(`.${cls}`).forEach(el => {
      elements[cls].push({
        node: el,
        original: el.textContent
      });
    });
  });

  // Funktion zum Aktualisieren der Jahre
  const updateYears = () => {
    const val = input.value.trim();
    const match = val.match(/^\d{2}\/(\d{4})$/); // z.B. "01/2026"

    if (!match) {
      // Input leer oder ungültig → Originalwerte wiederherstellen
      Object.keys(elements).forEach(cls => {
        elements[cls].forEach(item => {
          item.node.textContent = item.original;
        });
      });
      // NEU: Titel zurücksetzen
      if (titleEl && originalTitle != null) {
        titleEl.textContent = originalTitle;
      }
      return;
    }

    const jahr = parseInt(match[1], 10);

    // Jahre berechnen
    const jahre = {
      antragsjahr: jahr,
      vorjahr: jahr - 1,
      folgejahr1: jahr + 1,
      folgejahr2: jahr + 2,
      folgejahr3: jahr + 3,
      antragsjahrm2: jahr - 2,
      antragsjahrm3: jahr - 3
    };

    // Elemente aktualisieren
    Object.keys(jahre).forEach(cls => {
      elements[cls].forEach(item => {
        item.node.textContent = jahre[cls];
      });
    });

    // NEU: Titel setzen: "Finanzplanung (vorjahr-folgejahr3)"
    if (titleEl) {
      titleEl.textContent = `Finanzplanung (${jahre.vorjahr}-${jahre.folgejahr3})`;
    }
  };

  // Direkt beim Laden prüfen
  updateYears();

  // Bei Eingabe im Input
  input.addEventListener("input", updateYears);
});
// >>>ENDE<<< - Jahre füllen



// >>>START<<< - Mitarbeiterzahlen - pages wechseln
  const buttons = document.querySelectorAll('.main-nav button');
  const pages = document.querySelectorAll('.page');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {

      const target = btn.dataset.page;

      // Buttons aktiv
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Seiten anzeigen
      pages.forEach(page => {
        page.classList.toggle('active', page.id === target);
      });

    });
  });
// >>>ENDE<<< - Mitarbeiterzahlen - pages wechseln



// >>>START<<< - Mitarbeiterzahlen - JAE-Berechnung 
(function() {     

    // Hilfsfunktionen

    window.attachRowListeners = attachRowListeners;
    window.updateRowCalculations = updateRowCalculations;
    window.updateSums = updateSums;
    window.applyFormat = applyFormat;

    // parse float aus Input, format-sicher
    function getNumber(input) {
        if (!input || !input.value) return 0;
        return parseFloat(input.value.toString().replace("%", "").replace(",", ".").replace(/\s*T€/, "")) || 0;
    }

    // Wert in Input setzen + optional formatieren
    function setNumber(input, value, format) {
        if (!input) return;

        // Rohwert setzen
        input.value = value.toString();

        // Format anwenden
        if (format) applyFormat(input);
    }

    // Format-Funktion (deine bestehende)
    function applyFormat(input) {
        if (!input) return;
        const format = input.dataset.format;
        if (!format) return;

        let val = parseFloat(input.value.toString().replace(",", "."));
        if (isNaN(val)) {
            input.value = "";
            return;
        }

        switch (format) {
            case "%":
                input.value = val.toFixed(2).replace(".", ",") + " %";
                break;
            case "number2":
                input.value = val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                break;
            default:
                input.value = val;
        }
    }

    // Summen für tfoot
    function updateSums(table) {
        const tfootInputs = table.querySelectorAll("tfoot input.a8-input-sum");
        const tbodyRows = table.querySelectorAll("tbody tr");

        tfootInputs.forEach(input => {
            const col = input.dataset.col;
            if (!col) return;

            let sum = 0;
            tbodyRows.forEach(row => {
                const cellInput = row.querySelector(`input[data-col="${col}"]`);
                if (cellInput) {
                    let val = getNumber(cellInput);
                    if (!isNaN(val)) sum += val;
                }
            });

            input.value = sum.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        });
    }

    // Berechnung Spalte data-col="6" pro Zeile
    function updateRowCalculations(row) {
        const col1 = row.querySelector('input[data-col="1"]');
        const cols2to5 = [2,3,4,5].map(c => row.querySelector(`input[data-col="${c}"]`));

        // Summe und Anzahl nicht leerer Inputs
        let sum = 0, count = 0;
        cols2to5.forEach(inp => {
            const val = getNumber(inp);
            if (!isNaN(val) && inp.value.trim() !== "") {
                sum += val;
                count++;
            }
        });

        const col6 = row.querySelector('input[data-col="6"]');
        if (!col6 || !col1) return;

        let val1 = getNumber(col1);
        let result = 0;
        if (count > 0) {
            result = val1 * (sum / count) / 100; // Berechnung nach Vorgabe
        }

        setNumber(col6, result, "number2");
    }

    // Event Listener für eine Zeile
    function attachRowListeners(row, table) {
        const inputs = row.querySelectorAll("input");
        inputs.forEach(input => {

            // Summen und Berechnungen aktualisieren
            input.addEventListener("input", () => {
                updateRowCalculations(row);
                updateSums(table);
            });

            // Format beim Blur anwenden
            if (input.dataset.format) {
                input.addEventListener("blur", () => applyFormat(input));
            }
        });

        // Löschen-Button
        const delBtn = row.querySelector(".deleteBtn");
        if (delBtn) {
            delBtn.addEventListener("click", () => {

                const tbody = table.querySelector("tbody");
                const firstRow = tbody.querySelector("tr");

                // erste (HTML-)Zeile darf nicht gelöscht werden
                if (row === firstRow) {
                    return; // oder optional: alert("Diese Zeile kann nicht gelöscht werden");
                }

                row.remove();
                updateSums(table);
            });
        }
    }

    // Bestehende Zeilen initialisieren
    document.querySelectorAll("table.myTable").forEach(table => {
        table.querySelectorAll("tbody tr").forEach(row => attachRowListeners(row, table));
        updateSums(table);
        table.querySelectorAll("tbody tr").forEach(row => updateRowCalculations(row));
    });

    // Neue Zeilen hinzufügen
    document.querySelectorAll(".addRowBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tableNumber = btn.dataset.table;
            const table = document.querySelector(`table[data-table="${tableNumber}"]`);
            if (!table) return;

            const tbody = table.querySelector("tbody");
            if (!tbody) return;

            const rowCount = tbody.querySelectorAll("tr").length + 1;
            const newRow = document.createElement("tr");

            newRow.dataset.row = `ma${tableNumber}_${rowCount}`;

            newRow.innerHTML = `
            <td><input type="text" name="ma${tableNumber}_${rowCount}_1" class="input-ma" data-format="%" data-col="1"></td>
            <td><input type="number" name="ma${tableNumber}_${rowCount}_2" class="input-ma" data-col="2"></td>
            <td><input type="number" name="ma${tableNumber}_${rowCount}_3" class="input-ma" data-col="3"></td>
            <td><input type="number" name="ma${tableNumber}_${rowCount}_4" class="input-ma" data-col="4"></td>
            <td><input type="number" name="ma${tableNumber}_${rowCount}_5" class="input-ma" data-col="5"></td>
            <td><input type="text" name="ma${tableNumber}_${rowCount}_6" class="input-ma-sum" data-format="number2" data-col="6" readonly disabled></td>
            <td><button class="deleteBtn">×</button></td>
            `;

            tbody.appendChild(newRow);

            attachRowListeners(newRow, table);
            updateRowCalculations(newRow);
            updateSums(table);
        });
    });

})();
// >>>ENDE<<< - Mitarbeiterzahlen - JAE-Berechnung



// START - Checkbox-Zustand speichern
    function prepareCheckboxStates() {

    const states = {
        "checkbox-1": document.getElementById("checkbox-1").checked,
        "checkbox-2": document.getElementById("checkbox-2").checked,
        "-checkbox-3": document.getElementById("-checkbox-3").checked,
        "-checkbox-4": document.getElementById("-checkbox-4").checked,
        "-checkbox-5000": document.getElementById("-checkbox-4").checked,

        "-checkbox-5000": document.getElementById("checkbox-text-1").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-2").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-3").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-4").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-5").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-6").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-7").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-8").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-9").checked,
        "-checkbox-5000": document.getElementById("checkbox-text-10").checked
    };

    document.getElementById("checkboxStates").value = JSON.stringify(states);
}
// ENDE - Checkbox-Zustand speichern



// START - CSV-Exportieren (robust)
(function () {
  function quote(val) {
    // CSV-Quote: " -> "" und Feld in doppelte Anführungszeichen
    return `"${String(val ?? '').replace(/"/g, '""')}"`;
  }

  function buildCsv() {
    const rows = [];
    rows.push(['Name', 'Wert']); // Kopfzeile

    const elements = document.querySelectorAll('input[name], textarea[name], select[name]');

    elements.forEach(el => {
      const name = el.name;
      let value;

      if (el instanceof HTMLInputElement) {
        const type = (el.type || '').toLowerCase();

        if (type === 'checkbox') {
          // Exportiere Checked-Status (falls prepareCheckboxStates Hidden-Werte erzeugt, ist das okay)
          value = el.checked ? 'true' : 'false';
        } else if (type === 'radio') {
          // Nur das gewählte Radio exportieren
          if (!el.checked) return; // skip nicht-gewählte
          value = el.value;
        } else if (type === 'file') {
          // Dateien: meist leer – optional: el.files.length
          value = el.value || '';
        } else {
          value = el.value;
        }
      } else {
        // textarea/select
        value = el.value;
      }

      rows.push([name, value]);
    });

    // Semikolon als Trenner
    const csv = rows.map(r => r.map(quote).join(';')).join('\n');
    return "\uFEFF" + csv; // BOM für Excel
  }

  function downloadCsv(content, filename = 'export.csv') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

    // IE/Edge legacy
    if (typeof navigator !== 'undefined' && navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  function onExportClick() {
    try {
      // Checkbox-Stände vorbereiten (falls vorhanden)
      if (typeof window.prepareCheckboxStates === 'function') {
        window.prepareCheckboxStates();
      }
    } catch (e) {
      console.warn('prepareCheckboxStates() hat einen Fehler geworfen – Export läuft trotzdem weiter.', e);
    }

    try {
      const csvContent = buildCsv();
      downloadCsv(csvContent, 'export.csv');
    } catch (e) {
      console.error('CSV-Export fehlgeschlagen:', e);
      alert('CSV-Export fehlgeschlagen. Details in der Konsole.');
    }
  }

  function bindExport() {
    const btn = document.getElementById('exportCsvBtn');
    if (!btn) {
      console.error('#exportCsvBtn nicht gefunden – ist das Script vor dem Button eingebunden?');
      return;
    }
    // Doppelte Listener vermeiden
    btn.removeEventListener('click', onExportClick);
    btn.addEventListener('click', onExportClick);
  }

  // Sicher nach DOM-Load binden
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindExport);
  } else {
    bindExport();
  }
})();
 // ENDE - CSV-Exportieren (robust)



// START - CSV-Importieren
document.getElementById("importCsvBtn").addEventListener("click", function() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            let text = event.target.result;

            // BOM entfernen, falls vorhanden
            if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

            // fehlende Zeilen erzeugen (unter Mitarbeiter)
            ensureRowsFromCSV(text);

            const lines = text.split(/\r?\n/);

            // Erste Zeile ist Header "Name;Wert"
            lines.slice(1).forEach(line => {
                if (!line.trim()) return;

                let [rawName, rawValue] = line.split(";");

                if (!rawName) return;

                // Anführungszeichen entfernen, doppelte Anführungszeichen ersetzen
                let name = rawName.replace(/^"|"$/g, '').replace(/""/g, '"');
                let value = (rawValue || "").replace(/^"|"$/g, '').replace(/""/g, '"');

                // Passendes Feld finden
                const elements = document.querySelectorAll(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);

                elements.forEach(el => {

                    if (el.tagName === "SELECT") {
                        el.value = value;
                    } else if (el.type === "checkbox") {
                        el.checked = value === "1" || value.toLowerCase() === "true";
                    } else {
                        el.value = value;
                    }

                    // Optional: Preview aktualisieren, falls vorhanden
                    const preview = el.closest(".project-accordion")?.querySelector(".preview");
                    if (preview) {
                        preview.textContent = value || "Eintrag leer";
                    }
                });
            });

            // Checkbox-Zustand wiederherstellen
            applyCheckboxStates(); 
            // Register - Sonstige wiederherstellen
            toggleBehoerdeFelder(); 

            // Select-Bereiche - aus- und einblenden
            document.querySelectorAll('select[id*="select-"]').forEach(select => {
            select.dispatchEvent(new Event("change"));
            }); 

            // NEU: Optional globaler Hook – falls du irgendwo zuhörst (z. B. für Glocke)
            document.dispatchEvent(new CustomEvent('csv:imported'));


            alert("CSV importiert!");
        };  

        reader.readAsText(file, "UTF-8"); // UTF-8 für Umlaute

    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
    
});
// ENDE - CSV-Importieren



// START - SONSTIGE bei Registerdaten sichtbar
function toggleBehoerdeFelder() {
    const select = document.getElementById("behoerdeSelect");
    const input = document.getElementById("behoerdeSonstige");

    if (input.value.trim() !== "") {
        input.style.display = "inline-block";
        select.style.display = "none";
    }
}
// ENDE - SONSTIGE bei Registerdaten sichtbar



// START - CSV analysieren und benötigte Anzahl Zeilen ermitteln (Mitarbeiter JAE)
function ensureRowsFromCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const tableRowMap = {};

    // CSV analysieren
    lines.forEach(line => {
        if (!line.trim()) return;

        let firstColumn = line.split(";")[0]?.trim();
        if (!firstColumn) return;
        firstColumn = firstColumn.replace(/^"|"$/g, '').replace(/""/g, '"');

        const match = firstColumn.match(/^ma(\d+)_(\d+)_\d+$/);
        if (!match) return;

        const tableNr = match[1];
        const rowNr = parseInt(match[2]);

        if (!tableRowMap[tableNr]) tableRowMap[tableNr] = 0;
        if (rowNr > tableRowMap[tableNr]) tableRowMap[tableNr] = rowNr;
    });

    // Fehlende Zeilen erzeugen
    Object.keys(tableRowMap).forEach(tableNr => {
        const table = document.querySelector(`table[data-table="${tableNr}"]`);
        if (!table) return;
        const tbody = table.querySelector("tbody");
        if (!tbody) return;

        const existingRows = tbody.querySelectorAll("tr").length;
        const neededRows = tableRowMap[tableNr];

        for (let i = existingRows + 1; i <= neededRows; i++) {
            // Zeile über createRow erzeugen
            const newRow = createRow(tableNr);
            if (!newRow) continue;

            // CSV-Werte in Inputs eintragen
            const csvLine = lines[i - 1];
            const csvValues = csvLine.split(";");
            csvValues.forEach((val, index) => {
                const input = newRow.querySelector(`input[data-col="${index + 1}"]`);
                if (input) {
                    input.value = val;
                    // Format sofort anwenden
                    if (typeof applyFormat === "function" && input.dataset.format) applyFormat(input);
                }
            });

            // Berechnungen nach CSV-Werten
            if (typeof updateRowCalculations === "function") updateRowCalculations(newRow);
            if (typeof updateSums === "function") updateSums(table);
        }
    });
}
// ENDE - CSV analysieren und benötigte Anzahl Zeilen ermitteln (Mitarbeiter JAE)



// START - Mitarbeiter JAE - benötigte Zeilen nach Import erzeugen
function createRow(tableNumber) {
    const table = document.querySelector(`table[data-table="${tableNumber}"]`);
    if (!table) return null;

    const tbody = table.querySelector("tbody");
    if (!tbody) return null;

    const rowCount = tbody.querySelectorAll("tr").length + 1;
    const newRow = document.createElement("tr");
    newRow.dataset.row = `ma${tableNumber}_${rowCount}`;

    newRow.innerHTML = `
        <td><input type="text" name="ma${tableNumber}_${rowCount}_1" class="input-ma" data-format="%" data-col="1"></td>
        <td><input type="number" name="ma${tableNumber}_${rowCount}_2" class="input-ma" data-col="2"></td>
        <td><input type="number" name="ma${tableNumber}_${rowCount}_3" class="input-ma" data-col="3"></td>
        <td><input type="number" name="ma${tableNumber}_${rowCount}_4" class="input-ma" data-col="4"></td>
        <td><input type="number" name="ma${tableNumber}_${rowCount}_5" class="input-ma" data-col="5"></td>
        <td><input type="text" name="ma${tableNumber}_${rowCount}_6" class="input-ma-sum" data-format="number2" data-col="6" readonly disabled></td>
        <td><button class="deleteBtn">×</button></td>
    `;

    tbody.appendChild(newRow);

    // Listener anhängen + Berechnung + Summen
    if (typeof attachRowListeners === "function") attachRowListeners(newRow, table);
    if (typeof updateRowCalculations === "function") updateRowCalculations(newRow);
    if (typeof updateSums === "function") updateSums(table);

    return newRow;
}
// ENDE - Mitarbeiter JAE - benötigte Zeilen nach Import erzeugen



// START - Gegenfinanzierung - automatische Summenberechnung
document.addEventListener("DOMContentLoaded", function () {

    const zeilen = [1, 2, 3, 4, 5];
    const suffixe = ["A-1", "A", "A+1", "A+2", "A+3"];
    const menuItem = document.querySelector('.menu-item[data-target="gegenfinanzierung"]');

    function parseEuroWert(wert) {
        if (!wert) return null;

        const bereinigt = wert
            .replace(/\s/g, "")
            .replace("T€", "")
            .replace(/\./g, "")
            .replace(",", ".");

        const zahl = parseFloat(bereinigt);
        return isNaN(zahl) ? null : zahl;
    }

    function berechneSpaltenSummen() {
        suffixe.forEach(suffix => {
            let summe = 0;

            zeilen.forEach(nummer => {
                const feld = document.querySelector(`input[name="gf_${nummer}_${suffix}"]`);
                if (feld && feld.value.trim() !== "") {
                    const wert = parseEuroWert(feld.value);
                    if (wert !== null) summe += wert;
                }
            });

            const sumFeld = document.querySelector(`input[name="gf_s_${suffix}"]`);
            const vergleichFeld = document.querySelector(`input[name="gf_e_${suffix}"]`);

            if (!sumFeld) return;

            sumFeld.value = summe.toFixed(2).replace(".", ",");
            sumFeld.dispatchEvent(new Event("blur"));

            const sumWert = summe;
            const fehlbetrag = vergleichFeld ? parseEuroWert(vergleichFeld.value) : null;

            sumFeld.style.color = "";

            if (fehlbetrag !== null) {
                const benoetigt = Math.abs(fehlbetrag); // 🔥 wichtig
                sumFeld.style.color = sumWert < benoetigt ? "red" : "green";
            }
        });
    }

    // Event-Listener für Eingaben
    document.querySelectorAll('input[name^="gf_"]').forEach(feld => {
        if (!feld.name.startsWith("gf_s_")) {
            feld.addEventListener("input", berechneSpaltenSummen);
        }
    });

    // Neu: Berechnung sofort ausführen beim Anzeigen des Panels
    if (menuItem) {
        menuItem.addEventListener("click", () => {
            // kurze Verzögerung, falls Summen noch gesetzt werden müssen
            setTimeout(berechneSpaltenSummen, 50);
        });
    }

    // Optional: Berechnung direkt beim Laden der Seite
    berechneSpaltenSummen();

});
// ENDE - Gegenfinanzierung - automatische Summenberechnung



// START - Gegenfinanzierung - Ausblenden von Spalten
document.addEventListener("DOMContentLoaded", () => {

    const menuItem = document.querySelector('.menu-item[data-target="gegenfinanzierung"]');
    if (!menuItem) return;

    menuItem.addEventListener("click", () => {

        const suffixe = ["A-1", "A", "A+1", "A+2", "A+3"];

        suffixe.forEach(suffix => {

            const source = document.querySelector(`input[name="differenz_sum_${suffix}"]`);
            if (!source) return;

            const wert = parseFloat(source.value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;

            const zielFeld = document.querySelector(`input[name="gf_e_${suffix}"]`);
            if (zielFeld) zielFeld.value = source.value;

            const inputNamen = [
                `gf_e_${suffix}`,
                `gf_s_${suffix}`,
                `gf_1_${suffix}`,
                `gf_2_${suffix}`,
                `gf_3_${suffix}`,
                `gf_4_${suffix}`,
                `gf_5_${suffix}`,
                `gf_6_${suffix}`
            ];

            inputNamen.forEach(name => {
                const feld = document.querySelector(`input[name="${name}"]`);
                if (!feld) return;
                const td = feld.closest("td");
                if (td) td.style.display = (wert >= 0) ? "none" : "";
            });

            // Label-TD ausblenden – hier an die bestehende ID angepasst
            const tdLabel = document.getElementById(`gf_l_${suffix}`);
            if (tdLabel) tdLabel.style.display = (wert >= 0) ? "none" : "table-cell";

        });

    });

});
// ENDE - Gegenfinanzierung - Ausblenden von Spalten



// START - Gegenfinanzierung automatisch anzeigen bei negativem Fehlbetrag
document.addEventListener("DOMContentLoaded", function () {

    const suffixe = ["A-1", "A", "A+1", "A+2", "A+3"];
    const menuItem = document.querySelector('.menu-item[data-target="gegenfinanzierung"]');

    function parseEuroWert(wert) {
        if (!wert) return null;

        const bereinigt = wert
            .replace(/\s/g, "")
            .replace("T€", "")
            .replace(/\./g, "")
            .replace(",", ".");

        const zahl = parseFloat(bereinigt);
        return isNaN(zahl) ? null : zahl;
    }

    function pruefeDifferenzen() {

        let negativGefunden = false;

        suffixe.forEach(suffix => {

            const feld = document.querySelector(`input[name="differenz_sum_${suffix}"]`);

            if (feld) {
                const wert = parseEuroWert(feld.value);

                if (wert !== null && wert < 0) {
                    negativGefunden = true;
                }
            }

        });

        if (menuItem) {
            menuItem.style.display = negativGefunden ? "flex" : "none";
        }
    }

    document.querySelectorAll("input:not([disabled])").forEach(input => {
        input.addEventListener("input", pruefeDifferenzen);
        input.addEventListener("change", pruefeDifferenzen);
    });

    // Initial prüfen
    pruefeDifferenzen();

});
// ENDE - Gegenfinanzierung automatisch anzeigen bei negativem Fehlbetrag



// START - Validierung Gegenfinanzierung
function pruefeGegenfinanzierung() {
    const suffixe = ["A-1","A","A+1","A+2","A+3"];
    const menuItem = document.querySelector('.menu-item[data-target="gegenfinanzierung"]');
    const statusIcon = menuItem ? menuItem.querySelector(".status-icon") : null;
    if (!statusIcon) return;

    const parseEuroWert = (wert) => {
        if (!wert) return 0;
        return parseFloat(wert.replace(/\s/g,"").replace("T€","").replace(/\./g,"").replace(",", ".")) || 0;
    };

    let allesGueltig = true;

    suffixe.forEach(suffix => {
        const sFeld = document.querySelector(`input[name="gf_s_${suffix}"]`);
        const diffFeld = document.querySelector(`input[name="differenz_sum_${suffix}"]`);

        const sWert = sFeld ? parseEuroWert(sFeld.value) : 0;
        const diffWert = diffFeld ? parseEuroWert(diffFeld.value) : 0;

        if ((sWert + diffWert) < 0) allesGueltig = false;
    });

    statusIcon.classList.remove("success","error");
    statusIcon.classList.add(allesGueltig ? "success" : "error");
}
// Restliche Listener, MutationObserver etc. können weiterhin im DOMContentLoaded-Block stehen
document.addEventListener("DOMContentLoaded", function () {
    const menuItem = document.querySelector('.menu-item[data-target="gegenfinanzierung"]');
    
    // Prüfen beim Laden
    pruefeGegenfinanzierung();

    // Auf alle gf_ Inputs hören
    document.querySelectorAll('input[name^="gf_"]').forEach(input => {
        input.addEventListener("input", () => setTimeout(pruefeGegenfinanzierung, 50));
        input.addEventListener("change", () => setTimeout(pruefeGegenfinanzierung, 50));
    });

    // Panel-Wechsel prüfen
    if (menuItem) {
        menuItem.addEventListener("click", () => setTimeout(pruefeGegenfinanzierung, 50));
    }

    // MutationObserver für differenz_sum_...
    const suffixes = ["A-1", "A", "A+1", "A+2", "A+3"];
    suffixes.forEach(suffix => {
        const feld = document.querySelector(`input[name="differenz_sum_${suffix}"]`);
        if (feld) {
            const observer = new MutationObserver(() => setTimeout(pruefeGegenfinanzierung, 50));
            observer.observe(feld, { attributes: true, attributeFilter: ["value"] });
        }
    });
});
// ENDE - Validierung Gegenfinanzierung



// START - Checkbox Zustand wiederherstellen
function applyCheckboxStates() {

    const hidden = document.getElementById("checkboxStates");
    if (!hidden.value) return;

    const states = JSON.parse(hidden.value);

    for (let id in states) {

        const checkbox = document.getElementById(id);
        if (!checkbox) continue;

        const savedState = states[id];

        checkbox.checked = !savedState;
        checkbox.dispatchEvent(new Event("change"));

        checkbox.checked = savedState;
        checkbox.dispatchEvent(new Event("change"));
    }
}
// ENDE - Checkbox Zustand wiederherstellen



// START - WELCOME
document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById("welcomePopup");
    const closeBtn = document.getElementById("closePopup");

    // Popup beim Laden anzeigen
    popup.style.display = "block";

    // Klick auf "x" schließt das Popup
    closeBtn.addEventListener("click", function() {
        popup.style.display = "none";
    });

    // Optional: Klick außerhalb des Inhalts schließt ebenfalls
    popup.addEventListener("click", function(e) {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
});
// ENDE - WELCOME



// START - VALIDIERUNG - mehrere Panels
document.addEventListener("DOMContentLoaded", function () {

    function setupPanelValidation(panelId) {

        const panel = document.getElementById(panelId);
        const menuItem = document.querySelector('.menu-item[data-target="' + panelId + '"]');

        if (!panel || !menuItem) return;

        const fields = panel.querySelectorAll('[data-validate="on"], [data-validate="visible"]');
        const statusIcon = menuItem.querySelector(".status-icon");
        let panelLeftWithContent = false;

        fields.forEach(f => f.dataset.wasFilled = "false");

        function isVisible(field) {
            return field.offsetParent !== null;
        }

        function getCounts() {
            let filled = 0;
            let empty = 0;

            fields.forEach(f => {
                if (f.dataset.validate === "visible" && !isVisible(f)) return;

                const value = f.value.trim();
                if (value === "" || (f.tagName === "SELECT" && value === "wählen")) empty++;
                else filled++;
            });

            return { filled, empty };
        }

        function validatePanel() {
            const { filled, empty } = getCounts();

            statusIcon.classList.remove("success", "error");
            if (empty === 0) statusIcon.classList.add("success");
            else statusIcon.classList.add("error");

            const allEmpty = filled === 0;
            const partiallyFilled = filled > 0 && empty > 0;

            fields.forEach(f => {
                if (f.dataset.validate === "visible" && !isVisible(f)) return;

                const value = f.value.trim();
                const isEmpty = value === "" || (f.tagName === "SELECT" && value === "wählen");

                f.classList.remove("error");

                if (allEmpty) return;
                if (f.dataset.wasFilled === "true" && isEmpty) f.classList.add("error");
                if (panelLeftWithContent && partiallyFilled && isEmpty) f.classList.add("error");
                if (!isEmpty) f.dataset.wasFilled = "true";
            });
        }

        // Events
        panel.addEventListener("input", validatePanel);
        panel.addEventListener("change", validatePanel);

        const observer = new MutationObserver(() => {
            if (!panel.classList.contains("active")) {
                const { filled } = getCounts();
                if (filled > 0) panelLeftWithContent = true;
            }
            if (panel.classList.contains("active")) validatePanel();
        });
        observer.observe(panel, { attributes: true });

        panel.validateNow = validatePanel;

        // Trigger für select / toggle-content
        const toggles = panel.querySelectorAll('select, input[type="checkbox"]');
        toggles.forEach(t => {
            t.addEventListener("change", () => {

                // prüfen, ob toggle-content sichtbar wird
                if (t.dataset.toggleTarget) {
                    const target = document.getElementById(t.dataset.toggleTarget);
                    if (target) {
                        target.style.display = (t.value === "Ja") ? "block" : "none";
                    }
                }

                // direkt Panel validieren
                validatePanel();
            });
        });

        // Initial-Validierung
        validatePanel();
    }

    // Panels registrieren
    const panelIds = [
          "projekteckdaten",
          "antragstellerdaten",
          "unternehmensgeschichte",
          "kontaktinformationen",
          "stelle",
          "registerdaten",
          "person",
          "projektleitung",
          "bankverbindung",
          "finanzplanung",
          "kennzahlen",
          "mitarbeiterzahlen",
          "fue",
          "tt"
          
    ];

    panelIds.forEach(id => setupPanelValidation(id));

});
// ENDE - VALIDIERUNG - mehrere Panels



// START - VALIDIERUNG - Panels durchgehen
document.addEventListener("DOMContentLoaded", function () {

    const panels = document.querySelectorAll(".panel");

    panels.forEach(panel => {

        // Panel kurz aktivieren, damit validatePanel() alle Inputs sieht
        const wasActive = panel.classList.contains("active");
        panel.classList.add("active");

        // Prüfen, ob validateNow existiert (dein Panel-Code hat panel.validateNow = validatePanel)
        if (typeof panel.validateNow === "function") {
            panel.validateNow();
        }

        // ursprünglichen Zustand wiederherstellen
        if (!wasActive) panel.classList.remove("active");
    });

});
// ENDE - VALIDIERUNG - Panels durchgehen



// START - Accordions Schrittweise ein- und ausblenden
document.addEventListener("DOMContentLoaded", () => {

    const btnPlus = document.getElementById("btn-plus");
    const btnMinus = document.getElementById("btn-minus");
    const container = document.getElementById("projects-container");
    const storageKey = "projectsVisibleCount"; // Speicher-Key

    if (!btnPlus || !btnMinus || !container) return;

    function getAccordions() {
        return Array.from(container.querySelectorAll('.project-accordion[data-index]'))
                    .sort((a,b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
    }

    function isHidden(el) {
        return window.getComputedStyle(el).display === "none";
    }

    function saveVisibleCount() {
        const count = getAccordions().filter(a => !isHidden(a)).length;
        localStorage.setItem(storageKey, count);
    }

    function restoreVisible() {
        const count = parseInt(localStorage.getItem(storageKey)) || 0;
        const accordions = getAccordions();
        accordions.forEach((a, i) => {
            a.style.display = i < count ? "block" : "none";
        });
    }

    function showNext() {
        const next = getAccordions().find(a => isHidden(a));
        if (next) next.style.display = "block";
        saveVisibleCount();
    }

    function hideLast() {
        const last = getAccordions().reverse().find(a => !isHidden(a));
        if (last) last.style.display = "none";
        saveVisibleCount();
    }

    btnPlus.addEventListener("click", showNext);
    btnMinus.addEventListener("click", hideLast);

    // Restore auf Basis von localStorage
    restoreVisible();

});
// ENDE - Accordions Schrittweise ein- und ausblenden



// START - Förderkennzeichen nicht vorhanden
document.addEventListener("DOMContentLoaded", () => {

    for (let i = 1; i <= 10; i++) {
        const checkbox = document.getElementById(`checkbox-text-${i}`);
        const input = document.querySelector(`input[name="forderkennzeichen-${i}"]`);
        if (!checkbox || !input) continue;

        // Event: Checkbox ändern
        checkbox.addEventListener("change", () => {
            if (checkbox.checked && input.value.trim() === "") {
                input.value = "noch nicht vorhanden";
            }
            // else → nichts tun, Inputinhalt bleibt
        });

        // Optional: direkt beim Laden prüfen
        if (checkbox.checked && input.value.trim() === "") {
            input.value = "noch nicht vorhanden";
        }
    }

});
// ENDE - Förderkennzeichen nicht vorhanden



// START - Anlage 3 - Zusatzangaben
document.addEventListener("DOMContentLoaded", function () {

    const endInputs = document.querySelectorAll('input[name^="p_ende_"]');

    function parseGermanDate(value) {
        const parts = value.split(".");
        if (parts.length !== 3) return null;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        return new Date(year, month, day);
    }

    function checkEndDate(input) {

        const value = input.value.trim();
        const match = input.name.match(/p_ende_(\d+)/);
        if (!match) return;

        const number = match[1];
        const dependent = document.querySelector(
            ".dependent-content-P" + number
        );
        if (!dependent) return;

        if (!value) {
            dependent.style.display = "none";
            triggerAccordionValidation(input);
            return;
        }

        const selectedDate = parseGermanDate(value);
        if (!selectedDate || isNaN(selectedDate)) {
            dependent.style.display = "none";
            triggerAccordionValidation(input);
            return;
        }

        const today = new Date();
        today.setHours(0,0,0,0);
        selectedDate.setHours(0,0,0,0);

        if (selectedDate < today) {
            dependent.style.display = "block";
        } else {
            dependent.style.display = "none";
        }

        triggerAccordionValidation(input);
    }

    function triggerAccordionValidation(input) {
        const accordion = input.closest(".project-accordion");
        if (accordion && typeof accordion.validateNow === "function") {
            accordion.validateNow();
        }
    }

    endInputs.forEach(input => {

        input.addEventListener("input", function () {
            checkEndDate(this);
        });

        input.addEventListener("change", function () {
            checkEndDate(this);
        });

        // Initial beim Laden prüfen
        checkEndDate(input);
    });

});
// ENDE - Anlage 3 - Zusatzangaben



// >>>START<<< - AG-SV in % berechnen
document.addEventListener("DOMContentLoaded", () => {

  // Hilfsfunktionen
  function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
  }

  function formatNumber(num) {
    return Math.round(num).toLocaleString("de-DE");
  }

  function berechneSV() {
    const personIDs = ["Z4-W1","Z4-W2","Z4-W3","Z4-W4","Z4-W5"];
    const svIDs     = ["Z5-W1","Z5-W2","Z5-W3","Z5-W4","Z5-W5"];

    let tooltipTexts = [];

    for (let i = 0; i < personIDs.length; i++) {
      const personEl = document.getElementById(personIDs[i]);
      const svEl     = document.getElementById(svIDs[i]);

      if (!personEl || !svEl) continue;

      const personWert = parseNumber(personEl.value);
      const svWert     = parseNumber(svEl.value);

      // Tooltip: Anteil in %
      const prozent = personWert ? (svWert / personWert) * 100 : 0;
      tooltipTexts.push(`J-${i + 1}:&nbsp;&nbsp;${prozent.toFixed(2).replace(".", ",")} %`);
    }

    // Tooltip aktualisieren
    const tooltipResultEl = document.getElementById("sv-result");
    if (tooltipResultEl) {
      tooltipResultEl.innerHTML = tooltipTexts.join("<br>");
    }
  }

  // Event-Listener auf alle relevanten Inputs
  const allInputs = [
    "Z4-W1","Z4-W2","Z4-W3","Z4-W4","Z4-W5",
    "Z5-W1","Z5-W2","Z5-W3","Z5-W4","Z5-W5"
  ];

  allInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", berechneSV);
  });

  // Initial einmal ausführen
  berechneSV();
});
// >>>ENDE<<< - AG-SV in % berechnen



// >>>START<<< - Anlage 3 - opt. Felder Validierung
document.addEventListener("DOMContentLoaded", function () {

    // Für P1 bis P10
    for (let p = 1; p <= 10; p++) {

        const zaehlerFeld = document.querySelector(`input[name="zus_angaben_P${p}"]`);

        if (!zaehlerFeld) continue;

        // Alle beobachteten Felder für P1..P10
        const feldNamen = [
            `begrundung_effekte_P${p}`,
            `A_ma-vza_P${p}`,
            `A-1_ma-vza_P${p}`,
            `A-2_ma-vza_P${p}`,
            `A-3_ma-vza_P${p}`,
            `A_umsatz_T€_P${p}`,
            `A-1_umsatz_T€_P${p}`,
            `A-2_umsatz_T€_P${p}`,
            `A-3_umsatz_T€_P${p}`
        ];

        // Map speichern, ob Feld aktuell "gefüllt" ist
        const gefuelltStatus = {};

        feldNamen.forEach(name => {
            const feld = document.querySelector(`[name="${name}"]`);
            if (!feld) return;

            // initial leer
            gefuelltStatus[name] = feld.value.trim() !== "";

            feld.addEventListener("input", () => {
                const vorherGefuellt = gefuelltStatus[name];
                const aktuellGefuellt = feld.value.trim() !== "";
                
                if (!vorherGefuellt && aktuellGefuellt) {
                    // +1
                    let wert = parseInt(zaehlerFeld.value.replace(/\D/g, "")) || 0;
                    zaehlerFeld.value = (wert + 1).toString();
                } else if (vorherGefuellt && !aktuellGefuellt) {
                    // -1
                    let wert = parseInt(zaehlerFeld.value.replace(/\D/g, "")) || 0;
                    zaehlerFeld.value = (wert - 1).toString();
                }

                // Status aktualisieren
                gefuelltStatus[name] = aktuellGefuellt;
            });
        });

    }

});
// >>>ENDE<<< - Anlage 3 - opt. Felder Validierung



// >>>START<<< - Grammatik - Textarea
document.addEventListener("DOMContentLoaded", () => {
    const textareas = document.querySelectorAll("textarea.grammar-check");

    // Debounce-Funktion: verhindert zu viele Requests
    function debounce(fn, delay = 800) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    textareas.forEach(textarea => {
        // Container für Vorschläge direkt nach textarea
        let feedback = document.createElement("div");
        feedback.className = "grammar-feedback";
        feedback.style.fontSize = "0.9rem";
        feedback.style.marginTop = "0.2rem";
        feedback.style.color = "red";
        textarea.after(feedback);

        textarea.addEventListener("input", debounce(async () => {
            const text = textarea.value;
            if (!text.trim()) {
                feedback.innerHTML = "";
                return;
            }

            try {
                const resp = await fetch("https://api.languagetool.org/v2/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        text: text,
                        language: "de-DE"
                    })
                });
                const data = await resp.json();

                if (!data.matches.length) {
                    feedback.innerHTML = "<span style='color:green'>Keine Fehler gefunden</span>";
                    return;
                }

                // Vorschläge anzeigen
                feedback.innerHTML = data.matches.map(m => {
                    const fehler = m.context.text.substr(m.context.offset, m.context.length);
                    const vorschlag = m.replacements.length ? m.replacements[0].value : "(kein Vorschlag)";
                    return `<b>${fehler}</b> → ${vorschlag}`;
                }).join("<br>");
            } catch (e) {
                feedback.innerHTML = "Fehler bei der Grammatikprüfung";
            }
        }, 800));
    });
});
// >>>ENDE<<< - Grammatik - Textarea



// >>>START<<< - Projekt-Accordion, Validierung und Header-Vorschau (komplett)
document.addEventListener("DOMContentLoaded", () => {
  const MAX_PREVIEW_LENGTH = 100;

  // Alle Accordions initial aufsetzen
  document.querySelectorAll(".project-accordion").forEach(setupAccordion);

  // Nach dem Aufsetzen: alle Accordions initial validieren (Icons korrekt)
  document.querySelectorAll(".project-accordion").forEach(acc => {
    if (typeof acc.__validate === "function") acc.__validate(false);
  });

  function setupAccordion(accordion) {
    const header = accordion.querySelector(".projekte-header");
    const content = accordion.querySelector(".fue-projekte-inhalt");
    const preview = header?.querySelector(".preview");
    const statusIcon = accordion.querySelector(".status-icon");

    if (!header || !content || !statusIcon) return;

    // Start Zustand: geschlossen
    content.classList.add("hidden-projekte");

    // Felder mit Validierungsregeln
    const fields = Array.from(
      accordion.querySelectorAll('[data-validate="on"], [data-validate="visible"], [data-validate="zero"]')
    );

    // Nutzer-Interaktion (berührte Felder)
    const touched = new WeakSet();

    // Flags für deine gewünschte Logik
    let partialOnClose = false; // gab es beim Schließen eine Teilausfüllung?
    let errorsArmed = false;    // beim nächsten Öffnen automatische rote Rahmen aktivieren

    // Sichtbarkeit
    const isOpen = () => !content.classList.contains("hidden-projekte");
    function isVisibleNow(el) {
      return el.offsetParent !== null && window.getComputedStyle(el).display !== "none";
    }
    // Sichtbar, wenn Accordion geöffnet wäre (für Icon-Validität im geschlossenen Zustand)
    function isVisibleWhenOpen(el) {
      const wasHidden = content.classList.contains("hidden-projekte");
      if (!wasHidden) return isVisibleNow(el);
      content.classList.remove("hidden-projekte");
      const visible = isVisibleNow(el);
      content.classList.add("hidden-projekte");
      return visible;
    }

    // Preview (Titel) aktualisieren
    const titleInput = accordion.querySelector("textarea.input");
    function updatePreview(text) {
      let t = (text || "").trim() || "Eintrag leer";
      if (t.length > MAX_PREVIEW_LENGTH) t = t.slice(0, MAX_PREVIEW_LENGTH) + " …";
      if (preview) preview.textContent = t;
    }
    if (titleInput) {
      titleInput.addEventListener("input", () => updatePreview(titleInput.value));
      updatePreview(titleInput.value || "");
    }

    // Helpers: Werte
    function raw(el) {
      return (el.value || "").trim();
    }
    function isEmpty(v) {
      return v === "" || v.toLowerCase() === "wählen";
    }
    function asNumber(v) {
      const n = parseFloat((v || "").replace(",", "."));
      return isNaN(n) ? 0 : n;
    }

    // Feld-Gültigkeit
    // mode = 'icon' (so als ob offen), 'ui' (aktueller Sichtbarkeitszustand)
    function fieldValid(el, mode = "ui") {
      const type = el.dataset.validate;
      const v = raw(el);
      const visible = (mode === "icon") ? isVisibleWhenOpen(el) : isVisibleNow(el);

      if (type === "on") {
        return !isEmpty(v);
      }
      if (type === "visible") {
        return !visible ? true : !isEmpty(v);
      }
      if (type === "zero") {
        // zero vollständig, wenn sichtbar UND Wert != 0
        return !visible ? true : asNumber(v) !== 0;
      }
      return true;
    }

    // UI-Partial prüfen (für Schließen-Moment)
    function computePartialUI() {
      const applicableFields = fields.filter(f => {
        const t = f.dataset.validate;
        if (t === "visible" || t === "zero") return isVisibleNow(f);
        return true; // "on" gilt immer
      });
      const anyFilled = applicableFields.some(f => {
        const t = f.dataset.validate;
        const v = raw(f);
        return t === "zero" ? asNumber(v) !== 0 : !isEmpty(v);
      });
      const anyInvalid = applicableFields.some(f => !fieldValid(f, "ui"));
      return anyFilled && anyInvalid;
    }

    // Rote Umrandung setzen/löschen (inline, damit nichts kaputt geht)
    function setErrorBorder(el, on) {
      el.style.border = on ? "1px solid red" : "";

      // Optional: korrespondierendes TD für zero-Felder einfärben
      if (el.dataset.validate === "zero" && el.name) {
        const pMatch = el.name.match(/P(\d+)/);
        if (pMatch) {
          const td = document.getElementById(`rot_rahmen_P${pMatch[1]}`);
          if (td) td.style.border = on ? "1px solid red" : "";
        }
      }
    }

    // Zentrale Validierung
    function validate(justOpened = false) {
      // 1) Icon-Status: prüfe Gültigkeit „sichtbar wenn offen“
      const allOk = fields.every(f => fieldValid(f, "icon"));
      statusIcon.classList.toggle("success", allOk);
      statusIcon.classList.toggle("error", !allOk);

      // 2) Keine roten Rahmen im geschlossenen Zustand
      if (!isOpen()) {
        fields.forEach(f => setErrorBorder(f, false));
        return;
      }

      // 3) Applicable-Felder (on immer; visible/zero nur sichtbar)
      const applicableFields = fields.filter(f => {
        const t = f.dataset.validate;
        if (t === "visible" || t === "zero") return isVisibleNow(f);
        return true;
      });

      // 4) „Partial“-Erkennung im offenen Zustand
      const anyFilled = applicableFields.some(f => {
        const t = f.dataset.validate;
        const v = raw(f);
        return t === "zero" ? asNumber(v) !== 0 : !isEmpty(v);
      });
      const anyInvalid = applicableFields.some(f => !fieldValid(f, "ui"));
      const partial = anyFilled && anyInvalid;

      // 5) Alles leer: keine roten Rahmen
      if (!anyFilled) {
        applicableFields.forEach(f => setErrorBorder(f, false));
        return;
      }

      // 6) Rahmen-Logik
      //    - Erste Öffnung: Nur „touched“ Felder rot (keine automatische roten Rahmen).
      //    - Nach Schließen+Wieder-Öffnen mit Teilbefüllung: alle unvollständigen Felder rot.
      fields.forEach(f => {
        const invalidNow = !fieldValid(f, "ui");
        const t = f.dataset.validate;
        const applicable =
          t === "on" ||
          (t === "visible" && isVisibleNow(f)) ||
          (t === "zero" && isVisibleNow(f));

        const show = applicable && invalidNow && (touched.has(f) || (errorsArmed && partial));
        setErrorBorder(f, show);
      });
    }

    // Exponiere Validierung
    accordion.__validate = validate;

    // Header-Click: auf/zu + Logik für „Errors scharf schalten“
    header.addEventListener("click", () => {
      const willOpen = content.classList.contains("hidden-projekte");

      // Wir schließen: partial-Status merken
      if (!willOpen) {
        partialOnClose = computePartialUI();
      }

      // Auf-/Zuklappen
      content.classList.toggle("hidden-projekte");
      header.classList.toggle("open");

      // Beim Öffnen: ggf. automatische Fehlermarkierung aktivieren
      if (willOpen) {
        if (partialOnClose) errorsArmed = true;
        validate(true);
      } else {
        validate(false);
      }
    });

    // Feld-Events: live validieren + „touched“ markieren
    fields.forEach(f => {
      ["input", "change", "blur"].forEach(evt =>
        f.addEventListener(evt, () => {
          touched.add(f);
          validate(false);
        })
      );

      // Zero-Felder: abhängige Inputs live beobachten
      if (f.dataset.validate === "zero" && f.name) {
        const suffix = f.name.match(/P(\d+)/)?.[1];
        if (suffix) {
          [
            `begrundung_effekte_P${suffix}`,
            `A_ma-vza_P${suffix}`,
            `A-1_ma-vza_P${suffix}`,
            `A-2_ma-vza_P${suffix}`,
            `A-3_ma-vza_P${suffix}`,
            `A_umsatz_T€_P${suffix}`,
            `A-1_umsatz_T€_P${suffix}`,
            `A-2_umsatz_T€_P${suffix}`,
            `A-3_umsatz_T€_P${suffix}`
          ].forEach(name => {
            const t = document.querySelector(`[name="${name}"]`);
            if (t) {
              ["input", "change", "blur"].forEach(evt =>
                t.addEventListener(evt, () => validate(false))
              );
            }
          });
        }
      }
    });

    // Initiale Validierung
    validate(false);
  }
});
// >>>ENDE<<< - Projekt-Accordion, Validierung und Header-Vorschau



// >>>START<<< - Förderprojekte: Panel-Validierung über Menü-Icon
document.addEventListener('DOMContentLoaded', () => {
  // IDs aus deiner Vorgabe
  const selectEl   = document.getElementById('select-100');       // Ja/Nein
  const checkboxEl = document.getElementById('-checkbox-5000');   // Eigene Liste

  // Menü-Icon gezielt ansteuern
  const menuIcon = document.querySelector('.menu-item[data-target="projekte"] .status-icon');

  if (!menuIcon) {
    console.warn('Förderprojekte-Statusicon im Menü nicht gefunden.');
    return;
  }

  // Sichtbarkeit prüfen
  const isVisible = (el) => !!(el && el.offsetParent !== null);

  // Mindestens ein sichtbares Accordion mit grünem Icon?
  function anyVisibleGreenAccordion() {
    const accs = document.querySelectorAll('.project-accordion');
    for (const acc of accs) {
      if (!isVisible(acc)) continue;
      const icon = acc.querySelector('.status-icon');
      if (icon && icon.classList.contains('success')) return true;
    }
    return false;
  }

  // Select-Wert (ja/nein; Platzhalter wie „wählen“ wird als unvollständig behandelt)
  function getSelectValue() {
    if (!selectEl) return '';
    return (selectEl.value || '').trim().toLowerCase();
  }

  // Kernregel: vollständig?
  function isPanelComplete() {
    const sel = getSelectValue(); // 'ja' | 'nein' | sonst
    if (sel === 'nein') return true;
    if (sel === 'ja') {
      if (checkboxEl && checkboxEl.checked) return true;
      return anyVisibleGreenAccordion();
    }
    return false;
  }

  // UI-Update: Menü-Icon einfärben
  function updateUI() {
    const complete = isPanelComplete();
    menuIcon.classList.toggle('success', complete);
    menuIcon.classList.toggle('error', !complete);
    // Optional: Tooltip
    menuIcon.title = complete ? 'Vollständig' : 'Unvollständig';

    // Optional: Event für weitere Integrationen
    document.dispatchEvent(new CustomEvent('foerderprojekte:statuschange', {
      detail: { complete }
    }));
  }

  // Event-Wiring
  if (selectEl)   selectEl.addEventListener('change', updateUI);
  if (checkboxEl) checkboxEl.addEventListener('change', updateUI);

  // Eingaben in Accordions beobachten (damit grüne Icons/Validität einfließen)
  function armAccordionInputListeners() {
    document.querySelectorAll('.project-accordion').forEach(acc => {
      acc.addEventListener('input', updateUI,  { capture: true });
      acc.addEventListener('change', updateUI, { capture: true });
    });
    // Sichtbarkeitswechsel durch Header-Klicks berücksichtigen
    document.querySelectorAll('.project-accordion .projekte-header').forEach(h => {
      h.addEventListener('click', () => setTimeout(updateUI, 0)); // nach toggle
    });
  }

  // Icon-Klassen direkt beobachten (success/error)
  const iconMutationObserver = new MutationObserver(updateUI);
  function observeIcons() {
    document.querySelectorAll('.project-accordion .status-icon').forEach(icon => {
      iconMutationObserver.observe(icon, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // Reagiere auf Plus/Minus (DOM-Änderungen)
  const root = document.body;
  const domObserver = new MutationObserver(() => {
    armAccordionInputListeners();
    observeIcons();
    updateUI();
  });
  domObserver.observe(root, { childList: true, subtree: true });

  // Initial
  armAccordionInputListeners();
  observeIcons();
  updateUI();
});
// >>>ENDE<<< - Förderprojekte: Panel-Validierung über Menü-Icon


// >>>START<<< - Glöcke
document.addEventListener('DOMContentLoaded', () => {
  const bell = document.getElementById('deadline-bell');
  if (!bell) return;

  // Animation starten
  bell.classList.add('wiggle');

  // Nach 5 Sekunden wieder stoppen
  setTimeout(() => {
    bell.classList.remove('wiggle');
  }, 5000);
});
// >>>ENDE<<< - Glöcke



// >>>START<<< - Toggle .menu-item[data-target="reset"] via Ctrl+Alt+Space
document.addEventListener('keydown', (e) => {
  const isSpace = e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar';
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;

  if (e.ctrlKey && e.altKey && isSpace) {
    // Optional: während aktiver Texteingabe nicht triggern
    if (isTyping) return;

    e.preventDefault(); // verhindert Scrollen/Default-Aktion der Leertaste
    const item = document.querySelector('.menu-item[data-target="reset"]');
    if (!item) return;

    item.classList.toggle('hidden-menu');

    // Optional: Fokus hineinsetzen, wenn sichtbar
    if (!item.classList.contains('hidden-menu')) {
      const focusable = item.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }
  }
});
// >>>ENDE<<< - Toggle .menu-item[data-target="reset"] via Ctrl+Alt+Space



// >>>START<<< - Ausfüllen bis - prüfen
(function() {
  const FIELD_ID = 'deadline-date';
  const EXPIRED_CLASS = 'deadline-date-expired';
  const POLL_MS = 300; // Intervall für stille Value-Änderungen

  // Parser: TT.MM.JJJJ oder ISO YYYY-MM-DD
  function parseLocal(val) {
    if (!val) return null;
    const s = String(val).trim();
    let m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (m) return new Date(+m[3], +m[2]-1, +m[1]);
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return new Date(+m[1], +m[2]-1, +m[3]);
    return null;
  }

  function isExpired(val) {
    const d = parseLocal(val);
    if (!d) return false;
    d.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    return today.getTime() > d.getTime();
  }

  function applyColor() {
    const el = document.getElementById(FIELD_ID);
    if (!el) return;
    el.classList.toggle(EXPIRED_CLASS, isExpired(el.value));
  }

  // Kleiner Debounce für globale Ereignisse
  function debounce(fn, ms) {
    let t; return function() { clearTimeout(t); t = setTimeout(fn, ms); };
  }
  const schedule = debounce(applyColor, 50);

  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById(FIELD_ID);
    if (!el) return;

    // Initial
    applyColor();

    // Direkte Feld-Events (falls doch genutzt)
    el.addEventListener('input', applyColor);
    el.addEventListener('change', applyColor);

    // Globale Events: decken Panelwechsel/Klicks und Import-Handler ab
    ['input', 'change', 'click', 'keyup', 'focusout'].forEach(evt => {
      document.addEventListener(evt, schedule, true); // capture-Phase
    });

    // Optional: dein Import-Handler feuert bereits 'csv:imported' → darauf reagieren
    document.addEventListener('csv:imported', schedule);

    // Sichtbarkeitswechsel/BFCache (Tabwechsel, Zurück-Navigation)
    window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });

    // Cross-Tab-Änderungen (falls Storage beteiligt ist)
    window.addEventListener('storage', (e) => {
      if (e.key === 'deadlineDate') schedule();
    });

    // Polling: erkennt reine .value-Zuweisungen ohne Events
    let last = el.value;
    setInterval(() => {
      if (!document.getElementById(FIELD_ID)) return; // falls DOM geändert
      const cur = el.value;
      if (cur !== last) {
        last = cur;
        applyColor();
      }
    }, POLL_MS);
  });

  // Optional: globaler Hook, falls du manuell triggern willst
  window.applyDeadlineColor = applyColor;
})();
// >>>ENDE<<< - Ausfüllen bis - prüfen



