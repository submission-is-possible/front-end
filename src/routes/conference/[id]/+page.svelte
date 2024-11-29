
<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { paper, setPaper } from '$stores/paperStore';
  import { user } from '$stores/userStore';
  import { conference, setConference } from '$stores/conferenceStore'
  import {Role} from '$lib/models/role';
  import { Paper, goToPaperDetail } from '$lib/models/paper';
  import { get } from 'svelte/store';
  //import type { ConferenceFormData } from '$lib/types';
  import { Conference } from '$lib/models/conference';
  export let data: PageData;

  //let conference: Conference | null = null;
  let isEditing = false;
  let isLoading = false;
  let error: string | null = null;
  let isSubmitting = false;
  let currentUserId: number | null = null;
  let creatorId: number | null = null;
  let adminData: any = null; 

  interface ConferenceFormData {
    conference_id: Number;
    title: String;
    deadline: Date;
    description: String;
  }

  // Form data for editing
  let editFormData: ConferenceFormData = {
    conference_id: 0,
    title: '',
    deadline: new Date,
    description: ''
  };


  onMount(async () => {
    try {
      currentUserId = $user?.id || null;
      creatorId = $conference?.user_id ? Number($conference.user_id) : null;

      if ($conference && $user) {
        editFormData = {
          conference_id: $conference.id,
          title: $conference.title,
          deadline: $conference.deadline,
          description: $conference.description,
          //user_id: $user.id // Assicurati che user_id sia presente
        };
      }
      if($conference?.roles.includes(Role.Author)){
        fetchAuthorPapers();
      }
      if($conference?.roles.includes(Role.Reviewer)){
        fetchReviewerPapers();
      }
    } catch (err) {
      error = 'Error loading conference details';
      console.error('Error in onMount:', err);
    } finally {
      isLoading = false;
    }
  });

// Usa il tipo nella variabile
let AuthorPapers: Paper[] = [];
let ReviewerPapers: Paper[] = [];
let AdminPapers: Paper[] = [];


// Stato per la paginazione
let pageSize: number = 12; // Numero di paper per pagina

let currentAdminPage: number = 1;
let currentAuthorPage: number = 1;
let currentReviewerPage: number = 1;

let totalAdminPages: number = 1;
let totalAuthorPages: number = 1;
let totalReviewerPages: number = 1;

let totalAdminPapers: number = 0;
let totalAuthorPapers: number = 0;
let totalReviewerPapers: number = 0;


// Calcola il totale delle pagine
$: totalAdminPages = Math.ceil(totalAdminPapers / pageSize);
$: totalAuthorPages = Math.ceil(totalAuthorPapers / pageSize);
$: totalReviewerPages = Math.ceil(totalReviewerPapers / pageSize);


$: if (isAdmin) {
  fetchAdminPapers();
}





function goToAdminPage(page: number) {
  if (page >= 1 && page <= totalAdminPages) {
    currentAdminPage = page;
  }
  fetchAdminPapers(page);
}

function goToAuthorPage(page: number) {
  if (page >= 1 && page <= totalAuthorPages) {
    currentAuthorPage = page;
  }
  fetchAuthorPapers(page);
}

