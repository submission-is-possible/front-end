import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export const user: Writable<User|null> = writable( null );

user.subscribe((val) => browser && localStorage.setItem("user",JSON.stringify(val)));

export function setUser(userData: User) {
    userData.isLoggedin=true;
    user.set( userData );
}

export function clearUser() {
    user.set( null );
}