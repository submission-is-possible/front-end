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
    paper_deadline: Date;
    roles: Role[];

    constructor(id: Number, creator_id: Number, title : String, created_at : Date, deadline: Date, paper_deadline: Date, description : String, roles:Role[]){
        this.id = id;
        this.user_id = creator_id;
        this.title = title;
        this.created_at = new Date(created_at);
        this.deadline = new Date(deadline);
        this.paper_deadline = new Date(paper_deadline);
        this.description = description;
        this.roles = roles;
    }
}

export function goToConferenceDetail(conference: Conference) {
  setConference( conference );
  const deadlineDate = new Date(conference.deadline);
  if(deadlineDate > new Date()){
    goto(`/conference/preference/${conference.id}/`);
  }
  else{
    goto(`/conference/detail/${conference.id}/`);
  }
}