function goToReviewerPage(page: number) {
  if (page >= 1 && page <= totalReviewerPages) {
    currentReviewerPage = page;
  }
  fetchReviewerPapers(page);
}


  async function fetchAdminPapers(page: number = 1) {
    try {
      const response = await fetch(`http://localhost:8000/conference/get_paper_inconference_admin/?page=${page}&page_size=${pageSize}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      AdminPapers = data.papers;
      currentAdminPage = data.current_page;
      totalAdminPapers = data.total_papers;
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function fetchReviewerPapers(page: number = 1) {
    try {
      const response = await fetch(`http://localhost:8000/conference/get_paper_inconference_reviewer/?page=${page}&page_size=${pageSize}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      ReviewerPapers = data.papers;
      currentReviewerPage = data.current_page;
      totalReviewerPapers = data.total_papers;
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function fetchAuthorPapers(page: number = 1) {
    try {
      const response = await fetch(`http://localhost:8000/conference/get_paper_inconference_author/?page=${page}&page_size=${pageSize}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      AuthorPapers = data.papers;
      currentAuthorPage = data.current_page;
      totalAuthorPapers = data.total_papers;
    } catch (error) {
      console.error('Errore:', error);
    }
  }



  // ^^^^^^^^^ CODICE PER MOCKARE LA PAGINA, è DA MODIFICARE UNA VOLTA FATTO IL BACKEND!!!! ^^^^^^^^^^




  function formatDateForInput(date:Date|undefined): string {
    if (date == undefined) return'';
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
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

    try {
      isSubmitting = true;
      const response = await fetch('http://localhost:8000/conference/edit/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include',
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update conference');
      }
      
      //const updatedConference = await response.json();
      //setConference(updatedConference);

      isEditing = false;
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update conference. Please try again.';
      console.error('Error updating conference:', err);
    } finally {
      isSubmitting = false;
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

  $: isAdmin = conference && currentUserId && creatorId && currentUserId == creatorId;
</script>

<div class="container mx-auto p-2 md:p-4">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
    <button
      class="btn btn-ghost self-start"
      on:click={() => goto('/conference')}
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
  {:else if error}
    <div class="alert alert-error shadow-lg mb-6" role="alert">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
      <button class="btn btn-sm btn-ghost" on:click={() => error = null}>Dismiss</button>
    </div>

  <!-- Main Content -->
  {:else if conference}
    {#if isEditing}
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form class="space-y-6" on:submit={handleSubmit} data-testid="edit-conference-form">
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

            <div class="flex gap-4 justify-end mt-8">
              <button 
                type="button" 
                class="btn btn-ghost" 
                on:click={() => {
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
                  on:click={() => {
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
                  on:click={handleDelete}
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

          {#if isAdmin} <!-- mostra i papers se si entra come program chair -->
            <div class="mt-8">
              <h3 class="text-xl font-semibold mb-4">Submitted Papers</h3>
              {#if AdminPapers && AdminPapers.length > 0}
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Paper ID</th>
                        <th>Author</th>
                        <th>Title</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each AdminPapers as paper}
                        <tr class="hover" on:click={() => goToPaperDetail(paper)} style="cursor: pointer;">
                          <td>{paper.id}</td>
                          <td>{paper.author}</td>
                          <td>{paper.title}</td>
                          <td>{paper.status}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Controls -->
                <div class="flex justify-center mt-6">
                  <div class="join">
                    <!-- Primo pulsante -->
                    {#if currentAdminPage > 2}
                      <button class="join-item btn" on:click={() => goToAdminPage(1)}>1</button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentAdminPage > 3}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Pagina precedente -->
                    {#if currentAdminPage > 1}
                      <button class="join-item btn" on:click={() => goToAdminPage(currentAdminPage - 1)}>
                        {currentAdminPage - 1}
                      </button>
                    {/if}

                    <!-- Pagina corrente -->
                    <button class="join-item btn btn-active">{currentAdminPage}</button>

                    <!-- Pagina successiva -->
                    {#if currentAdminPage < totalAdminPages}
                      <button class="join-item btn" on:click={() => goToAdminPage(currentAdminPage + 1)}>
                        {currentAdminPage + 1}
                      </button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentAdminPage < totalAdminPages - 2}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Ultima pagina -->
                    {#if totalAdminPages > 1 && currentAdminPage < totalAdminPages - 1}
                      <button class="join-item btn" on:click={() => goToAdminPage(totalAdminPages)}>
                        {totalAdminPages}
                      </button>
                    {/if}
                  </div>
                </div>
              {:else}
                <p class="mt-8">No papers submitted.</p>
              {/if}
            </div>
          {/if}

          {#if $conference?.roles.includes(Role.Author) || $conference?.roles.includes(Role.Reviewer)} <!-- mostra la pagina per gli autori autore-->
            <div class="mt-8">
              <h3 class="text-xl font-semibold mb-4">Papers submitted by You</h3>
              {#if AuthorPapers.length > 0}
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Paper ID</th>
                        <th>Author</th>
                        <th>Title</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each AuthorPapers as paper}
                        <tr class="hover" on:click={() => goToPaperDetail(paper)} style="cursor: pointer;">
                          <td>{paper.id}</td>
                          <td>{paper.author}</td>
                          <td>{paper.title}</td>
                          <td>{paper.status}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Controls -->
                <div class="flex justify-center mt-6">
                  <div class="join">
                    <!-- Primo pulsante -->
                    {#if currentAuthorPage > 2}
                      <button class="join-item btn" on:click={() => goToAuthorPage(1)}>1</button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentAuthorPage > 3}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Pagina precedente -->
                    {#if currentAuthorPage > 1}
                      <button class="join-item btn" on:click={() => goToAuthorPage(currentAuthorPage - 1)}>
                        {currentAuthorPage - 1}
                      </button>
                    {/if}

                    <!-- Pagina corrente -->
                    <button class="join-item btn btn-active">{currentAuthorPage}</button>

                    <!-- Pagina successiva -->
                    {#if currentAuthorPage < totalAuthorPages}
                      <button class="join-item btn" on:click={() => goToAuthorPage(currentAuthorPage + 1)}>
                        {currentAuthorPage + 1}
                      </button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentAuthorPage < totalAuthorPages - 2}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Ultima pagina -->
                    {#if totalAuthorPages > 1 && currentAuthorPage < totalAuthorPages - 1}
                      <button class="join-item btn" on:click={() => goToAuthorPage(totalAuthorPages)}>
                        {totalAuthorPages}
                      </button>
                    {/if}
                  </div>
                </div>
              {:else}
                <p class="mt-8">No papers submitted.</p>
              {/if}
            </div>
          {/if}

          {#if $conference?.roles.includes(Role.Reviewer)}<!-- mostra la pagina per i reviewers reviewer-->
            <div class="mt-8">
              <h3 class="text-xl font-semibold mb-4">Papers to review</h3>
              {#if ReviewerPapers.length > 0}
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Paper ID</th>
                        <th>Author</th>
                        <th>Title</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each ReviewerPapers as paper}
                        <tr class="hover" on:click={() => goToPaperDetail(paper)} style="cursor: pointer;">
                          <td>{paper.id}</td>
                          <td>{paper.author}</td>
                          <td>{paper.title}</td>
                          <td>{paper.status}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Controls -->
                <div class="flex justify-center mt-6">
                  <div class="join">
                    <!-- Primo pulsante -->
                    {#if currentReviewerPage > 2}
                      <button class="join-item btn" on:click={() => goToReviewerPage(1)}>1</button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentReviewerPage > 3}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Pagina precedente -->
                    {#if currentReviewerPage > 1}
                      <button class="join-item btn" on:click={() => goToReviewerPage(currentReviewerPage - 1)}>
                        {currentReviewerPage - 1}
                      </button>
                    {/if}

                    <!-- Pagina corrente -->
                    <button class="join-item btn btn-active">{currentReviewerPage}</button>

                    <!-- Pagina successiva -->
                    {#if currentReviewerPage < totalReviewerPages}
                      <button class="join-item btn" on:click={() => goToReviewerPage(currentReviewerPage + 1)}>
                        {currentReviewerPage + 1}
                      </button>
                    {/if}

                    <!-- Ellissi -->
                    {#if currentReviewerPage < totalReviewerPages - 2}
                      <button class="join-item btn btn-disabled">...</button>
                    {/if}

                    <!-- Ultima pagina -->
                    {#if totalReviewerPages > 1 && currentReviewerPage < totalReviewerPages - 1}
                      <button class="join-item btn" on:click={() => goToReviewerPage(totalReviewerPages)}>
                        {totalReviewerPages}
                      </button>
                    {/if}
                  </div>
                </div>
              {:else}
                <p class="mt-8">No papers submitted.</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>