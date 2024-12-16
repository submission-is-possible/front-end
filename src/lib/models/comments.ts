export class Comment{
    user:User;
    review_id:number;
    comment_text:string;
    created_at: Date;

    constructor(user:User, review_id:number, comment_text:string, created_at: Date){
        this.user=user;
        this.review_id=review_id;
        this.comment_text=comment_text;
        this.created_at=created_at;
    }
}