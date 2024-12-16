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

    constructor (){
        this.id = 0;
        this.label = '';
        this.description = '';
        this.has_comment = true;
        this.has_score = true;
        this.comment = '';
        this.score = 0;

    }

}