import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

const nullUser = { email: null, id: null, isLoggedin:false};
let lUser : User = nullUser;
if ( browser ){
    let localItem :string | null = localStorage.getItem("user");
    if (localItem){
        let localUser : User = JSON.parse(localStorage.getItem("user") as string);
        lUser = localUser;
    }
}

export const user: Writable<User> = writable( lUser );

user.subscribe((val) => browser && localStorage.setItem("user",JSON.stringify(val)));

export function setUser(userData: User) {
    userData.isLoggedin=true;
    user.set( userData );
}

export function clearUser() {
    user.set( nullUser );
}