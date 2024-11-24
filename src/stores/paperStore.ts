import { writable, type Writable } from 'svelte/store';
import { Paper } from '$lib/models/paper';
import { browser } from '$app/environment';

// Recupero iniziale dal localStorage
const storedPaper = browser ? localStorage.getItem('paper') : null;
export const paper: Writable<Paper | null> = writable(storedPaper ? JSON.parse(storedPaper) : null);

// Salvataggio nel localStorage (solo lato browser)
if (browser) {
    paper.subscribe((val) => {
        localStorage.setItem('paper', JSON.stringify(val));
    });
}

export function setPaper(paper_data: Paper) {
    paper.set(paper_data);
}

export function clearPaper() {
    paper.set(null);
}
