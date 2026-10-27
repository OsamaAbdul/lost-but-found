import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#0793D4] text-white hover:bg-[#057cb4] active:bg-[#046897] shadow-xs focus-visible:ring-[#0793D4]',
      success:
        'bg-[#79BF2B] text-white hover:bg-[#69a724] active:bg-[#578d1c] shadow-xs focus-visible:ring-[#79BF2B]',
      warning:
        'bg-[#FBBF07] text-gray-950 font-semibold hover:bg-[#e5ad06] active:bg-[#cca005] shadow-xs focus-visible:ring-[#FBBF07]',
      secondary:
        'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus-visible:ring-red-500',
      outline:
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-[#0793D4]',
      ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 focus-visible:ring-[#0793D4]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
