<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { user } from '$stores/userStore'; // Assicurati di avere userStore configurato

  // Definisci l'interfaccia Conference
  interface Conference {
    id: number;
    title: string;
    description: string;
    created_at: string;
    deadline: string;
  }

  // Variabili per le conferenze e la paginazione
  let conferences: Conference[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let pageSize = 10; // Imposta il valore della dimensione della pagina a 10
  let isTableView = true;

  // Funzione per ottenere le conferenze dal server con paginazione
  async function fetchConferences(page: number = 1) {
    try {
      const response = await fetch(`http://localhost:8000/conference_roles/get_user_conferences/?page=${page}&page_size=${pageSize}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: $user?.id, // Invia il user_id nel corpo della richiesta
        })
      });

      if (!response.ok) throw new Error('Errore nel recupero delle conferenze');

      const data = await response.json();
      conferences = data.conferences;
      currentPage = data.current_page;
      totalPages = data.total_pages;
      console.log('Conferenze:', conferences);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  // Inizializza il caricamento delle conferenze
  onMount(() => {
    fetchConferences(currentPage);
  });

  // Funzione per gestire il cambio di pagina
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      fetchConferences(page);
    }
  }

  // Funzione per ottenere il colore del badge in base al ruolo
  function getRoleBadgeColor(role: string) {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'badge-primary';
      case 'reviewer':
        return 'badge-secondary';
      case 'author':
        return 'badge-accent';
      default:
        return 'badge-ghost';
    }
  }

  // Funzione per formattare la data
  function formatDate(dateStr: string | number | Date) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="container mx-auto p-4">
  <!-- Header con selezione della vista -->
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
    <!-- Vista Tabella -->
    <div class="overflow-x-auto" transition:fade>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {#each conferences as conference (conference.id)}
            <tr class="hover">
              <td>{conference.title}</td>
              <td>{conference.description}</td>
              <td>{formatDate(conference.created_at)}</td>
              <td>{formatDate(conference.deadline)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <!-- Vista Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" transition:fade>
      {#each conferences as conference (conference.id)}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{conference.title}</h2>
            <div class="flex flex-col gap-2">
              <span class="badge badge-lg">
                Created At: {formatDate(conference.created_at)}
              </span>
              <div class="text-sm opacity-70">
                Deadline: {formatDate(conference.deadline)}
              </div>
              <p>{conference.description}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Paginazione -->
  <div class="flex justify-center space-x-4 mt-6">
    <button class="btn" on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
      Previous
    </button>
    <span>Page {currentPage} of {totalPages}</span>
    <button class="btn" on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
      Next
    </button>
  </div>
</div>
