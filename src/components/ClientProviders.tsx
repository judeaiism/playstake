'use client'

import React from 'react'
import AuthProvider from '@/contexts/AuthContext'
import FirebaseInitializer from './FirebaseInitializer'

const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <FirebaseInitializer />
      {children}
    </AuthProvider>
  )
}

export default ClientProviders

