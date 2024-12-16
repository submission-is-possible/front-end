<script lang="ts">
    import { goto } from "$app/navigation";

  // Go to conference-creation
  export let onClick

</script>

  <button 
    aria-label="CreateConferenceButton"
    type="button"
    on:click={onClick}
    class="flex items-center justify-center btn btn-primary text-white font-medium w-20 h-12 shadow-lg transition-colors duration-200">
    <div class="flex items-center justify-center">
      <iconify-icon icon="material-symbols:add-rounded" width="40" height="40"></iconify-icon>
    </div>
  </button>
