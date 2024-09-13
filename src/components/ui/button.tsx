import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
}

export function Button({ children, variant = 'default', size = 'medium', className, ...props }: ButtonProps) {
  return (
    <button
      className={`button ${variant} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
