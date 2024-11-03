<script lang="ts">
  import LoginButton from './LoginButton.svelte';
  import Logo from '$lib/images/logo.png'

  import { user } from '$stores/userStore';
  let userData = $user;

</script>

<div class="navbar bg-base-300 shadow-xl">
  <div class="navbar-start flex items-center gap-4">
    <!-- Company logo -->
    <a href="/">
    <div class="flex items-center gap-2">
        <img src={Logo} alt="Company Logo" class="w-10 h-10" />
      <span class="text-xl">Submission is Possible </span>

    </div>
    </a>

    {#if userData.isLoggedin}
      <ul class="menu menu-horizontal px-1">
        <li><a href="/conference">Conference</a></li>
        <li><a href="/reviews">Reviews</a></li>
        <li><a href="/submissions">Submissions</a></li>
      </ul>
    {/if}
  </div>
  
  <div class="navbar-end">
      <LoginButton />
  </div>
</div>