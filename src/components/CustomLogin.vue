<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-subtitle">Please sign in to your account</p>
      </div>
      
      <form @submit.prevent="handleSignIn" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            class="form-input"
            placeholder="Enter your username"
            required
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            class="form-input"
            placeholder="Enter your password"
            required
            :disabled="isLoading"
          />
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading || !credentials.username || !credentials.password"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { signIn } from 'aws-amplify/auth'
import type { SignInResult, AuthError } from '../types/auth'

const emit = defineEmits<{
  signedIn: [result: SignInResult]
}>()

const credentials = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

async function handleSignIn() {
  if (!credentials.username || !credentials.password) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const result = await signIn({
      username: credentials.username,
      password: credentials.password
    })
    
    if (result.isSignedIn) {
      emit('signedIn', result)
    }
  } catch (err) {
    console.error('Sign in error:', err)
    error.value = getErrorMessage(err as AuthError)
  } finally {
    isLoading.value = false
  }
}

function getErrorMessage(err: AuthError): string {
  switch (err.name) {
    case 'NotAuthorizedException':
      return 'Invalid username or password'
    case 'UserNotFoundException':
      return 'User not found'
    case 'UserNotConfirmedException':
      return 'Please confirm your account first'
    case 'TooManyRequestsException':
      return 'Too many attempts. Please try again later'
    default:
      return err.message || 'An error occurred during sign in'
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.login-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
  text-align: center;
}
</style>