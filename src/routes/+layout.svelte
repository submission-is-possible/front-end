<script lang="ts">
  import '../app.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import CreateConferenceButton from '$lib/components/CreateConferenceButton.svelte';

  //import { user } from '$stores/userStore';
  //let userData = $user;


</script>

<div class="min-h-screen flex flex-col justify-between">
  <div class="flex flex-col flex-grow"> <!-- Added wrapper div -->
    <Navbar />
    <main class="flex flex-grow">
      <div class="w-1/5 p-4"></div>
      <div class="w-3/5 p-4">
        <div class="container px-4 pb-20">
          <slot />
        </div>
      </div>
      <div class="w-1/5 p-4 flex flex-col justify-between">
        <div></div>
        <div class="flex justify-end">
          <CreateConferenceButton />
        </div>
      </div>
    </main>
  </div>
  <Footer />
</div>