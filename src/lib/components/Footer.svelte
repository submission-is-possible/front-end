<script lang="ts">
  import Logo from '$lib/images/logo.png'
  import { clearConference } from '$stores/conferenceStore';
  import { user } from '$stores/userStore';
  
  let isLoggedin : boolean = $derived(!!$user?.isLoggedin);

  let navItems = [
      { label: 'Conference', link: '/conference', visible: true },
      { label: 'Notifications', link: '/notifications', visible: true },
      { label: 'Submissions', link: '/submissions', visible: false}
    ];

</script>

<div class="flex flex-col">
  <footer class="footer bg-neutral text-neutral-content p-10">
    <aside>
      <img src={Logo} alt="Logo" class="h-24" />
      <p>
        <b>Submission is Possible</b> Ltd.
        <br />
        Managing conventions since 2024
      </p>
    </aside>
    {#if isLoggedin }
      <nav>
        <h6 class="footer-title">Services</h6>
        <ul class="menu menu-nav">
          {#each navItems as item}
            <li><a onclick={()=>clearConference()} href={item.link}>{item.label}</a></li>
          {/each}
        </ul>
      </nav>
    {/if}
    <nav>
      <h6 class="footer-title">Pages</h6>
      <ul class="menu menu-nav">
        <li>
          <a href="/nika">About us</a>
        </li>
        <li>
          <a href="/nika">Contacts</a>
        </li>
      </ul>
    </nav>
  </footer>
  
  <footer class="footer footer-center bg-base-300 text-base-content p-4">
    <aside>
      <p>Copyright © {new Date().getFullYear()} - All right reserved by Submission is Possible Ltd</p>
    </aside>
  </footer>
</div>