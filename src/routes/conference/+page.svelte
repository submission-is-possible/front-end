<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { user } from '$stores/userStore';
  import ConferenceCard from '../../lib/components/ConferenceCard.svelte';

  interface Conference {
    id: number;
    title: string;
    description: string;
    created_at: string;
    deadline: string;
    roles: string[]; // Cambiato in array di stringhe
  }

  let conferences: Conference[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let totalConferences = 1;
  let pageSize = 9;
  let isTableView = true;

  async function fetchConferences(page: number = 1) {
    try {
      const response = await fetch(`http://localhost:8000/conference_roles/get_user_conferences/?page=${page}&page_size=${pageSize}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: $user?.id,
        })
      });

      if (!response.ok) throw new Error('Errore nel recupero delle conferenze');

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

  
// Funzione per determinare il colore del ruolo
function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'badge-error';
      case 'author': return 'badge-info';
      case 'reviewer': return 'badge-success';
      default: return 'badge-ghost';
    }
  }

  function getRoleAbbreviation(role: string) {
    switch (role) {
      case 'admin': return 'Ad';
      case 'author': return 'Au';  // Per esempio, usa 'C' per contributor
      case 'reviewer': return 'Re';
      default: return '';
    }
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">My Conferences</h1>
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
          <th>Roles</th>
          <th>Created At</th>
          <th>Deadline</th>
        </tr>
      </thead>
      <tbody>
        {#each conferences as conference (conference.id)}
          <tr class="hover">
            <td>{conference.title}</td>
            <td>{conference.description}</td>
            <td>
              {#each conference.roles as role}
                <span class="badge {getRoleColor(role)} mr-1">{getRoleAbbreviation(role)}</span>
              {/each}
            </td>
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
        <ConferenceCard 
          conference={{
            id: conference.id,
            title: conference.title,
            description: conference.description,
            role: conference.roles,  // Passa l'array di ruoli
            deadline: formatDate(conference.deadline)
          }}
        />
      {/each}
    </div>
  {/if}

  <div class="flex justify-center mt-6">
    <div class="join">
      <!-- Primo pulsante sempre visibile, solo se non è la pagina corrente -->
      {#if currentPage > 2}
        <button class="join-item btn" on:click={() => goToPage(1)}>
          1
        </button>
      {/if}

      <!-- Ellissi se la pagina corrente è abbastanza distante dalla prima pagina -->
      {#if currentPage > 3}
        <button class="join-item btn btn-disabled">...</button>
      {/if}

      <!-- Pulsante per la pagina precedente se non è la prima pagina -->
      {#if currentPage > 1}
        <button class="join-item btn" on:click={() => goToPage(currentPage - 1)}>
          {currentPage - 1}
        </button>
      {/if}

      <!-- Pulsante per la pagina corrente -->
      <button class="join-item btn btn-active">
        {currentPage}
      </button>

      <!-- Pulsante per la pagina successiva se non è l'ultima pagina -->
      {#if currentPage < totalPages}
        <button class="join-item btn" on:click={() => goToPage(currentPage + 1)}>
          {currentPage + 1}
        </button>
      {/if}

      <!-- Ellissi se la pagina corrente è abbastanza distante dall'ultima pagina -->
      {#if currentPage < totalPages - 2}
        <button class="join-item btn btn-disabled">...</button>
      {/if}

      <!-- Ultimo pulsante sempre visibile, solo se non è la pagina corrente e ci sono più di 2 pagine -->
      {#if totalPages > 1 && currentPage < totalPages - 1}
        <button class="join-item btn" on:click={() => goToPage(totalPages)}>
          {totalPages}
        </button>
      {/if}
    </div>
  </div>  

</div>

<style>
  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
  }
</style>
