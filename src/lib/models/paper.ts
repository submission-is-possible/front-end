export class Paper {
    id: number;
    title: string;
    paper_file: string;
    conference: number;
    conference_title: string;
    author: string;
    status: string;
    created_at: string;

    constructor(id: number, title: string, paper_file: string, conference: number, conference_title: string, author: string, status: string, created_at: string) {
        this.id = id;
        this.title = title;
        this.paper_file = paper_file;
        this.conference = conference;
        this.conference_title = conference_title;
        this.author = author;
        this.status = status;
        this.created_at = created_at;
    }
}