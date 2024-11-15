import { writable, type Writable } from 'svelte/store';
import {Conference} from '$lib/models/conference';
import { browser } from '$app/environment';

export const conference: Writable<Conference | null> = writable(null);

conference.subscribe((val) => browser && localStorage.setItem("conference",JSON.stringify(val)));

export function setConference(conference_data : Conference) {
    conference.set( conference_data );
}

export function clearConference() {
    conference.set( null );
}