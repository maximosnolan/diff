// src/components/ui/card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

export { Card, CardContent };
