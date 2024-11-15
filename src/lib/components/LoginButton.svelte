<script lang="ts">

  import { user, clearUser } from '$stores/userStore';
  import { goto } from '$app/navigation';
  
  let isLoggedin : boolean = $derived(!!$user?.isLoggedin);

</script>


{#if isLoggedin}
    <button onclick={() => {clearUser(); goto("/");}} class="btn btn-primary rounded-full" data-testid="global_logout-button">
        <iconify-icon icon="material-symbols:logout" width="24" height="24"></iconify-icon>
        <span>Logout</span>
    </button>
{:else}
    <button onclick={() => goto("/login")} class="btn btn-primary rounded-full" data-testid="global_login-button">
        <iconify-icon icon="material-symbols:login" width="24" height="24"></iconify-icon>
        <span>Login</span>
    </button>
{/if}

