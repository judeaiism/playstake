import { User as FirebaseUser } from 'firebase/auth'

export interface User extends FirebaseUser {
  balance?: number
  // Add any other custom properties your app uses
}
