<!-- ConferenceCard.svelte -->
<script lang="ts">
  export let conference: { id: number; title: string; role: string; deadline: string };
</script>

<div class="card">
  <h3>{conference.title}</h3>
  <p><strong>Role:</strong> {conference.role}</p>
  <p><strong>Deadline:</strong> {conference.deadline}</p>
</div>

<style>
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    background-color: #f9f9f9;
    width: 200px;
    color: #333; /* Colore testo tema chiaro */
  }

  /* Stili per il tema scuro */
  @media (prefers-color-scheme: dark) {
    .card {
      border: 1px solid #555;
      background-color: #333;
      color: #f9f9f9; /* Colore testo tema scuro */
    }
  }
</style>
