'use strict';

import { getWordList } from "./model.js";
import View from './view.js'

const view = new View();

view.disableSyllables();
document.getElementById("rhyme").focus();

// Event listeners
// ---------------

// Input form submission
document.getElementById("inputForm").addEventListener("submit", async (event) => {
    event.preventDefault()

    let perfect = [];   // Array of perfect rhymes
    let imperfect = []; // Array of imperfect rhymes

    try {
        [perfect, imperfect] = await getWordList();
    }
    catch (error) {
        view.displayError(error.message);
    }

    view.renderList(perfect, imperfect);
});


document.getElementById("nSyl").addEventListener("change", (event) => {
    view.clearError();
    view.clearInfo();

    let syllables = document.getElementById("syllables");
    let nSyl = document.getElementById("nSyl");
    if (nSyl.selectedOptions[0].innerText === "exactly") {
        syllables.min = 1;
    } else {
        syllables.min = 2;
    }
});


document.getElementById("syllables").addEventListener("input", (event) =>{
    view.clearError();
    view.clearInfo();

    let trailer = document.getElementById("trailer");
    if (event.target.value === '1') {
        trailer.innerText = "syllable";
    } else {
        trailer.innerText = "syllables";
    }
});


document.getElementById("starts").addEventListener("input", (event) => {
    view.clearError();
    view.clearInfo();
});


document.getElementById("synonym").addEventListener("input", (event) => {
    view.clearError();
    view.clearInfo();
});


document.getElementById("rhyme").addEventListener("input", (event) => {
    view.clearError();
    view.clearInfo();

    if (event.target.value) {
        view.enableSyllables();
    } else {
        view.disableSyllables();
    }
});


document.getElementById("clear").addEventListener("click", (event) => {
    view.clear();
});
