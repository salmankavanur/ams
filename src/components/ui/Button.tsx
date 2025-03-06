'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  
  // Variant classes (with dark mode support)
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow focus:ring-primary dark:bg-primary dark:hover:bg-primary-dark dark:shadow-gray-800/20',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 shadow-sm hover:shadow dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:focus:ring-gray-400',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-primary hover:text-gray-900 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400 dark:hover:bg-gray-800/60 dark:text-gray-300 dark:hover:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600',
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'py-1 px-2.5 text-xs',
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-sm',
    lg: 'py-2.5 px-5 text-base',
    xl: 'py-3 px-6 text-lg',
  };
  
  // Icon spacing
  const iconSpacing = {
    xs: 'mr-1.5',
    sm: 'mr-1.5',
    md: 'mr-2',
    lg: 'mr-2',
    xl: 'mr-2.5',
  };
  
  const iconSpacingRight = {
    xs: 'ml-1.5',
    sm: 'ml-1.5',
    md: 'ml-2',
    lg: 'ml-2',
    xl: 'ml-2.5',
  };
  
  // Icon sizing
  const iconSizing = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Loading and disabled state
  const stateClasses = (isLoading || disabled) 
    ? 'opacity-70 cursor-not-allowed' 
    : 'cursor-pointer';
  
  // Hover effects
  const hoverEffect = !disabled && !isLoading ? 'transform hover:-translate-y-0.5' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${stateClasses} ${hoverEffect} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg 
            className="animate-spin mr-2 h-4 w-4 text-current opacity-90" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={`${iconSpacing[size]}`}>
              <span className={`${iconSizing[size]} inline-flex items-center justify-center`}>{icon}</span>
            </span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className={`${iconSpacingRight[size]}`}>
              <span className={`${iconSizing[size]} inline-flex items-center justify-center`}>{icon}</span>
            </span>
          )}
        </>
      )}
    </button>
  );
};

// Usage example component
export const ButtonPreview: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Light Mode</h3>
          <div className="p-6 bg-white rounded-lg border border-gray-200 flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Dark Mode (Preview)</h3>
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 flex flex-wrap gap-2">
            <Button variant="primary" className="dark">Primary</Button>
            <Button variant="secondary" className="dark">Secondary</Button>
            <Button variant="outline" className="dark">Outline</Button>
            <Button variant="ghost" className="dark">Ghost</Button>
            <Button variant="danger" className="dark">Danger</Button>
            <Button variant="success" className="dark">Success</Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Sizes</h3>
        <div className="p-6 bg-white rounded-lg border border-gray-200 flex flex-wrap items-center gap-2">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">With Icons</h3>
        <div className="p-6 bg-white rounded-lg border border-gray-200 flex flex-wrap gap-2">
          <Button 
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>}
          >
            Add Item
          </Button>
          <Button 
            variant="outline"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
          >
            Information
          </Button>
          <Button 
            variant="secondary"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
            iconPosition="right"
          >
            Download
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium">States</h3>
        <div className="p-6 bg-white rounded-lg border border-gray-200 flex flex-wrap gap-2">
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth>Full Width Button</Button>
        </div>
      </div>
    </div>
  );
};

export default Button;