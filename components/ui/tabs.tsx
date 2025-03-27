"use client"

import React, { createContext, useContext, useState } from "react";

// Create a context for Tabs
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({
  value: "",
  onValueChange: () => {},
});

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({ value, onValueChange, className = "", children }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList = ({ className = "", children }: TabsListProps) => {
  return (
    <div className={`flex space-x-1 rounded-md bg-muted p-1 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const TabsTrigger = ({ value, className = "", children, onClick }: TabsTriggerProps) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange(value);
    if (onClick) onClick();
  };

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
        isSelected
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/40"
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent = ({ value, className = "", children }: TabsContentProps) => {
  const { value: selectedValue } = useContext(TabsContext);

  if (selectedValue !== value) return null;

  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
};
