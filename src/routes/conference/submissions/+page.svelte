<script lang="ts">
  import { Paper } from '$lib/models/paper';
  import { onMount } from 'svelte';
  import { conference } from '$stores/conferenceStore'
  import CreateItemButton from '$lib/components/CreateItemButton.svelte';
    import { goto } from '$app/navigation';
  
  let submissions: Paper[] = [];
  let page = 1;
  let pageSize = 9;
  let current_page = 1;
  let total_pages = 1;
  let total_papers = 1;
  
  async function fetchSubmissions() {
    try {
      const response = await fetch(
        `http://localhost:8000/papers/conf_list/?conf=${$conference?.id}&page=${page}&page_size=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:'include'
        }
      );
      if (!response.ok) throw new Error('Error fetching submissions');
      const data = await response.json();
      submissions = data.papers;
      current_page = data.current_page;
      total_pages = data.total_pages;
      total_papers = data.total_papers;
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function openPaperOnLinkClicked(paper: Paper) {
    goto(`/conference/submissions/detail`); 
  }
  
  function goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= total_pages) {
      page = newPage;
      fetchSubmissions();
    }
  }
  
  onMount(() => {
    fetchSubmissions();
  });

  function onItemCreation(){
    goto('/conference/submissions/submit');
  }
  </script>

<div class="p-4 flex flex-col justify-between">
  <div class="flex justify-end">
    <CreateItemButton onClick={onItemCreation}/>
  </div>
</div>
  
<div class="container mx-auto p-6">
  <div class="mb-6">
    <h1 class="text-2xl font-bold">{$conference?.title} Submissions</h1>
  </div>

  <!-- Papers -->
  {#if submissions.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Submitted Date</th>
          </tr>
        </thead>
        <tbody>
          {#each submissions as paper}
            <tr class="hover">
              <td>
                <a href="/" on:click|preventDefault={() => openPaperOnLinkClicked(paper)}>
                  {paper.title}
                </a>
              </td>
              <td>
                <span class="badge {paper.status === 'accepted' ? 'badge-success' : paper.status === 'rejected' ? 'badge-error' : 'badge-warning'}">
                  {paper.status}
                </span>
              </td>
              <td>{new Date(paper.created_at).toLocaleDateString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-6">
      <div class="join">
        <!-- First page button -->
        {#if current_page > 2}
          <button class="join-item btn" on:click={() => goToPage(1)}>
            1
          </button>
        {/if}
        
        <!-- Ellipsis if current page is far from first page -->
        {#if current_page > 3}
          <button class="join-item btn btn-disabled">...</button>
        {/if}
        
        <!-- Previous page button -->
        {#if current_page > 1}
          <button class="join-item btn" on:click={() => goToPage(current_page - 1)}>
            {current_page - 1}
          </button>
        {/if}
        
        <!-- Current page -->
        <button class="join-item btn btn-active">
          {current_page}
        </button>
        
        <!-- Next page button -->
        {#if current_page < total_pages}
          <button class="join-item btn" on:click={() => goToPage(current_page + 1)}>
            {current_page + 1}
          </button>
        {/if}
        
        <!-- Ellipsis if current page is far from last page -->
        {#if current_page < total_pages - 2}
          <button class="join-item btn btn-disabled">...</button>
        {/if}
        
        <!-- Last page button -->
        {#if total_pages > 1 && current_page < total_pages - 1}
          <button class="join-item btn" on:click={() => goToPage(total_pages)}>
            {total_pages}
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Empty State -->
  {#if submissions.length === 0}
    <div class="text-center py-10">
      <p class="text-gray-500">No paper in {$conference?.title}</p>
    </div>
  {/if}
</div>