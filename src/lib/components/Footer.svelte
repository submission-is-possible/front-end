<script lang="ts">
  import Logo from '$lib/images/logo.png'

  import { user } from '$stores/userStore';
  let userData = $user;

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
    {#if userData.isLoggedin }
      <nav>
        <h6 class="footer-title">Services</h6>
        <ul class="menu menu-nav">
          <li>
            <a href="/conference">Conference</a>
          </li>
          <li>
            <a href="/reviews">Reviews</a>
          </li>
          <li>
            <a href="/submissions">Submissions</a>
          </li>
        </ul>
      </nav>
    {/if}
    <nav>
      <h6 class="footer-title">Pages</h6>
      <ul class="menu menu-nav">
        <li>
          <a href="/about-us">About us</a>
        </li>
        <li>
          <a href="/contacts">Contacts</a>
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