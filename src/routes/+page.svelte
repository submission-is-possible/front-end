<script lang="ts">
    import { Conference, goToConferenceDetail} from '$lib/models/conference';
    import { onMount } from 'svelte';
    import { getRoleColor, getRoleAbbreviation } from '$lib/models/role';
    import { user } from '$stores/userStore';
    import ConferenceCard from '$lib/components/ConferenceCard.svelte';
    import { fly, fade } from 'svelte/transition';

    let conferences: Conference[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let totalConferences = 1;
    let pageSize = 9;
    let isTableView = true;

    async function fetchConferences(page: number = 1) {
        try {
            const response = await fetch(`http://localhost:8000/conference/list/?page=${page}&page_size=${pageSize}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            debugger;
            if (!response.ok) throw new Error('Error in fetching conferences');

            const data = await response.json();
            conferences = data.conferences;
            currentPage = data.current_page;
            totalPages = data.total_pages;
            totalConferences = data.total_conferences;

        } catch (error) {
            console.error('Errore:', error);
        }
    }

    onMount(() => {
        fetchConferences(currentPage);
    });

    let successToast = false;

    async function joinConference(conference : Conference) {
      console.log("chiamata join conference");
      try {
        const response = await fetch(`http://localhost:8000/conference_roles/assign_author_role/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: $user?.id,
          id_conference: conference?.id
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Not found.");
        }
        if (response.status === 400) {
          throw new Error("Missing fields.");
        }
        if (response.status === 405) {
          throw new Error("Only POST requests are allowed.");
        }
        throw new Error("Errore nella richiesta.");
      }

      const data = await response.json();
      console.log("Unione avvenuta con successo:", data);

      // Mostra il messaggio toast
      successToast = true;
      
      // Nasconde il messaggio dopo 3 secondi
      setTimeout(() => {
        successToast = false;
      }, 3000);

    } catch (error) {
      console.error('Errore:', error);
    }
  }

    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            fetchConferences(page);
        }
    }

    function formatDate(dateStr: string | number | Date) {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function truncate(text: String, maxLength: number) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    function onPageChange(page: number) {
        if (page >= 1 && page <= totalPages) {
            fetchConferences(page);
        }
    }
</script>

<!-- Toast per il messaggio di successo -->
{#if successToast}
  <div 
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    in:fly="{{ y: -20 }}" out:fade>
    <div class="alert shadow-lg w-96 transition-colors duration-300" data-theme="{document.documentElement.getAttribute('data-theme')}">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m-6 4h10" />
        </svg>
        <span>You have successfully joined the conference!</span>
      </div>
    </div>
  </div>
{/if}
{#if $user?.isLoggedin}
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        <iconify-icon icon="material-symbols:calendar-month"></iconify-icon>
        Opened Conferences
    </h1>
      <div class="btn-group">
        <button 
          class="btn btn-sm {isTableView ? 'btn-active' : ''}"
          on:click={() => isTableView = true}
        >
          <iconify-icon icon="material-symbols:menu-rounded" width="24" height="24"></iconify-icon>
          Table
        </button>
        <button 
          class="btn btn-sm {!isTableView ? 'btn-active' : ''}"
          on:click={() => isTableView = false}
        >
          <iconify-icon icon="material-symbols:view-cozy-outline" width="24" height="24"></iconify-icon>
          Cards
        </button>
      </div>
    </div>
  
    {#if isTableView}
    <div class="overflow-x-auto" transition:fade>
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Paper Deadline</th>
            <th>Deadline</th>
            <th>Blinding</th>
          </tr>
        </thead>
        <tbody>
          {#each conferences as conference}
            <tr class="hover" on:click={() => joinConference(conference)} style="cursor: pointer;">
              <td>{truncate(conference.title, 20)}</td>
              <td>{truncate(conference.description, 100)}</td>
              <td>{formatDate(conference.created_at)}</td>
              <td>{formatDate(conference.papers_deadline)}</td>
              <td>{formatDate(conference.deadline)}</td>
              <td>
                {#if conference.status == "single_blind"}
                  <span class="badge badge-secondary rounded-md">Single Blind</span>
                {:else if conference.status == "double_blind"}
                  <span class="badge badge-secondary rounded-md">Double Blind</span>
                {:else}
                  <span class="badge badge-secondary rounded-md">None</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" transition:fade>
        {#each conferences as conference (conference.id)}
          <ConferenceCard conference= {conference} />
        {/each}
      </div>
    {/if}
  
    <div class="flex justify-center mt-6">
      <div class="join">
        {#if currentPage > 2}
          <button class="join-item btn" on:click={() => goToPage(1)}>
            1
          </button>
        {/if}
  
        {#if currentPage > 3}
          <button class="join-item btn btn-disabled">...</button>
        {/if}
  
        {#if currentPage > 1}
          <button class="join-item btn" on:click={() => goToPage(currentPage - 1)}>
            {currentPage - 1}
          </button>
        {/if}
  
        <button class="join-item btn btn-active">
          {currentPage}
        </button>
  
        {#if currentPage < totalPages}
          <button class="join-item btn" on:click={() => goToPage(currentPage + 1)}>
            {currentPage + 1}
          </button>
        {/if}
  
        {#if currentPage < totalPages - 2}
          <button class="join-item btn btn-disabled">...</button>
        {/if}
  
        {#if totalPages > 1 && currentPage < totalPages - 1}
          <button class="join-item btn" on:click={() => goToPage(totalPages)}>
            {totalPages}
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
    <div class="container mx-auto p-4">
        <!-- Or put here the home page-->
        <h1 class="text-2xl font-bold">Please login to see the opened conferences</h1>
    </div>
{/if}