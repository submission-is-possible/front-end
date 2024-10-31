<script lang="ts">
    // Sample data structure - replace with your actual data source
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
  
    let showDeleteModal = false;
    let submissionToDelete: any = null;
  
    function openDeleteModal(submission: any) {
      submissionToDelete = submission;
      showDeleteModal = true;
    }
  
    function closeDeleteModal() {
      showDeleteModal = false;
      submissionToDelete = null;
    }
  
    function deleteSubmission() {
      if (submissionToDelete) {
        // Here you would typically make an API call to delete the submission
        submissions = submissions.filter(s => s.id !== submissionToDelete.id);
        closeDeleteModal();
      }
    }
  
    function viewPaper(fileUrl: string) {
      // Open the PDF in a new tab
      window.open(fileUrl, '_blank');
    }
  </script>
  
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Submissions</h1>
      <a href="/submit" class="btn btn-primary">New Submission</a>
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
              <td class="space-x-2">
                <button
                  class="btn btn-sm btn-info"
                  on:click={() => viewPaper(submission.fileUrl)}
                >
                  View Paper
                </button>
                <button
                  class="btn btn-sm btn-error"
                  on:click={() => openDeleteModal(submission)}
                >
                  Remove
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  
    <!-- Delete Confirmation Modal -->
    {#if showDeleteModal}
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Confirm Deletion</h3>
          <p class="py-4">
            Are you sure you want to remove your submission for "{submissionToDelete.title}" 
            from {submissionToDelete.conference}?
          </p>
          <div class="modal-action">
            <button class="btn btn-error" on:click={deleteSubmission}>
              Yes, Remove
            </button>
            <button class="btn" on:click={closeDeleteModal}>Cancel</button>
          </div>
        </div>
      </div>
    {/if}
  
    <!-- Empty State -->
    {#if submissions.length === 0}
      <div class="text-center py-10">
        <p class="text-gray-500">You haven't submitted any papers yet.</p>
        <a href="/submit" class="btn btn-primary mt-4">Submit Your First Paper</a>
      </div>
    {/if}
  </div>