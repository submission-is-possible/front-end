<script lang="ts">
  import LoginButton from './LoginButton.svelte';
  import Logo from '$lib/images/logo.png'
  import { clearConference } from '$stores/conferenceStore';
  
  let navItems = [
      { label: 'My Conferences', link: '/conference', visible: true },
      { label: 'Reviews', link: '/reviews', visible: true },
      { label: 'Notifications', link: '/notifications', visible: true },
      { label: 'Submissions', link: '/submissions', visible: false}
    ];

  import { user } from '$stores/userStore';
  let isLoggedin : boolean = $derived(!!$user?.isLoggedin);

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

    {#if isLoggedin}
      <ul class="menu menu-horizontal px-1">
        {#each navItems as item}
          <li><a onclick={()=>clearConference()} href={item.link}>{item.label}</a></li>
        {/each}
      </ul>
    {/if}
  </div>
  
  <div class="navbar-end">
      <LoginButton />
  </div>
</div>