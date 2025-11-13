// src/amplify.js
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-central-1_42l28C0kv',
      userPoolClientId: 'sot88lji4bcf3vg5l2itf9nml',
      loginWith: {
        username: true, // or email: true if you sign in with email
      },
    },
    region: 'eu-central-1',
  },
})
