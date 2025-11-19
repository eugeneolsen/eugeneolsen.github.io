'use strict';

import { offensive } from './offensiveb64.js';

export default class View {
    renderList(perfect, imperfect) {
        let body = document.getElementById("tbody");
        body.innerHTML = "";


        document.getElementById("credits").classList.add("hidden");

        // Create table header
        this.createTableHeader(perfect[0]);

        // Redner the word lists
        this._renderList(perfect, true);
        this._renderList(imperfect, false);

        this.displayNumberOfResults(imperfect.length > 0);
    }


    _renderList(list, isPerfect) {      // Private 
        let body = document.getElementById("tbody");

        let nSyllables = this.getNumberOfSyllables();
        let nSylValue = this.getSyllableComparison();

        for (let item of list) {
            // Check for profane and offensive words
            let b64 = btoa(item.word);
            let profane = offensive.some(element => element === b64);
            if (profane) { continue; }  // Skip profane and offensive words

            // Filter out rows that don't match the number of syllables requested
            if (nSyllables > 0 && nSylValue === "exactly") {
                if (item.numSyllables !== nSyllables) {
                    continue;   // skip rows that don't exactly match number of syllables specified
                }
            } else {
                if (nSyllables > 0 && item.numSyllables >= nSyllables) {
                    continue;   // Skip rows that have more syllables than requested
                }
            }

            // 
            let row = document.createElement("tr");
            body.appendChild(row);

            let first = true;
            for (let value of Object.values(item)) {
                let cell = document.createElement("td");
                row.appendChild(cell);

                if (first && !isPerfect) {
                    let em = document.createElement("em");
                    cell.appendChild(em);
                    em.innerText = value;
                    first = false;
                } else {
                    cell.innerText = value;
                }
            }
        }
    }


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

        document.getElementById("credits").classList.remove("hidden");

        rhyme.focus();
    }
}