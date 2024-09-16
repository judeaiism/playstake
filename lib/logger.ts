export const logger = {
  error: (err: any, context?: any) => {
    console.error('Error:', err, 'Context:', context)
  },
  // Add other log levels as needed (info, warn, debug, etc.)
}

// Add this line to ensure the file is treated as a module
export {}