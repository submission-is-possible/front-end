<script lang="ts">
  import { goto } from '$app/navigation';

  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    submit?: string;
  }

  let formData: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  let errors: FormErrors = {};
  let submitStatus: string = '';

  function validateForm(): boolean {
    errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'Name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Surname is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email not valid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password has to be long at least 8 characters';
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'The passwords inserted do not match';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:8000/users/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        submitStatus = 'error';
        errors.submit = data.error;
        return;
      }

      submitStatus = 'success';
      setTimeout(() => {
        goto('/login');
      }, 2000);
       
    } catch (error) {
      submitStatus = 'error';
      errors.submit = 'Server Connection Error. Retry.';
    }
  }
</script>

<div class="hero-content flex-col">
  <div class="text-center">
    <h1 class="text-2xl font-bold" data-testid="signup-title">Sign Up</h1>
    <p class="py-6">Do you have an account? 
      <a href="/login" class="link link-primary">Log In</a>
    </p>
  </div>

  <div class="card w-1/2 shadow-2xl bg-base-100">
    <div class="card-body flex items-center">
      <form onsubmit={handleSubmit} data-testid="register-form">
        <!-- First Name Field -->
        <div class="form-control">
          <label class="label" for="firstName">
            <span class="label-text">Name</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Mario"
            class="input input-bordered"
            bind:value={formData.firstName}
            data-testid="firstName-input"
          />
          {#if errors.firstName}
              <span class="label-text-alt text-error" role="alert" data-testid="firstName-error">{errors.firstName}</span>
          {/if}
        </div>
        
        <!-- Last Name Field -->
        <div class="form-control">
          <label class="label" for="lastName">
            <span class="label-text">Surname</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Rossi"
            class="input input-bordered"
            bind:value={formData.lastName}
            data-testid="lastName-input"
          />
          {#if errors.lastName}
              <span class="label-text-alt text-error" role="alert" data-testid="lastName-error">{errors.lastName}</span>
          {/if}
        </div>
        
        <!-- Email Field -->
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="mario.rossi@esempio.com"
            class="input input-bordered"
            bind:value={formData.email}
            data-testid="email-input"
          />
          {#if errors.email}
              <span class="label-text-alt text-error" role="alert" data-testid="email-error">{errors.email}</span>
          {/if}
        </div>

        <!-- Password Field -->
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            class="input input-bordered"
            bind:value={formData.password}
            data-testid="password-input"
          />
          {#if errors.password}
              <span class="label-text-alt text-error" role="alert" data-testid="password-error">{errors.password}</span>
          {/if}
        </div>
        
        <!-- Confirm Password Field -->
        <div class="form-control">
          <label class="label" for="confirmPassword">
            <span class="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="********"
            class="input input-bordered"
            bind:value={formData.confirmPassword}
            data-testid="confirmPassword-input"
          />
          {#if errors.confirmPassword}
              <span class="label-text-alt text-error" role="alert" data-testid="confirmPassword-error">{errors.confirmPassword}</span>
          {/if}
        </div>

        <!-- Submit Error Message -->
        {#if errors.submit}
          <div class="alert alert-error mt-4" role="alert" data-testid="submit-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errors.submit}</span>
          </div>
        {/if}
        
        <!-- Submit Success Message -->
        {#if submitStatus === 'success'}
          <div class="alert alert-success mt-4" role="alert" data-testid="submit-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Sign up was successful!</span>
          </div>
        {/if}
        
        <!-- Submit Button -->
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" data-testid="submit-button">Sign Up</button>
        </div>
      </form>
    </div>
  </div>
</div>