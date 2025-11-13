import { fetchAuthSession } from 'aws-amplify/auth'

const API_BASE_URL = 'https://4hfpkn6je0.execute-api.eu-central-1.amazonaws.com/Prod'

export interface ApiError {
  message: string
  status?: number
}

export class ApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const { tokens } = await fetchAuthSession()
      const idToken = tokens?.idToken?.toString()
      
      if (!idToken) {
        throw new Error('No ID token available')
      }
      
      return {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    } catch {
      throw new Error('Failed to get authentication token')
    }
  }
  
  async getTenant(): Promise<string> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/tenant`, {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const tenantData = await response.text()
      return tenantData
    } catch (error) {
      console.error('API Error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown error occurred while fetching tenant data')
    }
  }
}

export const apiService = new ApiService()