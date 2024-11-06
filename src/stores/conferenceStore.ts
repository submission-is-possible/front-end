import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export const conference: Writable<number | null> = writable(null);

conference.subscribe((val) => browser && localStorage.setItem("conference",JSON.stringify(val)));

export function setConference(conference_id : number) {
    conference.set( conference_id );
}

export function clearConference() {
    conference.set( null );
}