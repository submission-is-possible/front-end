<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { user } from '$stores/userStore';
    import { get } from 'svelte/store';
  
    let conferencePath: string | URL = "/conference";
  
    interface Conference {
      id: number;
      title: string;
      admin_id: number;
      deadline: string;
      description: string;
      created_at: string;
    }
  
    interface FormData {
      conference_id: number;
      title: string;
      deadline: string;
      description: string;
      user_id: number;
    }
  
    interface FormErrors {
      title?: boolean;
      deadline?: boolean;
      description?: boolean;
      submit?: string;
    }
  
    let formData: FormData = {
      conference_id: 0,
      title: '',
      deadline: '',
      description: '',
      user_id: 0
    };
  
    let originalData: Conference | null = null;
    let errors: FormErrors = {};
    let submitStatus: string = '';
    let isLoading: boolean = true;
  
    onMount(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const conferenceId = urlParams.get('id');
  
      if (!conferenceId) {
        errors.submit = 'Conference ID not found';
        isLoading = false;
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:8000/conference/${conferenceId}/`);
        if (!response.ok) {
          errors.submit = 'Failed to load conference data';
          isLoading = false;
          return;
        }
  
        originalData = await response.json();
        if (originalData) {
          formData = {
            conference_id: originalData.id,
            title: originalData.title,
            deadline: new Date(originalData.deadline).toISOString().split('T')[0],
            description: originalData.description,
            user_id: get(user)?.id || 0
          };
        }
  
        isLoading = false;
      } catch (error) {
        errors.submit = 'Error loading conference data';
        isLoading = false;
      }
    });
  
    function validateForm(): boolean {
      errors = {};
  
      if (!formData.title?.trim()) {
        errors.title = true;
      }
  
      if (!formData.description?.trim()) {
        errors.description = true;
      }
  
      if (!formData.deadline || new Date(formData.deadline) < new Date()) {
        errors.deadline = true;
      }
  
      return Object.keys(errors).length === 0;
    }
  
    async function handleSubmit(event: SubmitEvent): Promise<void> {
      event.preventDefault();
  
      if (!validateForm()) return;
  
      try {
        const response = await fetch('http://localhost:8000/conference/edit/', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          submitStatus = 'error';
          errors.submit = data.error || 'Error updating conference';
          return;
        }
  
        submitStatus = 'success';
        await goto(conferencePath);
  
      } catch (error) {
        submitStatus = 'error';
        errors.submit = 'Server Connection Error. Please try again.';
      }
    }
  </script>
  
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <button
        class="btn btn-secondary"
        on:click={() => goto(conferencePath)}
        data-testid="back-to-conferences-button">
        Go Back
      </button>
      <h1 class="text-2xl font-bold">Edit Conference</h1>
    </div>
  
    {#if isLoading}
      <div class="flex justify-center items-center h-64" role="status">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    {:else if errors.submit}
      <div class="alert alert-error" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{errors.submit}</span>
      </div>
    {:else}
      <form class="space-y-6" on:submit={handleSubmit} data-testid="edit-conference-form">
        <div>
          <label for="title" class="label">
            <span class="label-text">Title</span>
          </label>
          <input 
            id="title" 
            type="text" 
            placeholder="Enter conference title" 
            bind:value={formData.title} 
            class="input input-bordered w-full" 
            data-testid="title-input"
          />
          {#if errors.title}
            <span class="label-text-alt text-error" role="alert" data-testid="title-error">
              Title is required
            </span>
          {/if}
        </div>
  
        <div>
          <label for="description" class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea 
            id="description" 
            placeholder="Enter conference description" 
            bind:value={formData.description} 
            class="textarea textarea-bordered w-full h-32" 
            data-testid="description-input"
          ></textarea>
          {#if errors.description}
            <span class="label-text-alt text-error" role="alert" data-testid="description-error">
              Description is required
            </span>
          {/if}
        </div>
  
        <div>
          <label for="deadline" class="label">
            <span class="label-text">Deadline</span>
          </label>
          <input 
            id="deadline" 
            type="date" 
            bind:value={formData.deadline} 
            class="input input-bordered w-full"
            data-testid="deadline-input"
          />
          {#if errors.deadline}
            <span class="label-text-alt text-error" role="alert" data-testid="deadline-error">
              Please select a future date
            </span>
          {/if}
        </div>
  
        {#if submitStatus === 'success'}
          <div class="alert alert-success" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Conference updated successfully! Redirecting...</span>
          </div>
        {/if}
  
        <div class="flex gap-4 justify-end">
          <button 
            type="button" 
            class="btn btn-ghost" 
            on:click={() => goto(conferencePath)}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            data-testid="save-button"
          >
            Save Changes
          </button>
        </div>
      </form>
    {/if}
  </div>