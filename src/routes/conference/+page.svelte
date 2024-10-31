<script lang="ts">
    import { fade } from 'svelte/transition';
  
    // TODO: we need of course to replace it with actual data getting from the server
    //          with a pagination
    let conferences = [
      {
        id: 1,
        title: "Web Development Summit 2024",
        role: "Admin",
        deadline: "2024-12-01",
      },
      {
        id: 2,
        title: "AI & Machine Learning Conference",
        role: "Reviewer",
        deadline: "2024-08-15",
      },
      {
        id: 3,
        title: "Software Architecture Symposium",
        role: "Author",
        deadline: "2024-10-30",
      }
    ];
  
    // View state
    let isTableView = true;
  
    // Function to get role badge color
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
  
    // Format date function
    function formatDate(dateStr: string | number | Date) {
      return new Date(dateStr).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  </script>
  
  <div class="container mx-auto p-4">

    <!-- Header with view toggle -->
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
      <!-- Table View -->
      <div class="overflow-x-auto" transition:fade>
        <table class="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Role</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {#each conferences as conference (conference.id)}
              <tr class="hover">
                <td>{conference.title}</td>
                <td>
                  <span class="badge {getRoleBadgeColor(conference.role)}">
                    {conference.role}
                  </span>
                </td>
                <td>{formatDate(conference.deadline)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <!-- Card View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" transition:fade>
        {#each conferences as conference (conference.id)}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">{conference.title}</h2>
              <div class="flex flex-col gap-2">
                <span class="badge {getRoleBadgeColor(conference.role)} badge-lg">
                  {conference.role}
                </span>
                <div class="text-sm opacity-70">
                  Deadline: {formatDate(conference.deadline)}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>