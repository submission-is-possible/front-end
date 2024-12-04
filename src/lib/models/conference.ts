import { goto } from '$app/navigation';
import { setConference } from '$stores/conferenceStore';
import { Role } from '$lib/models/role'

export class Conference {
    id: Number;
    user_id: Number;
    title : String;
    description : String;
    created_at : Date;
    deadline: Date;
    roles: Role[];

    constructor(id: Number, creator_id: Number, title : String, created_at : Date, deadline: Date, description : String, roles:Role[]){
        this.id = id;
        this.user_id = creator_id;
        this.title = title;
        this.created_at = new Date(created_at);
        this.deadline = new Date(deadline);
        this.description = description;
        this.roles = roles;
    }
}

export function goToConference(conference: Conference) {
  setConference( conference );
  if(conference.deadline < new Date()){
    goto(`/conference/preference/${conference.id}/`);
  }
  else{
    goto(`/conference/detail/${conference.id}/`);
  }
}