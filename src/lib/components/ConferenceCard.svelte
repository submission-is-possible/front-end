<script lang="ts">
  import { goto } from '$app/navigation';
  export let conference: { id: number; title: string; description: string; role: string[]; deadline: string; user_id: number};

  function truncate(text: string, maxLength: number) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'author': return 'bg-blue-500';
      case 'reviewer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  function goToConferenceDetail(conferenceId: number) {
    goto(`/conference/${conferenceId}/`);
  }

  function getRoleInitial(role: string) {
    switch (role) {
      case 'admin': return 'AD';
      case 'author': return 'AU';
      case 'reviewer': return 'RE';
      default: return '??';
    }
  }
</script>

<button class="card" on:click={() => goToConferenceDetail(conference.id)} aria-label="Conference details">
  <p><strong>{truncate(conference.title, 20)}</strong></p>
  <p>{truncate(conference.description, 40)}</p>
  
  <p><strong>Roles:</strong>
    {#each conference.role as role}
      <span class={`inline-block text-white text-xs font-bold rounded-full px-2 py-1 mr-1 ${getRoleColor(role)}`}>
        {getRoleInitial(role)}
      </span>
    {/each}
  </p>
  
  <p><strong>Deadline:</strong> {conference.deadline}</p>
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
