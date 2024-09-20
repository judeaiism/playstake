'use client'

import { useEffect } from 'react'
import { app } from '@/app/firebase/config'

export function FirebaseInitializer() {
  useEffect(() => {
    // Firebase is initialized when this component mounts
  }, [])

  return null
}

export default FirebaseInitializer
