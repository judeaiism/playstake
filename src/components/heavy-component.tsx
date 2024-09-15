import { useState, useEffect } from 'react'

interface DataType {
  id: number
  name: string
  // Add other fields as necessary
}

export default function HeavyComponent() {
  const [data, setData] = useState<DataType[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data')
        const result: DataType[] = await response.json()
        setData(result) // Ensure result is of type DataType[]
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {/* Render your data here */}
    </div>
  )
}
