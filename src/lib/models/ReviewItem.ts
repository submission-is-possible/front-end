import type { Conference } from "./conference";
import type { Paper } from "./paper";

export class ReviewTemplateItem{
    id: number;
    label: string;
    description: string;
    has_comment: boolean;
    has_score: boolean;
    comment: string;
    score: number;

    constructor ( id: number, label: string, description: string, has_comment: boolean, has_score: boolean,comment : string, score: number){
        this.id = id;
        this.label = label;
        this.description = description;
        this.has_comment = has_comment;
        this.has_score = has_score;
        this.comment = comment;
        this.score = score;
    }
}