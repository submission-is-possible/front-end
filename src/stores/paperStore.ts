import { writable, type Writable } from 'svelte/store';
import { Paper } from '$lib/models/paper';
import { browser } from '$app/environment';

// Writable store per salvare un singolo Paper
export const paper: Writable<Paper | null> = writable(null);

// Subscrive e salva i dati su localStorage (se esiste il browser)
paper.subscribe((val) => {
    if (browser) {
        localStorage.setItem("paper", JSON.stringify(val));
    }
});

// Funzione per impostare un Paper nel store
export function setPaper(paper_data: Paper) {
    paper.set(paper_data);
}

// Funzione per resettare il Paper
export function clearPaper() {
    paper.set(null);
}

// Recupera il Paper dal localStorage all'avvio (se esiste)
if (browser) {
    const storedPaper = localStorage.getItem("paper");
    if (storedPaper) {
        paper.set(JSON.parse(storedPaper));
    }
}
