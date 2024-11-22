<script lang="ts">
    import { Conference, goToConferenceDetail} from '$lib/models/conference';
    import { onMount } from 'svelte';
    import { getRoleColor, getRoleAbbreviation } from '$lib/models/role';
    import { user } from '$stores/userStore';
    import ConferenceCard from '$lib/components/ConferenceCard.svelte';
    import { fade } from 'svelte/transition';

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
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {#each conferences as conference}
            <tr class="hover" on:click={() => goToConferenceDetail(conference)} style="cursor: pointer;">
              <td>{truncate(conference.title, 20)}</td>
              <td>{truncate(conference.description, 100)}</td>
              <td>{formatDate(conference.created_at)}</td>
              <td>{formatDate(conference.deadline)}</td>
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