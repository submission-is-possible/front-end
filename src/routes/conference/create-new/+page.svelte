<script lang="ts">
    import { goto } from '$app/navigation';
    let conferencePath: string | URL = "/conference";

    function gotoConference() {
        goto(conferencePath);
    }

</script>
    
    <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <button
            class="btn btn-secondary"
            on:click={gotoConference}
        >
          Go Back
        </button>
        <h1 class="text-2xl font-bold">Create New Conference</h1>
      </div>
    
      <form class="space-y-6">
        <div>
          <label for="title" class="label">
            <span class="label-text">Title</span>
          </label>
          <input id="title" type="text" placeholder="Enter conference title" class="input input-bordered w-full" />
        </div>
    
        <div>
          <label for="description" class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea id="description" placeholder="Enter conference description" class="textarea textarea-bordered w-full"></textarea>
        </div>
    
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="date" class="label">
              <span class="label-text">Date</span>
            </label>
            <input id="date" type="date" class="input input-bordered w-full" />
          </div>
    
          <div>
            <label for="location" class="label">
              <span class="label-text">Location</span>
            </label>
            <input id="location" type="text" placeholder="Enter conference location" class="input input-bordered w-full" />
          </div>
        </div>
    
        <div>
          <label for="recording" class="cursor-pointer label">
            <span class="label-text">Allow Recording</span>
            <input type="checkbox" id="recording" class="checkbox" />
          </label>
        </div>
    
        <button type="submit" class="btn btn-primary w-full">
          Create Conference
        </button>
      </form>
    </div>