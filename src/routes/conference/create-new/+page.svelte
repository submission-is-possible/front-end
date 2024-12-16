<script lang="ts">
import ReviewCustomization from '$lib/components/ReviewCustomization.svelte';
import ReviewItemList from '$lib/components/ReviewItem.svelte';
import { goto } from '$app/navigation';
import { user } from '$stores/userStore'
import BlindingSelector from '$lib/components/BlindingSelector.svelte';
    import { ReviewTemplateItem } from '$lib/models/reviewItemData';
let conferencePath: string | URL = "/conference";

interface FormData {
  title: string;
  admin_id: number;
  deadline: string; // Cambiato a string per supportare il formato yyyy-MM-dd
  description: string;
  papers_deadline: string;
  status: string;
}

interface FormInvitations {
  reviewers: { email: string }[];
}

interface FormErrors {
  title?: boolean;
  admin_id?: boolean;
  deadline?: boolean;
  description?: boolean;
  papers_deadline?: boolean;
  submit?: string;
  csvFile?: string;
}

// Funzione per formattare la data nel formato yyyy-MM-dd
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let formData: FormData = {
  title: '',
  admin_id: 0,
  deadline: formatDate(new Date()), // Imposta deadline come stringa formattata
  description: '',
  papers_deadline: formatDate(new Date()),
  status: 'none'
};

let formInvitations: FormInvitations = {
  reviewers: []
};


let errors: FormErrors = {};
let submitStatus: string = '';
let csvFile: File | null = null;

function validateForm(): boolean {
    errors = {};

    if (!formData.title.trim()) {
        errors.title = true;
    }

    if (!formData.description.trim()) {
        errors.description = true;
    }

    if (new Date(formData.deadline) < new Date()) {
      errors.deadline = true;
    }

    if (new Date(formData.papers_deadline) < new Date()) {
      errors.papers_deadline = true;
    }

    return Object.keys(errors).length === 0;
}

function gotoConference() {
    goto(conferencePath);
}

let ReviewTemplate: ReviewTemplateItem[]=[];

function setReviewTemplate(template:ReviewTemplateItem[]) {
  ReviewTemplate = template;
}

async function handleCsvUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    csvFile = input.files[0];
    
    // Create FormData object
    const formData = new FormData();
    formData.append('csv_file', csvFile);

    try {
      const response = await fetch('http://localhost:8000/conference/upload_reviewers_csv/', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        errors.csvFile = data.error;
        return;
      }

      // Add extracted emails to the reviewers list
      formInvitations.reviewers = data.emails.map((email: string) => ({ email }));
    } catch (error) {
      errors.csvFile = 'Error processing CSV file';
    }
  }
}

