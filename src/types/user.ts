import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  email: string | null;
  displayName: string | null;
  walletAddress?: string; // Add this line
}
