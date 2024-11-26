<script lang="ts">
    import { goto } from '$app/navigation';
    import { conference } from '$stores/conferenceStore';

    interface FormData {
        title: string,
        paper_file: File | null
    }
    
    interface FormErrors {
        title?: string;
        paper_file?: string;
        submit?: string;
    }
    
    let formData: FormData = {
        title: '',
        paper_file: null
    }
    
    let errors: FormErrors = {};
    let submitStatus: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
    let base64File: string = '';
    let selectedFile: File | null = null;
    let fileInput: HTMLInputElement;
    
    function handleFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            selectedFile = input.files[0];
            formData.paper_file = selectedFile;
        } else {
            selectedFile = null;
            formData.paper_file = null;
        }
    }

    function gotoConference() {
        goto('/conferences');
    }

    async function validateForm(): Promise<boolean> {
        errors = {};
    
        if (!formData.title || !formData.title.trim()) {
            errors.title = 'Please enter a paper title';
        }

        if (!selectedFile) {
            errors.paper_file = 'Please select a file';
        } else {
            // Optional: Add more specific file validations
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!allowedTypes.includes(selectedFile.type)) {
                errors.paper_file = 'Invalid file type. Please upload PDF or Word document.';
            }

            if (selectedFile.size > maxSize) {
                errors.paper_file = 'File is too large. Maximum size is 10MB.';
            }
        }
        
        return Object.keys(errors).length === 0;
    }

    async function convertFileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    }
    
    async function handleSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();

        // Reset previous state
        errors = {};
        submitStatus = 'submitting';

        // Validate form
        const isValid = await validateForm();
        if (!isValid) {
            submitStatus = 'error';
            return;
        }

        // Ensure conference is selected
        if (!$conference?.id) {
            errors.submit = 'Please select a conference first';
            submitStatus = 'error';
            return;
        }

        try {
            // Ensure file is selected before converting (TypeScript non-null assertion)
            if (!selectedFile) {
                throw new Error('No file selected');
            }

            // Convert file to base64
            base64File = await convertFileToBase64(selectedFile);

            // Prepare submission data
            const submissionData = {
                title: formData.title.trim(),
                paper_file: base64File,
                conference_id: $conference.id
            };

            const response = await fetch('http://localhost:8000/papers/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();

            if (!response.ok) {
                submitStatus = 'error';
                errors.submit = data.error || 'Submission failed';
                return;
            }

            submitStatus = 'success';

            formData.title = '';

            formData.paper_file = null;
            selectedFile = null;
            base64File = '';

        } catch (error) {
            console.error('Submission error:', error);
            submitStatus = 'error';
            errors.submit = error instanceof Error 
                ? error.message 
                : 'Server Connection Error. Please retry.';
        }
    }
</script>

<div class="container mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
        <button 
            class="btn btn-ghost" 
            on:click={gotoConference}
            data-testid="back-to-conferences-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
        </button>
        <h1 class="text-2xl font-bold">Submit Your Paper</h1>
    </div>

    <form 
        class="space-y-6 shadow-md rounded-lg px-8 py-6" 
        method="POST"
        on:submit|preventDefault={handleSubmit}
        data-testid="create-paper-form"
    >
        <div>
            <label for="title" class="label">
                <span class="label-text">Paper Title</span>
            </label>
            <input 
                id="title" 
                type="text" 
                placeholder="Enter paper title"
                bind:value={formData.title} 
                class="input input-bordered w-full {errors.title ? 'input-error' : ''}"
                data-testid="title-input"
            />
            {#if errors.title}
                <span class="text-error text-sm mt-1" data-testid="title-error">
                    {errors.title}
                </span>
            {/if}
        </div>

        <div>
            <label for="paper_file" class="label">
                <span class="label-text">Paper File</span>
            </label>
            <input 
                id="paper_file" 
                type="file" 
                class="file-input file-input-bordered w-full {errors.paper_file ? 'file-input-error' : ''}"
                on:change={handleFileChange}
                accept=".pdf,.doc,.docx"
                data-testid="file-input"
            />
            {#if errors.paper_file}
                <span class="text-error text-sm mt-1" data-testid="file-error">
                    {errors.paper_file}
                </span>
            {/if}
        </div>

        {#if submitStatus === 'error'}
            <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span data-testid="submission-error">{errors.submit}</span>
            </div>
        {/if}

        {#if submitStatus === 'success'}
            <div class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span data-testid="submission-success">Paper Submitted Successfully!</span>
            </div>
        {/if}

        <button 
            type="submit" 
            class="btn btn-primary w-full mt-4"
            disabled={submitStatus === 'submitting'}
            data-testid="submit-button"
        >
            {#if submitStatus === 'submitting'}
                <span class="loading loading-spinner"></span>
                Submitting...
            {:else}
                Submit Paper
            {/if}
        </button>
    </form>
</div>