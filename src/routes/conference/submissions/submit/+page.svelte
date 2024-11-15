<script lang="ts">
    import { conference } from '$stores/conferenceStore';

    interface FormData {
        title: string,
        paper_file: File | null
    }
    
    interface FormErrors {
        title ? : boolean;
        paper_file ? : string;
        submit?: string
    }
    
    let formData: FormData = {
        title: '',
        paper_file: null
    }
    
    let errors: FormErrors = {};
    let submitStatus: string = '';
    let base64File: string;
    let selectedFile: File | null;
    
    function handleFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            selectedFile = input.files[0];
        }
    }

    async function validateForm(): Promise<boolean> {
        errors = {};
    
        if (!formData.title.trim()) {
            errors.title = true;
        }
        debugger;
        if (!selectedFile) {
            errors.paper_file = 'Insert a file'
        }
        else{
            try{
                debugger;
                base64File = await convertFileToBase64(selectedFile);
            }catch(error){
                errors.paper_file = 'Cannot process file'
            }
        }
        debugger;
        return Object.keys(errors).length === 0;
    }

    async function convertFileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // The result is in the format `data:<MIME-type>;base64,<data>`, so we need to strip the metadata
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    }
    
    async function handleSubmit(event: SubmitEvent): Promise < void > {
        event.preventDefault();
    
        if (!validateForm()) return;
    
        try {
            const response = await fetch('http://localhost:8000/papers/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: formData.title,
                    paper_file: base64File,
                    conference_id: $conference?.id
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
            <h1 class="text-2xl font-bold">Submit Your Paper</h1>
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
    
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="date" class="label">
                        <span class="label-text">Paper Abstract</span>
                    </label>
                    <input id="date" type="file" class="input input-bordered w-full"
                        bind:value={formData.paper_file} 
                        onchange={handleFileChange} data-testid="date-input"/>
                    {#if errors.paper_file}
                    <span class="label-text-alt text-error" role="alert" data-testid="date-error">{errors.paper_file}</span>
                    {/if}
                </div>
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
                <span data-testid="conference-creation-success">Paper Submitted!</span>
            </div>
            {/if}
    
            <button type="submit" class="btn btn-primary w-full" data-testid="create-button">
                Submit Paper
            </button>
        </form>
    </div>
    