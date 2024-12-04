<script lang="ts">
    import type { PageData } from '../[id]/$types';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$stores/userStore';
    import { conference } from '$stores/conferenceStore'
    import {Role} from '$lib/models/role';
    import { Paper, goToPaperDetail } from '$lib/models/paper';
    export let data: PageData;
  
    //let conference: Conference | null = null;
    let isEditing = false;
    let isLoading = false;
    let error: string | null = null;
    let isSubmitting = false;
    let currentUserId: number | null = null;
    let creatorId: number | null = null;
    let adminData: any = null; 
    let papers: Paper[] = [];
    let preferences = new Set();
  
    interface ConferenceFormData {
      conference_id: Number;
      title: string;
      deadline: string;
      description: string;
    }
  
    // Funzione per formattare la data nel formato yyyy-MM-dd
    function formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  
    // Form data for editing
    let editFormData: ConferenceFormData = {
      conference_id: 0,
      title: '',
      deadline: formatDate(new Date()),
      description: ''
    };
  
  
    onMount(async () => {
      try {
        currentUserId = $user?.id || null;
        creatorId = $conference?.user_id ? Number($conference.user_id) : null;
  
        if ($conference && $user) {
          editFormData = {
            conference_id: $conference.id,
            title: $conference.title.toString(),
            deadline: formatDate(new Date($conference.deadline)),
            description: $conference.description.toString(),
          };
        }
        fetchPapers();
        fetchPreferences();
      } catch (err) {
        error = 'Error loading conference details';
        console.error('Error in onMount:', err);
      } finally {
        isLoading = false;
      }
    });
  
    // Stato per la paginazione
    let pageSize: number = 12; // Numero di paper per pagina
  
    let currentPage: number = 1;
  
    let totalPages: number = 1;
    
    let totalPapers: number = 0;

  
    //serve per gestire lo stato del modal (info del csv)
    let isInfoModalOpen = false;
    
    $: totalPages = Math.ceil(totalPapers / pageSize);













    // Funzione per generare dati simulati dei paper
function generateMockPapers(page: number, pageSize: number) {
  const totalPapers = 50; // Numero totale di paper simulati
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const papers = Array.from({ length: totalPapers }, (_, i) => ({
      id: i + 1,
      title: `Paper Title ${i + 1}`,
      author: `Author ${i + 1}`,
      paper_file: '',
      conference: i + 1,
      conference_title: '',
      status: '',
      submission_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      role: Role.Author
    })).slice(start, end);

  return {
    papers,
    current_page: page,
    total_papers: totalPapers,
  };
}

// Funzione per generare preferenze simulate
function generateMockPreferences() {
  const totalPapers = 50; // Assumiamo di avere 50 paper in totale
  const preferredPaperIds = new Set<number>();

  // Aggiungi preferenze casuali (max 10 paper)
  while (preferredPaperIds.size < 10) {
    preferredPaperIds.add(Math.floor(Math.random() * totalPapers) + 1);
  }

  return {
    preferences: Array.from(preferredPaperIds).map((paperId) => ({ paperId })),
  };
}

// Funzione per caricare i paper simulati
async function fetchPapers(page: number = 1) {
  try {
    // Simula un ritardo per emulare una richiesta di rete
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = generateMockPapers(page, pageSize);
    papers = data.papers;
    currentPage = data.current_page;
    totalPapers = data.total_papers;
  } catch (error) {
    console.error('Errore simulato:', error);
  }
}

