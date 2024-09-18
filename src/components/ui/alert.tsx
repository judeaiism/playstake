import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  title?: string;
  className?: string; // Add this line
}

export function Alert({ children, title, className }: AlertProps) {
  return (
    <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 ${className || ''}`} role="alert">
      {title && <h3 className="font-bold">{title}</h3>}
      <p>{children}</p>
    </div>
  );
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold">{children}</h3>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}