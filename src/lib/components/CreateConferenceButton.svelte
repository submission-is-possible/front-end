<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const conferencePath = '/conference';
  const conferenceCreationPath = '/conference/create-new';

  // Go to conference-creation
  function gotoConferenceCreation() {
    goto(conferenceCreationPath);
  }

</script>

{#if $page?.url?.pathname === conferencePath}
  <button 
    aria-label="CreateConferenceButton"
    on:click={gotoConferenceCreation}
    class="flex items-center justify-center bg-primary hover:bg-blue-600 text-white font-medium rounded-full w-20 h-20 shadow-lg transition-colors duration-200">
    <div class="flex items-center justify-center">
      <iconify-icon icon="material-symbols:add-rounded" width="40" height="40"></iconify-icon>
    </div>
  </button>
{/if}