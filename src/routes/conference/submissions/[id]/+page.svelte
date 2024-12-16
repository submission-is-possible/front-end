<script lang="ts">
    // TypeScript types for the component
    type Reviewer = {
      id: number;
      name: string;
    };
  
    let reviewers: Reviewer[] = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];
    
    let nextReviewerId = 3;
    let newReviewerName = '';
  
    function addReviewer() {
      if (newReviewerName.trim()) {
        reviewers = [...reviewers, { id: nextReviewerId++, name: newReviewerName }];
        newReviewerName = '';
      }
    }
  </script>
  
  <main class="p-4 max-w-2xl mx-auto">
    <div class="card shadow-lg bg-base-100 p-6">
      <h1 class="text-2xl font-bold mb-4">Conference Paper Title</h1>
      
      <p class="mb-4">Authors: Alice Johnson, Bob Martinez</p>
      <!---
      <button class="btn btn-primary mb-4" on:click={() => alert('Downloading paper...')}>
        Download Paper
      </button>
      -->
      <h2 class="text-xl font-semibold mb-2">Reviewers</h2>
      <ul class="list-disc ml-6 mb-4">
        {#each reviewers as { id, name }}
          <li>{name}</li>
        {/each}
      </ul>
  
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">Select Reviewer</span>
        </label>
        <input
          type="text"
          class="input input-bordered"
          bind:value={newReviewerName}
          placeholder="Enter reviewer's name"
        />
      </div>
      
      <button class="btn btn-secondary" on:click={addReviewer}>
        Add Reviewer
      </button>
    </div>
  </main>
  
  <style>
    main {
      margin-top: 20px;
    }
  </style>
  