async function handleSubmit(event: SubmitEvent): Promise < void > {
    event.preventDefault();

    if(!validateForm()) return;

    // Filter out empty or invalid emails
    const validReviewers = formInvitations.reviewers.filter(reviewer => 
        reviewer.email.trim() !== ''
    );

    try {
      const response = await fetch('http://localhost:8000/conference/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include',
        body: JSON.stringify({
          reviewers: validReviewers,
          reviewTemplate: ReviewTemplate,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        submitStatus = 'error';
        errors.submit = data.error;
        return;
      }

      submitStatus = 'success';

      // Navigate to home/conference list after successful creation
      setTimeout(() => {
        goto(conferencePath);
      }, 100);

    } catch (error) {
      submitStatus = 'error';
      errors.submit = 'Server Connection Error. Retry.';
    }
  }

  function addEmail(role: 'reviewers') {
    formInvitations[role] = [...formInvitations[role], { email: '' }];
  }

  function removeEmail(role: 'reviewers', index: number) {
    formInvitations[role] = formInvitations[role].filter((_, i) => i !== index);
  } 

  //serve per gestire lo stato del modal (info del csv)
  let isInfoModalOpen = false;
  let isReviewCustomizationModalOpen = false;

  //per toggleare il modal
  function toggleInfoModal() {
    isInfoModalOpen = !isInfoModalOpen;
  }

  function toggleReviewCustomizationModal() {
    isReviewCustomizationModalOpen = !isReviewCustomizationModalOpen;
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

  <form class="space-y-6" method="POST" onsubmit={handleSubmit} data-testid="create-conference-form">
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
        <label for="submission-deadline" class="label">
          <span class="label-text">Submission Deadline</span>
        </label>
        <input id="submission-deadline" type="date" class="input input-bordered w-full"
          bind:value={formData.papers_deadline} data-testid="submission-deadline-input"/>
        {#if errors.papers_deadline}
          <span class="label-text-alt text-error" role="alert" data-testid="submission-deadline-error">Insert a submission deadline</span>
        {/if}
      </div>

      <div>
        <label for="conference-deadline" class="label">
          <span class="label-text">Conference Date</span>
        </label>
        <input id="conference-deadline" type="date" class="input input-bordered w-full"
          bind:value={formData.deadline} data-testid="conference-deadline-input"/>
        {#if errors.deadline}
          <span class="label-text-alt text-error" role="alert" data-testid="conference-deadline-error">Insert a conference date</span>
        {/if}
      </div>

      {#if formData.deadline <= formData.papers_deadline}
        <div class="col-span-2">
          <span class="label-text-alt text-error" role="alert" data-testid="date-error">Conference date must be after submission deadline</span>
        </div>
      {/if}
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="Blinding" class="label">
          <span class="label-text">Blinding</span>
        </label>
        <BlindingSelector onSelection={ (key) => formData.status = key }/>
      </div>
      
      <div>
        <label for="location" class="label">
          <span class="label-text">Location</span>
        </label>
        <input id="location" type="text" placeholder="Enter conference location" class="input input-bordered w-full" data-testid="location-input"/>
      </div>
    </div>



    <div class="grid grid-cols-2 gap-4">
      <!-- CSV Upload for Reviewers -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-semibold">Upload Reviewers CSV</h3>
          <button 
            class="btn btn-ghost btn-xs btn-circle"
            type="button"
            onclick={toggleInfoModal}
            aria-label="CSV format info">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h1m0-4h-1m1 8v2m-1 2a9 9 0 100-18 9 9 0 000 18z" />
            </svg>
          </button>
        </div>
        <div class="form-control w-full">
          <input 
            type="file" 
            accept=".csv"
            class="file-input file-input-bordered w-full" 
            onchange={handleCsvUpload}
            data-testid="csv-upload-input"
          />
          {#if errors.csvFile}
            <span class="label-text-alt text-error" role="alert">{errors.csvFile}</span>
          {/if}
        </div>
      </div>

      <!-- Reviewers List with scroll -->
      <div>
        <h3 class="font-semibold mb-2">Reviewers</h3>
        <div class="relative">
          {#if formInvitations.reviewers.length > 0}
            <div class="max-h-64 overflow-y-auto border rounded-lg p-2 mb-2">
              {#each formInvitations.reviewers as reviewer, index}
                <div class="flex items-center mb-2 last:mb-0">
                  <input type="text" 
                    bind:value={reviewer.email} 
                    placeholder="Reviewer email"
                    class="input input-bordered w-full" 
                    data-testid="reviewer-email-input"/>
                  <button 
                    type="button" 
                    class="btn btn-error btn-sm ml-2" 
                    onclick={() => removeEmail('reviewers', index)}>
                    Remove
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          <button 
            type="button" 
            class="btn btn-secondary w-full" 
            onclick={() => addEmail('reviewers')}>
            Add Reviewer
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
      </div>
      <div>
        <button
          class="btn w-full"
          type="button"
          onclick={toggleReviewCustomizationModal}
          >
          Customize Review
        </button>
      </div>
    </div>

    <!-- CSV Info Modal -->
    {#if isInfoModalOpen}
    <div class="modal modal-open">
      <div class="modal-box w-11/12 max-w-2xl bg-base-100 shadow-xl">
        <div class="flex justify-between items-center border-b border-base-content/10 pb-4 mb-4">
          <h3 class="text-lg font-bold text-base-content">CSV File Format Instructions</h3>
          <button
            class="btn btn-ghost btn-sm btn-circle"
            onclick={toggleInfoModal}
            aria-label="Close modal">
            ✕
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="font-semibold text-base-content">How to create the CSV file:</p>
            <ol class="list-decimal pl-5 space-y-2 text-base-content">
              <li>Open Microsoft Excel</li>
              <li>Create a single column with email addresses (one per row)</li>
              <li>Do not include any headers or additional columns</li>
              <li>Go to File → Save As</li>
              <li>Choose "CSV (Comma delimited) (*.csv)" from the file type dropdown</li>
              <li>Click Save</li>
            </ol>
          </div>
          
          <div class="bg-base-200 p-4 rounded-md">
            <p class="font-semibold mb-2 text-base-content">Example CSV content:</p>
            <div class="text-sm bg-base-300 p-2 rounded whitespace-nowrap">
              <div class="text-left">reviewer1@example.com</div>
              <div class="text-left">reviewer2@example.com</div>
              <div class="text-left">reviewer3@example.com</div>
            </div>
          </div>
          
          <div class="space-y-2">
            <p class="font-semibold text-base-content">Important notes:</p>
            <ul class="list-disc pl-5 space-y-1 text-base-content">
              <li>Use simple CSV format (comma-delimited)</li>
              <li>One email address per row</li>
              <li>No headers, titles, or extra columns</li>
              <li>No commas in the data</li>
              <li>File must have .csv extension</li>
              <li>UTF-8 encoding is preferred</li>
            </ul>
          </div>
          
          <div class="bg-warning/10 p-3 rounded-md text-sm">
            <p class="font-semibold text-warning">Common issues to avoid:</p>
            <ul class="list-disc pl-5 text-warning">
              <li>Don't use Excel's "Text to Columns" feature</li>
              <li>Don't include column headers</li>
              <li>Don't include quotation marks around emails</li>
              <li>Don't use semicolons as separators</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-action mt-4">
          <button
            class="btn btn-primary"
            onclick={toggleInfoModal}>
            Got it
          </button>
        </div>
      </div>
    </div>
    {/if}

    {#if isReviewCustomizationModalOpen}
      <ReviewCustomization toggleModal = {toggleReviewCustomizationModal} onSave = {setReviewTemplate}/>
    {/if}

    <!-- Submit Error Message -->
    {#if submitStatus === 'error'}
      <div class="alert alert-error mt-4" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 018 0z" />
        </svg>
        <span data-testid="conference-creation-error">{errors.submit}</span>
      </div>
    {/if}

    <!-- Submit Success Message -->
    {#if submitStatus === 'success'}
      <div class="alert alert-success mt-4" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 018 0z" />
        </svg>
        <span data-testid="conference-creation-success">Conference created!</span>
      </div>
    {/if}

    <button type="submit" class="btn btn-primary w-full" data-testid="create-button">
      Create Conference
    </button>
  </form>
</div>