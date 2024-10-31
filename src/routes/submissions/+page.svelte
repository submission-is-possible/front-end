<script lang="ts">
    //TODO: replace this with a service that fetches the user's submissions
    //  from the backend using pagination
    let submissions = [
      {
        id: 1,
        conference: 'International Conference on Software Engineering 2024',
        title: 'A Novel Approach to Software Testing',
        fileUrl: '/papers/paper1.pdf'
      },
      {
        id: 2,
        conference: 'Web Development Summit 2024',
        title: 'Modern Frontend Architecture Patterns',
        fileUrl: '/papers/paper2.pdf'
      }
    ];
  
    function viewPaper(fileUrl: string) {
        //TODO: Implement a way to view the paper
    }
</script>

<div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">My Submissions</h1>
    </div>

    <!-- Submissions Table -->
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Conference</th>
            <th>Paper Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each submissions as submission (submission.id)}
            <tr>
              <td>{submission.conference}</td>
              <td>{submission.title}</td>
              <td>
                <button
                  class="btn btn-sm btn-info"
                  on:click={() => viewPaper(submission.fileUrl)}
                >
                  View Paper
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    {#if submissions.length === 0}
      <div class="text-center py-10">
        <p class="text-gray-500">You haven't submitted any papers yet.</p>
      </div>
    {/if}
</div>