'use strict';

const URL = "https://api.datamuse.com/words?";

export function buildQuery(perfect) {
    let query = [];
    let rhymes = document.getElementById("rhyme").value;
    let starts = document.getElementById("starts").value;
    let synonym = document.getElementById("synonym").value;
    if (rhymes) {
        if (perfect) {
            query.push("rel_rhy=" + rhymes);
        } else {
            query.push("rel_nry=" + rhymes);
        }
    } else {
        if (!perfect) {
            return "";
        }
    }

    if (starts) {
        query.push("sp=" + starts + "*");
    }

    if (synonym) {
        let synChoice = document.getElementById("synant");
        if (synChoice.value === "synonym") {
            query.push(`rel_syn=${synonym}`);
        } else {
            query.push(`rel_ant=${synonym}`);
        }
    }

    if (query.length > 0) {
        return query.join('&') + "&max=50";     // limit to 50 results
    } else {
        return "";
    }
}


export async function getWordList() {
    let query = buildQuery(true);   // Build query for perfect rhymes

    let perfect = [];
    let imperfect = [];

    if (query) {
        perfect = await fetchWordList(query);
    } else {
        perfect = [];
    }

    query = buildQuery(false);   // Build query for imperfect rhymes

    if (query) {
        imperfect = await fetchWordList(query);
    } else {
        imperfect = [];
    }

    return [perfect, imperfect];
}


async function fetchWordList(query) {
    let url = URL + query;

    let response = await fetch(url);

    if (response.ok) {
        let wordList = await response.json();
        return wordList;
    } else {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}
