import type { Conference } from "./conference";
import type { Paper } from "./paper";

export class ReviewTemplateItem{
    conference: Conference;
    label: string;
    description: string;
    has_comment: boolean;
    has_score: boolean;

    constructor (conference: Conference, label: string, description: string, has_comment: boolean, has_score: boolean){
        this.conference = conference;
        this.label = label;
        this.description = description;
        this.has_comment = has_comment;
        this.has_score = has_score;
    }
}



export class ReviewItem{
    paper: Paper;
    comment: string;
    score: number;

    constructor (paper: Paper, comment : string, score: number){
        this.paper = paper;
        this.comment = comment;
        this.score = score;
    }
}