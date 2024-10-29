<script>
  import { page } from '$app/stores';

  const conferencePath = '/conference';

  // For debugging, let's add multiple logging approaches
  console.log('Initial pathname:', $page?.url?.pathname); // Safe access
  console.log('Whole page store:', $page); // Log entire store

</script>

{#if $page?.url?.pathname === conferencePath}
  <button 
    aria-label="CreateConferenceButton" 
    class="flex items-center justify-center bg-primary hover:bg-blue-600 text-white font-medium rounded-full w-20 h-20 shadow-lg transition-colors duration-200">
    <div class="flex items-center justify-center">
      <iconify-icon icon="material-symbols:add-rounded" width="40" height="40"></iconify-icon>
    </div>
  </button>
{/if}