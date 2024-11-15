<script lang="ts">
import {
    goto
} from '$app/navigation';
let conferencePath: string | URL = "/conference";

interface FormData {
    title: string,
        admin_id: number,
        deadline: Date,
        description: string
}

interface FormErrors {
    title ? : boolean;
    admin_id ? : boolean;
    deadline ? : boolean;
    description ? : boolean;
    submit ? : string;
}

let formData: FormData = {
    title: '',
    admin_id: 0,
    deadline: new Date(),
    description: ''
}

let errors: FormErrors = {};
let submitStatus: string = '';

function validateForm(): boolean {
    errors = {};

    if (!formData.title.trim()) {
        errors.title = true;
    }

    if (!formData.description.trim()) {
        errors.description = true;
    }

    if (formData.deadline < new Date()) { // add a offset on today date
        errors.deadline = true;
    }

    console.log(errors);
    console.log(formData);
    return Object.keys(errors).length === 0;
}

function gotoConference() {
    goto(conferencePath);
}

async function handleSubmit(event: SubmitEvent): Promise < void > {
    event.preventDefault();

    if (!validateForm()) return;

    try {
        const response = await fetch('http://localhost:8000/conference/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                title: formData.title,
                deadline: formData.deadline,
                description: formData.description
            })
        });

        const data = await response.json();

        console.log(data.error);
        if (!response.ok) {
            submitStatus = 'error';
            errors.submit = data.error;
            return;
        }

        submitStatus = 'success';
        //goto(/conference); //intesa come agina di dettaglio della conferenza
        //setConference(data.conference_id);

    } catch (error) {
        submitStatus = 'error';
        errors.submit = 'Server Connection Error. Retry.';
    }
}
</script>

<div class="p-8">
    <div class="flex items-center justify-between mb-6">
        <button
            class="btn btn-secondary"
            onclick={gotoConference}
            data-testid="back-to-conferences-button">
            Go Back
        </button>
        <h1 class="text-2xl font-bold">Create New Conference</h1>
    </div>

    <form class="space-y-6" method="POST"
        onsubmit={handleSubmit}
        data-testid="crerate-conference-form">
        <div>
            <label for="title" class="label">
                <span class="label-text">Title</span>
            </label>
            <input id="title" type="text" placeholder="Enter conference title"
                bind:value={formData.title} class="input input-bordered w-full" data-testid="title-input"/>
            {#if errors.title}
            <span class="label-text-alt text-error" role="alert" data-testid="title-error">Insert a title</span>
            {/if}
        </div>

        <div>
            <label for="description" class="label">
                <span class="label-text">Description</span>
            </label>
            <textarea id="description" placeholder="Enter conference description"
                bind:value={formData.description} class="textarea textarea-bordered w-full" data-testid="description-input"></textarea>
            {#if errors.description}
            <span class="label-text-alt text-error" role="alert" data-testid="description-error">Insert a description</span>
            {/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="date" class="label">
                    <span class="label-text">Date</span>
                </label>
                <input id="date" type="date" class="input input-bordered w-full"
                    bind:value={formData.deadline} data-testid="date-input"/>
                {#if errors.deadline}
                <span class="label-text-alt text-error" role="alert" data-testid="date-error">Insert a date</span>
                {/if}
            </div>

            <div>
                <label for="location" class="label">
                    <span class="label-text">Location</span>
                </label>
                <input id="location" type="text" placeholder="Enter conference location" class="input input-bordered w-full" data-testid="location-input"/>
            </div>
        </div>

        <div>
            <label for="recording" class="cursor-pointer label">
                <span class="label-text">Allow Recording</span>
                <input type="checkbox" id="recording" class="checkbox" data-testid="recording-input"/>
            </label>
        </div>

        <!-- Submit Error Message -->
        {#if submitStatus === 'error'}
        <div class="alert alert-error mt-4" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span data-testid="conference-creation-error">{errors.submit}</span>
        </div>
        {/if}

        <!-- Submit Success Message -->
        {#if submitStatus === 'success'}
        <div class="alert alert-success mt-4" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span data-testid="conference-creation-success">Conference created!</span>
        </div>
        {/if}

        <button type="submit" class="btn btn-primary w-full" data-testid="create-button">
            Create Conference
        </button>
    </form>
</div>
