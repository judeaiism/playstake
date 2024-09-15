export interface User {
  id: string
  email: string
  username: string
  psnName: string
  avatarUrl: string
  walletAddress: string // New field
  balance: number // New field
  // Add any other relevant user properties
}
