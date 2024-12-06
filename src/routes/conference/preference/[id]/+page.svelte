<script lang="ts">
    import type { PageData } from '../[id]/$types';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { user } from '$stores/userStore';
    import { conference } from '$stores/conferenceStore'
    import {Role} from '$lib/models/role';
    import { Paper, goToPaperDetail } from '$lib/models/paper';
    export let data: PageData;
    import { writable } from 'svelte/store';
  
    //let conference: Conference | null = null;
    let isEditing = false;
    let isLoading = false;
    let error: string | null = null;
    let isSubmitting = false;
    let currentUserId: number | null = null;
    let creatorId: number | null = null;
    let adminData: any = null; 
    let papers: Paper[] = [];
    let preferences = writable(new Map());
  
    interface ConferenceFormData {
      conference_id: Number;
      title: string;
      deadline: string;
      description: string;
      papers_deadline: string;
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
      description: '',
      papers_deadline: formatDate(new Date())
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
            papers_deadline: formatDate(new Date($conference.papers_deadline))
          };
        }
        if($conference && $conference.roles.includes(Role.Reviewer)){
          fetchPapers();
          fetchPreferences();
        }
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


// Funzione per caricare le preferenze simulate
async function fetchPreferences() {
  try {
        const response = await fetch(`http://localhost:8000/preferences/get_preference_papers_in_conference_by_reviewer/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:"include",
          body: JSON.stringify({
            id_reviewer: $user?.id,
            id_conference: $conference?.id
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
        const preferencesMap = new Map();
        data.paper_ids_interested.forEach((paperId: number) => {
          preferencesMap.set(paperId, 'interested');
        });
        data.paper_ids_not_interested.forEach((paperId: number) => {
          preferencesMap.set(paperId, 'not_interested');
        });


        preferences.update((prefs) => {
          data.paper_ids_interested.forEach((paperId: number) => {
            prefs.set(paperId, 'interested');
          });
          data.paper_ids_not_interested.forEach((paperId: number) => {
            prefs.set(paperId, 'not_interested');
          });
        return prefs;
      });
      
  } catch (error) {
    console.error('Errore durante la chiamata al backend:', error);
  }
}

// Funzione per caricare i paper simulati
async function fetchPapers(page: number = 1) {
  try {
        const response = await fetch(`http://localhost:8000/conference/get_all_papers/${$conference?.id}/?page=${page}&page_size=${pageSize}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include i cookie per autenticazione, se necessario
        });

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error("Richiesta non valida. Assicurati di aver specificato un ID paper corretto.");
            }
            if (response.status === 405) {
                throw new Error("Metodo non permesso. Verifica che la richiesta sia GET.");
            }
            throw new Error("Errore durante la richiesta.");
        }

        const data = await response.json();
        papers = data.papers;
        currentPage = data.page;
        totalPapers = data.total;
        totalPages = data.pages;
        console.log('Papers caricati:', papers);
    } catch (error) {
        console.error("Errore durante il caricamento dei papers:", error);
    }
}


