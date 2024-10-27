<script lang="ts">
  import logo from '/logo.png';

  let isLoggedin: Boolean = false;
</script>

<div class="flex flex-col">
  <footer class="footer bg-neutral text-neutral-content p-10">
    <aside>
      <img src={logo} alt="Logo" class="h-24" />
      <p>
        <b>Submission is Possible</b> Ltd.
        <br />
        Managing conventions since 2024
      </p>
    </aside>
    {#if isLoggedin}
      <nav>
        <h6 class="footer-title">Services</h6>
        <ul class="menu menu-nav">
          <li>
            <a href="/conventions">Conventions</a>
          </li>
          <li>
            <a href="/reviews">Reviews</a>
          </li>
          <li>
            <a href="/submissions">Submissions</a>
          </li>
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
    </nav>
  </footer>
  
  <footer class="footer footer-center bg-base-300 text-base-content p-4">
    <aside>
      <p>Copyright © {new Date().getFullYear()} - All right reserved by Submission is Possible Ltd</p>
    </aside>
  </footer>
</div>