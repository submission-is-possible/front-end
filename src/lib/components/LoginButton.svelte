<script lang="ts">

  import { user, clearUser } from '$stores/userStore';
  import { goto } from '$app/navigation';
  
  let userData = $user;

</script>


{#if userData.isLoggedin}
    <button on:click={() => {clearUser(); goto("/");}} class="btn btn-primary rounded-full">
        <iconify-icon icon="material-symbols:logout" width="24" height="24"></iconify-icon>
        <span>Logout</span>
    </button>
{:else}
    <button on:click={() => goto("/login")} class="btn btn-primary rounded-full">
        <iconify-icon icon="material-symbols:login" width="24" height="24"></iconify-icon>
        <span>Login</span>
    </button>
{/if}

