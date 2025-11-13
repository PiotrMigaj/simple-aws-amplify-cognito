<template>
  <div class="app">
    <!-- Show custom login if not authenticated -->
    <CustomLogin v-if="!isAuthenticated" @signed-in="handleSignIn" />
    
    <!-- Show main app if authenticated -->
    <div v-else class="main-app">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">Dashboard</h1>
          <div class="user-info">
            <span class="welcome-text">Hello, {{ currentUser?.username }} 👋</span>
            <button @click="handleSignOut" class="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main class="app-main">
        <div class="content-container">
          <div class="card">
            <h2 class="card-title">Authentication Tokens</h2>
            <p class="card-description">
              View your current session tokens for debugging purposes
            </p>
            
            <button @click="logTokens" class="action-button">
              <span class="button-icon">🔍</span>
              Inspect Tokens
            </button>
            
            <div v-if="message" class="message" :class="messageType">
              {{ message }}
            </div>
          </div>
          
          <div class="card">
            <h2 class="card-title">User Information</h2>
            <div class="user-details">
              <div class="detail-item">
                <span class="detail-label">Username:</span>
                <span class="detail-value">{{ currentUser?.username }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">User ID:</span>
                <span class="detail-value">{{ currentUser?.userId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value status-active">Active</span>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2 class="card-title">Tenant Information</h2>
            <p class="card-description">
              Your tenant data from the backend API
            </p>
            
            <button @click="fetchTenantInfo" class="action-button" :disabled="isFetchingTenant">
              <span v-if="isFetchingTenant" class="loading-spinner"></span>
              <span v-else class="button-icon">🏢</span>
              {{ isFetchingTenant ? 'Loading...' : 'Fetch Tenant Info' }}
            </button>
            
            <div v-if="tenantInfo" class="tenant-info">
              <div class="tenant-display">
                <h3 class="tenant-title">Tenant Data:</h3>
                <div class="tenant-content">{{ tenantInfo }}</div>
              </div>
            </div>
            
            <div v-if="tenantError" class="message error">
              {{ tenantError }}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentUser, fetchAuthSession, signOut } from 'aws-amplify/auth'
import CustomLogin from './components/CustomLogin.vue'
import { apiService } from './services/api'
import type { User, AuthError } from './types/auth'

const isAuthenticated = ref(false)
const currentUser = ref<User | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const tenantInfo = ref<string>('')
const tenantError = ref<string>('')
const isFetchingTenant = ref(false)

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    isAuthenticated.value = true
  } catch {
    isAuthenticated.value = false
  }
})

function handleSignIn() {
  isAuthenticated.value = true
  getCurrentUser().then(user => {
    currentUser.value = user
    fetchTenantInfo()
  }).catch(console.error)
}

async function handleSignOut() {
  try {
    await signOut()
    isAuthenticated.value = false
    currentUser.value = null
    message.value = ''
    tenantInfo.value = ''
    tenantError.value = ''
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

async function fetchTenantInfo() {
  isFetchingTenant.value = true
  tenantError.value = ''
  
  try {
    const tenant = await apiService.getTenant()
    tenantInfo.value = tenant
  } catch (error) {
    console.error('Tenant fetch error:', error)
    const authError = error as AuthError
    tenantError.value = authError.message || 'Failed to fetch tenant information'
  } finally {
    isFetchingTenant.value = false
  }
}

async function logTokens() {
  try {
    const { tokens } = await fetchAuthSession()
    console.log('Access Token:', tokens?.accessToken.toString())
    console.log('ID Token:', tokens?.idToken?.toString())
    message.value = 'Tokens logged to console successfully ✅'
    messageType.value = 'success'
  } catch (err) {
    console.error(err)
    const authError = err as AuthError
    message.value = `Error: ${authError.message}`
    messageType.value = 'error'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f8fafc;
}

.app {
  min-height: 100vh;
}

.main-app {
  min-height: 100vh;
  background-color: #f8fafc;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: #64748b;
  font-weight: 500;
}

.sign-out-button {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sign-out-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.app-main {
  padding: 2rem;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.action-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.button-icon {
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #475569;
}

.detail-value {
  color: #1e293b;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}

.status-active {
  color: #059669 !important;
  font-weight: 600 !important;
  font-family: inherit !important;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.message.success {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.tenant-info {
  margin-top: 1.5rem;
}

.tenant-display {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.tenant-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.tenant-content {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 3rem;
  display: flex;
  align-items: center;
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

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .content-container {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
  
  .card {
    padding: 1.5rem;
  }
}
</style>
