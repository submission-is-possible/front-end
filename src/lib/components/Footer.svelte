<script>
  import logo from '/logo.png';
</script>

<div class="flex flex-col">
  <footer class="footer bg-neutral text-neutral-content p-10">
    <aside>
      <img src={logo} alt="Logo" class="h-8 w-24 h-24" />
      <p>
        <b>Submission is Possible</b> Ltd.
        <br />
        Managing conventions since 2024
      </p>
    </aside>
    <nav>
      <h6 class="footer-title">Services</h6>
      <ul class="menu menu-nav">
        <li>
          <a href="/">Home</a>
        </li>
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
    <nav>
      <h6 class="footer-title">Pages</h6>
      <ul class="menu menu-nav">
        <li>
          <a href="/">About us</a>
        </li>
        <li>
          <a href="/conventions">Contacts</a>
        </li>
    </nav>
  </footer>
  
  <footer class="footer footer-center bg-base-300 text-base-content p-4">
    <aside>
      <p>Copyright © {new Date().getFullYear()} - All right reserved by Submission is Possible Ltd</p>
    </aside>
  </footer>
</div>