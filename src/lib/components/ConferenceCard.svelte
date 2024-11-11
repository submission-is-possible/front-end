<script lang="ts">
  export let conference: { id: number; title: string; description: string; role: string[]; deadline: string };

  // Funzione per determinare il colore del ruolo
  function getRoleColor(role: string) {
    switch (role) {
      case 'admin': return 'bg-red-500';     // Rosso per admin
      case 'author': return 'bg-blue-500';   // Blu per author
      case 'reviewer': return 'bg-green-500'; // Verde per reviewer
      default: return 'bg-gray-500';         // Grigio per ruoli sconosciuti
    }
  }

  // Funzione per ottenere le due lettere iniziali del ruolo
  function getRoleInitial(role: string) {
    switch (role) {
      case 'admin': return 'AD';     // 'AD' per admin
      case 'author': return 'AU';    // 'AU' per author
      case 'reviewer': return 'RE';  // 'RE' per reviewer
      default: return '??';          // Default se ruolo sconosciuto
    }
  }
</script>

<div class="card">
  <p><strong>{conference.title}</strong></p>
  <p>{conference.description}</p>
  
  <!-- Visualizzazione dei ruoli come lettere -->
  <p><strong>Roles:</strong>
    {#each conference.role as role}
      <span class={`inline-block text-white text-xs font-bold rounded-full px-2 py-1 mr-1 ${getRoleColor(role)}`}>
        {getRoleInitial(role)}
      </span>
    {/each}
  </p>
  
  <p><strong>Deadline:</strong> {conference.deadline}</p>
</div>

<style>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    background-color: #f9f9f9;
    width: 200px;
    color: #333;
  }

  /* Stili per il tema scuro */
  @media (prefers-color-scheme: dark) {
    .card {
      border: 1px solid #555;
      background-color: #333;
      color: #f9f9f9;
    }
  }
</style>
