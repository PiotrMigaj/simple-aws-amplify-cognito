export interface User {
  username: string
  userId: string
}

export interface SignInResult {
  isSignedIn: boolean
  nextStep?: {
    signInStep: string
  }
}

export interface AuthError {
  name: string
  message: string
}