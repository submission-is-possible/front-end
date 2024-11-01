<script lang="ts">

interface FormData {
  error: string;
  email: string;
  password: string;
}

let form: FormData = {
  error: '',
  email: '',
  password: ''
};
let loading = false;

async function handleSubmit(event: SubmitEvent): Promise<void> {
    loading = true;
    
    try {
        const response = await fetch('http://localhost:8000/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: form.email,
                password: form.password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            form.error = data.error || 'Error during the login. Retry.';
        }
    } catch (error) {
        form.error = 'Server connection error. Retry.';
    } finally {
        loading = false;
    }
}
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
          on:submit|preventDefault={handleSubmit}
          class="space-y-4"
        >
        {#if form?.error}
            <div class="alert alert-error shadow-lg rounded-2xl">
                <div>
                    
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
              bind:value={form.email}
              class="input input-bordered w-full rounded-2xl"
              class:input-error={form.error}
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
              bind:value={form.password}
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