<script lang="ts">
import '../app.css';
import Footer from '../lib/components/Footer.svelte';
import Navbar from '../lib/components/Navbar.svelte';
import CreateConferenceButton from '$lib/components/CreateConferenceButton.svelte';
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />
  <!-- Main content wrapper -->
  <main class="flex-grow relative">
    <!-- Content container -->
    <div class="container mx-auto px-4 pb-20">
      <slot />
    </div>
    <!-- Create Conference Button wrapper with sticky positioning -->
    <div class="fixed bottom-4 right-4 z-10 mb-[var(--footer-height)]">
      <CreateConferenceButton />
    </div>
  </main>
  <Footer />
</div>

<style>
  :global(:root) {
    --footer-height: 64px; /* Adjust this value to match your footer height */
  }
</style>
