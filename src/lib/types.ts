// lib/types.ts

export interface Conference {
    id: number;
    title: string;
    description: string;
    deadline: string;
    created_at: string;
    user_id: number;
}


export interface ConferenceFormData {
    conference_id: number;
    title: string;
    deadline: string;
    description: string;
    user_id: number;
}