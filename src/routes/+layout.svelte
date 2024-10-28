<script lang="ts">
    import '../app.css';
    import Footer from '../lib/components/Footer.svelte';
    import Navbar from '../lib/components/Navbar.svelte';

</script>

<Navbar/>

<main>
    <slot />  <!-- This renders the child content -->
</main>

<Footer/>
