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
        this.created_at = created_at;
        this.deadline = deadline;
        this.description = description;
        this.roles = roles;
    }
}

export function goToConferenceDetail(conference: Conference) {
    setConference( conference );
    goto(`/conference/detail/`);
  }