<script lang="ts">
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    let loading = false;

    // Inizializza l'oggetto form
    let form = {
        error: '',
        email: '',
        password: ''
    };

    const handleSubmit: SubmitFunction = () => {
        loading = true;
        return async ({ update, result }) => {
            loading = false;
            
            console.log(result); // Aggiungi questo log per vedere la struttura di `result`
            if (result.type === 'failure') {
                form.error = 'Errore durante il login. Riprova.';
            } else {
                await update();
            }
        };
    };
</script>
  
  <div class="hero-content flex-col">
    <div class="text-center">
      <h1 class="text-5xl font-bold">Login</h1>
      <p class="py-6">Are you new here?
        <a href="/register" class="link link-primary">Sign Up!</a>
      </p>
    </div>
    <div class="card w-96 bg-base-100 shadow-xl rounded-2xl">
      <div class="card-body">
        
        <form 
          method="POST" 
          use:enhance={handleSubmit}
          class="space-y-4"
        >
        {#if form?.error}
            <div class="alert alert-error shadow-lg rounded-2xl">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{form.error}</span>
                </div>
            </div>
        {/if}
  
          <div class="form-control">
            <label for="login-email" class="label">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={form?.email ?? ''}
              class="input input-bordered w-full rounded-2xl"
              class:input-error={form?.error}
              placeholder="Enter your email"
              required
            />
          </div>
  
          <div class="form-control">
            <label for="login-password" class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              type="password"
              id="login-password"
              name="password"
              class="input input-bordered w-full rounded-2xl"
              class:input-error={form?.error}
              placeholder="Enter your password"
              required
            />
          </div>
  
          <div class="form-control">
            <label for="login-remember" class="label cursor-pointer">
              <span class="label-text">Remember me</span>
              <input 
                type="checkbox" 
                id="login-remember"
                name="rememberMe"
                class="checkbox checkbox-primary rounded-xl"
              />
            </label>
          </div>
  
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary w-full rounded-2xl" 
              name="login"
              disabled={loading}
            >
              {#if loading}
                <span class="loading loading-spinner"></span>
              {/if}
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>