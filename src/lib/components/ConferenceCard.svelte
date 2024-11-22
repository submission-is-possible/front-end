<script lang="ts">
  import { goto } from '$app/navigation';  
  import { Conference, goToConferenceDetail} from '$lib/models/conference';
  import { setConference } from '$stores/conferenceStore';
  import { getRoleInitial, getRoleColor } from '$lib/models/role'

  export let conference: Conference;

  function truncate(text: String, maxLength: number) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  function formatDate(dateStr: string | number | Date) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

</script>

<button class="card" on:click={() => goToConferenceDetail(conference)} aria-label="Conference details">
  <p><strong>{truncate(conference.title, 20)}</strong></p>
  <p>{truncate(conference.description, 40)}</p>
  
  <p><strong>Roles:</strong>
    {#each conference.roles as role}
      <span class={`inline-block text-white text-xs font-bold rounded-full px-2 py-1 mr-1 ${getRoleColor(role)}`}>
        {getRoleInitial(role)}
      </span>
    {/each}
  </p>
  
  <p><strong>Deadline:</strong> {formatDate(conference.deadline)}</p>
  <p><strong>Created:</strong> {formatDate(conference.created_at)}</p>

</button>

<style>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    background-color: #f9f9f9;
    width: 200px;
    color: #333;
  }
  
  @media (prefers-color-scheme: dark) {
    .card {
      border: 1px solid #555;
      background-color: #333;
      color: #f9f9f9;
    }
  }
</style>
