'use strict';

import { offensive } from './offensiveb64.js';

const scoreTitle = "Score indicates how closely the rhyme matches the target word.  The higher the score, the closer the match.";

export default class View {
    renderList(perfect, imperfect) {
        let body = document.getElementById("tbody");
        body.innerHTML = "";

        // Create table header
        this.createTableHeader(perfect[0]);

        // Render the word lists
        this._renderList(perfect, true);
        this._renderList(imperfect, false);

        this.displayNumberOfResults(imperfect.length > 0);
    }


    _renderList(list, isPerfect) {
        const body = document.getElementById("tbody");
        const nSyllables = this.getNumberOfSyllables();
        const nSylValue = this.getSyllableComparison();

        const filtered = list
            .filter(item => !this._isProfane(item.word))
            .filter(item => this._passesSyllableFilter(item.numSyllables, nSyllables, nSylValue));

        for (const item of filtered) {
            const row = this._createRow(item, isPerfect);
            body.appendChild(row);
            this._appendCopyButtonCell(row);
        }
    }

    /* ========== FILTERING HELPERS ========== */

    _isProfane(word) {
        const b64 = btoa(word);
        return offensive.has(b64);
    }

    _passesSyllableFilter(itemSyllables, requested, mode) {
        if (requested <= 0) return true;

        if (mode === "exactly") {
            return itemSyllables === requested;
        }

        // default: "up to" (skip rows with more syllables than requested)
        return itemSyllables < requested;
    }

    /* ========== ROW / CELL CREATION ========== */

    _createRow(item, isPerfect) {
        const row = document.createElement("tr");

        // Ensure score field exists
        let itemWithScore = {};
        if (item.hasOwnProperty("score")) {
            itemWithScore = item;
        } else {
            const entries = Object.entries(item);
            entries.splice(1, 0, ["score", ""]);    // Insert empty score after word
            itemWithScore = Object.fromEntries(entries);
        }

        const values = Object.values(itemWithScore);
        values.forEach((value, index) => {
            const cell = this._createDataCell(value, index === 0 && !isPerfect);
            row.appendChild(cell);
        });

        return row;
    }

    _createDataCell(value, emphasize) {
        const cell = document.createElement("td");

        if (emphasize) {
            const em = document.createElement("em");
            em.innerText = value;
            cell.appendChild(em);
        } else {
            cell.innerText = value;
        }

        return cell;
    }

    /* ========== COPY BUTTON ========== */

    _appendCopyButtonCell(row) {
        const btnCell = document.createElement("td");
        const btn = this._createCopyButton(row);

        btnCell.appendChild(btn);
        row.appendChild(btnCell);
    }

    _createCopyButton(row) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", "Copy word");
        btn.title = "Copy word";
        btn.className = "copy-btn";
        btn.innerText = "📋";

        btn.addEventListener("click", (e) =>
            this._handleCopyClick(e, row, btn)
        );

        return btn;
    }

    async _handleCopyClick(event, row, btn) {
        event.stopPropagation();
        const word = row.cells[0].innerText.trim();

        if (await this._tryClipboardApi(word, btn)) return;

        this._fallbackCopy(word, btn);  // May work better with older browsers
    }

    async _tryClipboardApi(text, btn) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            this._showCopyResult(btn, true);
            return true;
        } catch {
            return false;
        }
    }

    _fallbackCopy(text, btn) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();

        try {
            const success = document.execCommand("copy");
            this._showCopyResult(btn, success);
        } catch {
            this._showCopyResult(btn, false);
        } finally {
            document.body.removeChild(ta);
        }
    }

    _showCopyResult(btn, success) {
        btn.innerText = success ? "✅" : "❌";
        setTimeout(() => { btn.innerText = "📋"; }, 2000);
    }

    /* ========== UI HELPERS ========== */

    enableSyllables() {
        document.getElementById("nSyl").disabled = false;
        document.getElementById("syllables").disabled = false;
        document.getElementById("syllableRow").style.color = "#202020";
    }


    disableSyllables() {
        document.getElementById("nSyl").disabled = true;
        document.getElementById("syllables").disabled = true;
        document.getElementById("syllableRow").style.color = "#a0a0a0";
    }


    createTableHeader(row) {
        let thead = document.getElementById("thead");
        thead.innerHTML = "";
        for (let key in row) {
            let th = document.createElement("th");
            if (key === "numSyllables") {
                th.innerText = "Syllables";
            } else {
                th.innerText = key.charAt(0).toUpperCase() + key.slice(1);
                if (key === "score") {
                    th.title = scoreTitle
                }
            }
            thead.appendChild(th);
        }
    }


    getNumberOfSyllables() {
        let syllables = document.getElementById("syllables").value
        let nSyllables = 0;
        if (syllables) {
            nSyllables = parseInt(syllables);
        }

        return nSyllables;
    }


    getSyllableComparison() {
        let nSyl = document.getElementById("nSyl");

        return nSyl.selectedOptions[0].innerText;
    }


    displayError(message) {
        let errorField = document.getElementById("errors");
        errorField.innerText = "Error: " + message;
        errorField.classList.remove("hidden");
    }

    clearError() { 
        let errorField = document.getElementById("errors");
        errorField.innerText = "";
        errorField.classList.add("hidden");
    }


    displayNumberOfResults(includeImperfect) {
        let tbody = document.getElementById("tbody");
        let info = document.getElementById("info");

        let nRows = tbody.rows.length;

        let results = nRows === 1 ? "result" : "results";

        let imperfect = includeImperfect ? "Imperfect rhymes in <em>italics.</em>" : "";


        info.innerHTML = `${nRows} ${results} returned. &nbsp;&nbsp; ${imperfect}`
        info.classList.remove("hidden");
    }

    clearInfo() {
        let info = document.getElementById("info");
        info.classList.add("hidden");
        info.innerHTML = "";
    }


    clear() {
        this.clearError();
        this.clearInfo();

        document.getElementById("thead").innerHTML = "";
        document.getElementById("tbody").innerHTML = "";

        let rhyme = document.getElementById("rhyme");
        rhyme.value = "";
        document.getElementById("starts").value = "";
        document.getElementById("synonym").value = "";
        document.getElementById("syllables").value = "";

        this.disableSyllables();

        rhyme.focus();
    }
}