import { goto } from '$app/navigation';
import { setPaper } from '$stores/paperStore';
import { Role } from '$lib/models/role';

export class Paper {
    id: number;
    title: string;
    paper_file: string;
    conference: number;
    conference_title: string;
    author: string;
    status: string;
    created_at: string;
    role: Role;

    constructor(id: number, title: string, paper_file: string, conference: number, conference_title: string, author: string, status: string, created_at: string, role: Role) {
        this.id = id;
        this.title = title;
        this.paper_file = paper_file;
        this.conference = conference;
        this.conference_title = conference_title;
        this.author = author;
        this.status = status;
        this.created_at = created_at;
        this.role = role;
    }
}

// Funzione aggiornata per settare il paper e navigare alla pagina di dettaglio
export async function goToPaperDetail(paper: Paper) {
    setPaper(paper);
    await goto(`/paper/${paper.id}/`);
}
