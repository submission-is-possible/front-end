import { goto } from '$app/navigation';
import { setConference } from '$stores/conferenceStore';
import { Role } from '$lib/models/role'

export class Conference {
    id: Number;
    title : String;
    description : String;
    created_at : Date;
    deadline: Date;
    roles: Role[];

    constructor(id: Number, title : String, created_at : Date, deadline: Date, description : String, roles:Role[]){
        this.id = id;
        this.title = title;
        this.created_at = new Date(created_at);
        this.deadline = new Date(deadline);
        this.description = description;
        this.roles = roles;
    }
}

export function goToConferenceDetail(conference: Conference) {
    setConference( conference );
    goto(`/conference/${conference.id}/`);
  }