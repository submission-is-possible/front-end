<script lang="ts">
  import '../app.css';
  import Footer from '../lib/components/Footer.svelte';
  import Navbar from '../lib/components/Navbar.svelte';
  import CreateConferenceButton from '$lib/components/CreateConferenceButton.svelte';
</script>

<div class="min-h-screen flex flex-col">
  <Navbar />

  <main class="flex justify-center items-center h-screen">
      <div class="w-1/3 p-4"></div>
      <div class="w-2/4 p-4">
        <div class="container px-4 pb-20">
          <slot />
        </div>
      </div>
      <div class="w-1/3 p-4"></div>
    

    <div class="fixed bottom-4 right-4 z-10 mb-64">
      <CreateConferenceButton />
    </div>

  </main>
  <Footer />
</div>