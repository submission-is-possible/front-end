<script lang="ts">
    import { goto } from '$app/navigation';
    
    // This component should be listen to a user service or something similar that
    // contains the user state and set isLoggedin variable accordingly
    let isLoggedin: Boolean = false;

    const handleAuth = () => {
        if (isLoggedin) {
            // Handle logout logic here
            // You might want to call your auth service logout method
            isLoggedin = false;
        } else {
            // Redirect to login page
            goto('/login');
        }
    };
</script>

<button 
    class="btn btn-primary rounded-full"
    on:click={handleAuth}
>
    {#if isLoggedin}
        <iconify-icon icon="material-symbols:logout" width="24" height="24"></iconify-icon>
        <span>Logout</span>
    {:else}
        <iconify-icon icon="material-symbols:login" width="24" height="24"></iconify-icon>
        <span>Login</span>
    {/if}
</button>