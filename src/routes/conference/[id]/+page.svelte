<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$stores/userStore';
  import { get } from 'svelte/store';
  import type { Conference, ConferenceFormData } from '$lib/types';

  export let data: PageData;

  let conference: Conference | null = null;
  let isEditing = false;
  let isLoading = true;
  let error: string | null = null;
  let isSubmitting = false;
  let currentUserId: number | null = null;

  // Form data for editing
  let editFormData: ConferenceFormData = {
    conference_id: 0,
    title: '',
    deadline: '',
    description: '',
    user_id: 0,
  };


  onMount(async () => {
    try {
      currentUserId = get(user)?.id || null;
      console.log('User store value:', get(user));
      console.log('currentUserId:', currentUserId);
      
      conference = data.conference;
      console.log('conference:', conference);
      console.log('data:', data);
      console.log('conference creator:', conference?.user_id);

      if (conference) {
        editFormData = {
          conference_id: conference.id,
          title: conference.title,
          deadline: formatDateForInput(conference.deadline),
          description: conference.description,
          user_id: conference.user_id // Assicurati che user_id sia presente
        };
      }
    } catch (err) {
      error = 'Error loading conference details';
      console.error('Error in onMount:', err);
    } finally {
      isLoading = false;
    }
  });

  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  }

  function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conference_id: conference.id,
          user_id: currentUserId,
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
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update conference');
      }

      const updatedConference = await response.json();
      conference = {
        ...conference,
        ...updatedConference,
      };
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

  $: canEditConference = conference && currentUserId && conference.user_id === currentUserId;
</script>

<div class="container mx-auto p-4 md:p-8">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
    <button
      class="btn btn-ghost self-start"
      on:click={() => goto('/conference')}
      data-testid="back-button">
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
              <label for="description" class="label">
                <span class="label-text text-lg font-semibold">Description</span>
              </label>
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
                bind:value={editFormData.deadline} 
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
            <h2 class="card-title text-3xl">{conference.title}</h2>
            {#if canEditConference}
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
              <p class="text-lg whitespace-pre-line">{conference.description}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card bg-base-200">
                <div class="card-body">
                  <h3 class="card-title">Deadline</h3>
                  <p class="text-lg">{formatDateForDisplay(conference.deadline)}</p>
                </div>
              </div>
              <div class="card bg-base-200">
                <div class="card-body">
                  <h3 class="card-title">Created</h3>
                  <p class="text-lg">{formatDateForDisplay(conference.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>