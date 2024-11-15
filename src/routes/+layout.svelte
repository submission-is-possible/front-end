<script lang="ts">
  import '../app.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';

</script>

<div class="min-h-screen flex flex-col justify-between">
  <div class="flex flex-col flex-grow"> <!-- Added wrapper div -->
    <Navbar />
    <Toolbar />
    <main class="flex flex-grow">
      <div class="w-1/5 p-4"></div>
      <div class="w-3/5 p-4">
        <div class="container px-4 pb-20">
          <slot />
        </div>
      </div>
    </main>
  </div>
  <Footer />
</div>