async function togglePreference(paperId: number, preference: string) {
  try {
        const currentPreference = $preferences.get(paperId);

      // Determina la nuova preferenza
        const newPreference = currentPreference === preference ? 'neutral' : preference;

        const response = await fetch(`http://localhost:8000/preferences/add_preference/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:"include",
          body: JSON.stringify({
            id_reviewer: $user?.id,
            id_paper: paperId,
            type_preference: newPreference
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
        preferences.update((prefs) => {
        const currentPreference = prefs.get(paperId);

        // Se clicchiamo di nuovo sul pulsante già attivo, resettare a "neutral"
        if (currentPreference === preference) {
          prefs.set(paperId, 'neutral');
        } else {
          prefs.set(paperId, preference);
        }
        console.log('Stato aggiornato:', Array.from(prefs.entries()));
        return prefs;
      });
      } catch (error) {
        console.error('Errore:', error);
      }
}
  
    async function setPreference(paperId: number, preference: string) {
      const currentPreference = $preferences.get(paperId) || 'neutral';

      // Selezione "neutral" per rimuovere la preferenza attuale
      if (currentPreference === preference) {
        preference = 'neutral';
      }

      // Simulazione del comportamento del backend
      console.log(`Simulazione: impostazione preferenza per paper ${paperId} a '${preference}'`);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simula un ritardo per testare l'interfaccia

      // Aggiorna lo stato locale
      if (preference === 'neutral') {
        preferences.update(prefs => {
          prefs.delete(paperId);
          return prefs;
        });
      } else {
        preferences.update(prefs => {
          prefs.set(paperId, preference);
          return prefs;
        });
      }

      preferences.subscribe(prefs => {
        console.log('Stato aggiornato localmente:', Array.from(prefs.entries()));
      })();
    }
  

export let automatic_assign = false;
let reviewersPerPaper = 1;
let maxPapersPerReviewer = 1;
let errorMessage = ""; // Variabile per mostrare messaggi di errore

async function auto_assign() {
  try {
    // Reset del messaggio di errore
    errorMessage = "";

    const response = await fetch(`http://localhost:8000/conference/automatic_assign_reviewers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: $user?.id,
        conference_id: $conference?.id,
        max_papers_per_reviewer: maxPapersPerReviewer,
        required_reviewers_per_paper: reviewersPerPaper
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error; // Salvo il messaggio di errore
      } else {
        errorMessage = "An unexpected error occurred.";
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    automatic_assign = true;
  } catch (error) {
    console.error('Errore:', error);
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
          $conference.papers_deadline = new Date(editFormData.papers_deadline);
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

              <div class="form-control">
                <label for="papers-deadline" class="label">
                  <span class="label-text text-lg font-semibold">Papers Deadline</span>
                </label>
                <input 
                  id="papers-deadline" 
                  type="date" 
                  bind:value={ editFormData.papers_deadline } 
                  class="input input-bordered w-full"
                  data-testid="papers-deadline-input"
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
              


              <div class="my-4">
                {#if !automatic_assign}
                  <button
                    class="btn btn-primary"
                    onclick={() => {
                      const modal = document.getElementById('assignmentModal');
                      if (modal) (modal as HTMLInputElement).checked = true;
                    }}
                  >
                    Automatically Assign Papers
                  </button>
                {/if}
              
                <!-- Modale DaisyUI -->
                <input type="checkbox" id="assignmentModal" class="modal-toggle" />
                <div class="modal">
                  <div class="modal-box">
                    <h3 class="font-bold text-lg">Automatic Assignment Settings</h3>
                    <div class="mt-4 space-y-4">
                      <div>
                        <label class="label">
                          <span class="label-text">Number of Reviewers per Paper</span>
                        </label>
                        <input
                          type="number"
                          class="input input-bordered w-full"
                          bind:value={reviewersPerPaper}
                          min="1"
                        />
                      </div>
                      <div>
                        <label class="label">
                          <span class="label-text">Max Papers per Reviewer</span>
                        </label>
                        <input
                          type="number"
                          class="input input-bordered w-full"
                          bind:value={maxPapersPerReviewer}
                          min="1"
                        />
                      </div>
                      <!-- Messaggio di errore -->
                      {#if errorMessage}
                        <div class="text-error mt-2">{errorMessage}</div>
                      {/if}
                    </div>
                    <div class="modal-action">
                      <button
                        class="btn btn-secondary"
                        onclick={() => {
                          const modal = document.getElementById('assignmentModal');
                          if (modal) (modal as HTMLInputElement).checked = false;
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        class="btn btn-primary"
                        onclick={() => {
                          auto_assign();
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              



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

      {#if $conference && $conference?.roles.includes(Role.Admin)} <!-- blocco dedicato alla visualizzazione admin -->
        <div class="mt-8 p-6 bg-blue-100 text-blue-900 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold">
            Authors and Reviewers are choosing their papers
            </h3>
            <p class="mt-2">
            Please wait until 
            <span class="font-bold text-blue-700">
                {formatDateForDisplay($conference?.deadline || 'the specified deadline')}
            </span> 
            to intervene.
            </p>
        </div>
      {/if}
      {#if $conference && $conference?.roles.includes(Role.Author)} <!-- blocco di pagina dedicata all'autore -->
        <div class="mt-8 p-6 bg-green-100 text-green-900 rounded-lg shadow-md flex items-center justify-between">
            <div>
            <h3 class="text-lg font-semibold">
                Ready to share your research?
            </h3>
            <h1 class="text-xl font-semibold">Make sure you send your papers by {formatDateForDisplay($conference?.papers_deadline)}</h1>
            <p class="mt-2">
                Submit your papers now to be part of the conference!
            </p>
            </div>
            <button
                  class="btn btn-primary"
                  onclick={() => goto('/conference/submissions/submit')}>
                  Submit a New Paper
            </button>
        </div>
      {/if}
      {#if $conference && $conference?.roles.includes(Role.Reviewer)} <!-- blocco dedicato alla visualizzazione reviewer -->
        <div class="mt-8">
            <h3 class="text-xl font-semibold mb-4">Available Papers</h3>
            <h2 class="text-xl font-semibold">Choose the papers you would like to review the best</h2>
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
                  <td class="px-4 py-2 flex items-center gap-2">
                    <!-- Pollice su -->
                    <button
                      class="btn btn-ghost text-green-500"
                      onclick={() => togglePreference(paper.id, 'interested')}
                      aria-label="Mark as Interested"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill={$preferences.get(paper.id) === 'interested' ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4l-8 8h5v4h6v-4h5l-8-8z" />
                      </svg>
                    </button>

                    <!-- Pollice giù -->
                    <button
                      class="btn btn-ghost text-red-500"
                      onclick={() => togglePreference(paper.id, 'not_interested')}
                      aria-label="Mark as Not Interested"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill={$preferences.get(paper.id) === 'not_interested' ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 20l8-8h-5v-4h-6v4h-5l8 8z" />
                      </svg>
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
                <!-- First page button -->
                {#if currentPage > 2}
                  <button class="join-item btn" onclick={() => fetchPapers(1)}>
                    1
                  </button>
                {/if}
                
                <!-- Ellipsis if current page is far from first page -->
                {#if currentPage > 3}
                  <button class="join-item btn btn-disabled">...</button>
                {/if}
                
                <!-- Previous page button -->
                {#if currentPage > 1}
                  <button class="join-item btn" onclick={() => fetchPapers(currentPage - 1)}>
                    {currentPage - 1}
                  </button>
                {/if}
                
                <!-- Current page -->
                <button class="join-item btn btn-active">
                  {currentPage}
                </button>
                
                <!-- Next page button -->
                {#if currentPage < totalPages}
                  <button class="join-item btn" onclick={() => fetchPapers(currentPage + 1)}>
                    {currentPage + 1}
                  </button>
                {/if}
                
                <!-- Ellipsis if current page is far from last page -->
                {#if currentPage < totalPages - 2}
                  <button class="join-item btn btn-disabled">...</button>
                {/if}
                
                <!-- Last page button -->
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
    {/if}
</div>