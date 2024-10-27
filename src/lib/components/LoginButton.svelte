<script lang="ts">
    // This component should be listen to a user service or something similar that
    //  contains the user state and set isLoggedin variable accordingly
    let isLoggedin: Boolean = false;
</script>

<button class="btn btn-primary rounded-full">
    {#if isLoggedin}
        <iconify-icon icon="material-symbols:logout" width="24" height="24"></iconify-icon>
        <span>Logout</span>
    {:else}
        <iconify-icon icon="material-symbols:login" width="24" height="24"></iconify-icon>
        <span>Login</span>
    {/if}
</button>