// Funzione per caricare le preferenze simulate
async function fetchPreferences() {
  try {
    // Simula un ritardo per emulare una richiesta di rete
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = generateMockPreferences();
    preferences = new Set(data.preferences.map((pref) => pref.paperId));
  } catch (error) {
    console.error('Errore simulato:', error);
  }
}

  
  
    /* async function fetchPapers(page: number = 1) {
      try {
        const response = await fetch(`http://localhost:8000/conference/get_paper_inconference_admin/?page=${page}&page_size=${pageSize}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:"include",
          body: JSON.stringify({
            user_id: $user?.id,
            conference_id: $conference?.id
          })
        });
  
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Non sei autorizzato a vedere questi dati.");
          }
          if (response.status === 400) {
            throw new Error("Richiesta non valida.");
          }
          throw new Error("Errore nella richiesta.");
        }
  
        const data = await response.json();
        Papers = data.papers;
        currentPage = data.current_page;
        totalPapers = data.total_papers;
      } catch (error) {
        console.error('Errore:', error);
      }
    }


    // Funzione per caricare le preferenze
    async function fetchPreferences() {
      try {
        const response = await fetch(`http://localhost:8000/conference/get_paper_inconference_admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:"include",
          body: JSON.stringify({
            user_id: $user?.id,
            conference_id: $conference?.id
          })
        });
  
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Non sei autorizzato a vedere questi dati.");
          }
          if (response.status === 400) {
            throw new Error("Richiesta non valida.");
          }
          throw new Error("Errore nella richiesta.");
        }
        const data = await response.json();
        preferences = new Set(data.preferences.map((pref: { paperId: number }) => pref.paperId));
      } catch (error) {
        console.error('Errore:', error);
      }
    } */

  // Aggiungi o rimuovi preferenza
  async function togglePreference(paperId: number) {
    const isPreferred = preferences.has(paperId);

    try {
        const response = await fetch(`http://localhost:8000/conference/express_preference`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:"include",
          body: JSON.stringify({
            user_id: $user?.id,
            conference_id: $conference?.id,
            paper_id: paperId,
          })
        });

      if (response.ok) {
        if (isPreferred) {
          preferences.delete(paperId);
        } else {
          preferences.add(paperId);
        }
      } else {
        console.error("Errore durante l'aggiornamento della preferenza.");
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento della preferenza:", error);
    }
  }
  
  
    function formatDateForDisplay(date: Date|undefined): string {
      if (date == undefined) return'';
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  
    async function handleDelete() {
      if (!conference || !currentUserId) return;
  
      try {
        if (!confirm('Are you sure you want to delete this conference? This action cannot be undone.')) {
          return;
        }
  
        isSubmitting = true;
        const response = await fetch('http://localhost:8000/conference/delete/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:'include',
          body: JSON.stringify({
            conference_id: $conference?.id
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete conference');
        }
  
        goto('/conference');
      } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to delete conference. Please try again.';
        console.error('Error deleting conference:', err);
      } finally {
        isSubmitting = false;
      }
    }
  
    async function handleSubmit(event: SubmitEvent) {
      event.preventDefault();
      
      if (!validateForm()) return;
  
      // Filter out empty or invalid emails
      const validReviewers = formInvitations.reviewers.filter(reviewer => 
          reviewer.email.trim() !== ''
      );
  
      if (!isInfoModalOpen) {
        try {
          isSubmitting = true;
          const response = await fetch('http://localhost:8000/conference/edit/', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials:'include',
            body: JSON.stringify({
              ...editFormData,
              reviewers: validReviewers
            })
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update conference');
          }
  
          if ($conference) {
            $conference.title = editFormData.title;
            $conference.deadline = new Date(editFormData.deadline);
            $conference.description = editFormData.description;
          }
  
          isEditing = false;
          error = null;
        } catch (err) {
          error = err instanceof Error ? err.message : 'Failed to update conference. Please try again.';
          console.error('Error updating conference:', err);
        } finally {
          isSubmitting = false;
        }
      }
    }
  
    function validateForm(): boolean {
      if (!editFormData.title.trim()) {
        error = 'Title is required';
        return false;
      }
      if (!editFormData.deadline) {
        error = 'Deadline is required';
        return false;
      }
      if (!editFormData.description.trim()) {
        error = 'Description is required';
        return false;
      }
      
      const deadlineDate = new Date(editFormData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        error = 'Invalid deadline date';
        return false;
      }
      
      return true;
    }
  
    interface FormInvitations {
      reviewers: { email: string }[];
    }
  
    interface FormErrors {
      title?: boolean;
      admin_id?: boolean;
      deadline?: boolean;
      description?: boolean;
      submit?: string;
      csvFile?: string;
    }
  
  
    let errors: FormErrors = {};
    let csvFile: File | null = null;
  
  
    let formInvitations: FormInvitations = {
      reviewers: []
    };
  
  
    $: isAdmin = conference && currentUserId && creatorId && currentUserId == creatorId;
  
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
  
    function addEmail(role: 'reviewers') {
      formInvitations[role] = [...formInvitations[role], { email: '' }];
    }
  
    function removeEmail(role: 'reviewers', index: number) {
      formInvitations[role] = formInvitations[role].filter((_, i) => i !== index);
    } 
  
  
    //per toggleare il modal
    function toggleInfoModal() {
      isInfoModalOpen = !isInfoModalOpen;
    }


</script>


<div class="container mx-auto p-2 md:p-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <button
        class="btn btn-ghost self-start"
        onclick={() => goto('/conference')}
        data-testid="back-to-conferences-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Conferences
      </button>
      <h1 class="text-3xl font-bold">
        {isEditing ? 'Edit Conference' : 'Conference Details'}
      </h1>
    </div>
  
    <!-- Loading State -->
    {#if isLoading}
      <div class="flex justify-center items-center h-64" role="status">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    
    <!-- Error State -->
    {:else if error && !isEditing}
      <div class="alert alert-error shadow-lg mb-6" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
        <button class="btn btn-sm btn-ghost" onclick={() => error = null}>Dismiss</button>
      </div>
  
    <!-- Main Content -->
    {:else if conference}
      {#if isEditing}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <form class="space-y-6" onsubmit={handleSubmit} data-testid="edit-conference-form">
              <div class="form-control">
                <label for="title" class="label">
                  <span class="label-text text-lg font-semibold">Title</span>
                </label>
                <input 
                  id="title" 
                  type="text" 
                  bind:value={editFormData.title} 
                  class="input input-bordered w-full" 
                  data-testid="title-input"
                  placeholder="Enter conference title"
                />
              </div>
  
              <div class="form-control">
                <textarea 
                  id="description" 
                  bind:value={editFormData.description} 
                  class="textarea textarea-bordered w-full min-h-32" 
                  data-testid="description-input"
                  placeholder="Enter conference description"
                ></textarea>
              </div>
  
              <div class="form-control">
                <label for="deadline" class="label">
                  <span class="label-text text-lg font-semibold">Deadline</span>
                </label>
                <input 
                  id="deadline" 
                  type="date" 
                  bind:value={ editFormData.deadline } 
                  class="input input-bordered w-full"
                  data-testid="deadline-input"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <!-- CSV Upload for Reviewers -->
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold">Upload Reviewers CSV</h3>
                    <button 
                      class="btn btn-ghost btn-xs btn-circle"
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
                    <button 
                      type="button" 
                      class="btn btn-secondary w-full mt-2" 
                      onclick={() => addEmail('reviewers')}>
                      Add Reviewer
                    </button>
                  </div>
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
  
              <div class="flex gap-4 justify-end mt-8">
                <button 
                  type="button" 
                  class="btn btn-ghost" 
                  onclick={() => {
                    isEditing = false;
                    error = null;
                  }}
                  disabled={isSubmitting}
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  disabled={isSubmitting}
                  data-testid="save-button"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
  
              {#if error}
                <div class="alert alert-error shadow-lg mb-6" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              {/if}
  
            </form>
          </div>
        </div>
      {:else}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex justify-between items-start mb-6">
              <h2 class="card-title text-3xl">{$conference?.title}</h2>
              {#if isAdmin}
                <div class="flex gap-2">
                  <button 
                    class="btn btn-primary"
                    onclick={() => {
                      isEditing = true;
                      error = null;
                    }}
                    data-testid="edit-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    class="btn btn-error"
                    onclick={handleDelete}
                    disabled={isSubmitting}
                    data-testid="delete-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              {/if}
            </div>
  
            <div class="space-y-6">
              <div>
                <h3 class="text-xl font-semibold mb-3">Description</h3>
                <p class="text-lg whitespace-pre-line">{$conference?.description}</p>
              </div>
  
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h3 class="card-title">Deadline</h3>
                    <p class="text-lg">{formatDateForDisplay($conference?.deadline)}</p>
                  </div>
                </div>
                <div class="card bg-base-200">
                  <div class="card-body">
                    <h3 class="card-title">Created</h3>
                    <p class="text-lg">{formatDateForDisplay($conference?.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      <div class="mt-8">
        <h3 class="text-xl font-semibold mb-4">Available Papers</h3>
        {#if papers && papers.length > 0}
        <div class="overflow-x-auto">
  <table class="table table-zebra w-full text-center">
    <thead>
      <tr>
        <th class="px-4 py-2">Paper ID</th>
        <th class="px-4 py-2">Author</th>
        <th class="px-4 py-2">Title</th>
        <th class="px-4 py-2">Preference</th>
      </tr>
    </thead>
    <tbody>
      {#each papers as paper}
        <tr class="hover">
          <td class="px-4 py-2">{paper.id}</td>
          <td class="px-4 py-2">{paper.author}</td>
          <td class="px-4 py-2">{paper.title}</td>
          <td class="px-4 py-2">
            <button
              class="btn btn-ghost text-yellow-500"
              onclick={() => togglePreference(paper.id)}
              aria-label="Toggle Preference"
            >
              {#if preferences.has(paper.id)}
                <!-- Stella piena -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.435 8.21 1.196-5.938 5.798 1.402 8.187-7.342-3.86-7.342 3.86 1.402-8.187-5.938-5.798 8.21-1.196z" />
                </svg>
              {:else}
                <!-- Stella vuota -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.435 8.21 1.196-5.938 5.798 1.402 8.187-7.342-3.86-7.342 3.86 1.402-8.187-5.938-5.798 8.21-1.196z" />
                </svg>
              {/if}
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

          
      
          <!-- Pagination Controls -->
        <div class="flex justify-center mt-6">
            <div class="join">
            <!-- Primo pulsante sempre visibile, solo se non è la pagina corrente -->
            {#if currentPage > 2}
                <button class="join-item btn" onclick={() => fetchPapers(1)}>
                1
                </button>
            {/if}
        
            <!-- Ellissi se la pagina corrente è abbastanza distante dalla prima pagina -->
            {#if currentPage > 3}
                <button class="join-item btn btn-disabled">...</button>
            {/if}
        
            <!-- Pulsante per la pagina precedente se non è la prima pagina -->
            {#if currentPage > 1}
                <button class="join-item btn" onclick={() => fetchPapers(currentPage - 1)}>
                {currentPage - 1}
                </button>
            {/if}
        
            <!-- Pulsante per la pagina corrente -->
            <button class="join-item btn btn-active">
                {currentPage}
            </button>
        
            <!-- Pulsante per la pagina successiva se non è l'ultima pagina -->
            {#if currentPage < totalPages}
                <button class="join-item btn" onclick={() => fetchPapers(currentPage + 1)}>
                {currentPage + 1}
                </button>
            {/if}
        
            <!-- Ellissi se la pagina corrente è abbastanza distante dall'ultima pagina -->
            {#if currentPage < totalPages - 2}
                <button class="join-item btn btn-disabled">...</button>
            {/if}
        
            <!-- Ultimo pulsante sempre visibile, solo se non è la pagina corrente e ci sono più di 2 pagine -->
            {#if totalPages > 1 && currentPage < totalPages - 1}
                <button class="join-item btn" onclick={() => fetchPapers(totalPages)}>
                {totalPages}
                </button>
            {/if}
            </div>
        </div>
  
        {:else}
          <p class="mt-8">No papers available.</p>
        {/if}
      </div>
    {/if}
</div>