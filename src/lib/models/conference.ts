import { goto } from '$app/navigation';
import { setConference } from '$stores/conferenceStore';
import { Role } from '$lib/models/role'
import type { ReviewTemplateItem } from '$lib/models/reviewItem'

export class Conference {
    id: Number;
    user_id: Number;
    title : String;
    description : String;
    created_at : Date;
    deadline: Date;
    papers_deadline: Date;
    roles: Role[];
    status: String;
    reviewTemplate: ReviewTemplateItem[];

    constructor(id: Number, creator_id: Number, title : String, created_at : Date, deadline: Date, papers_deadline: Date,status: String,  description : String, roles:Role[]){
        this.id = id;
        this.user_id = creator_id;
        this.title = title;
        this.created_at = new Date(created_at);
        this.deadline = new Date(deadline);
        this.papers_deadline = new Date(papers_deadline);
        this.description = description;
        this.roles = roles;
        this.status = status;
        this.reviewTemplate = [];
    }
}

export function goToConferenceDetail(conference: Conference) {
  setConference( conference );
  const deadlineDate = new Date(conference.papers_deadline);
  if(deadlineDate > new Date()){
    goto(`/conference/preference/${conference.id}/`);
  }
  else{
    goto(`/conference/detail/${conference.id}/`);
  }
}