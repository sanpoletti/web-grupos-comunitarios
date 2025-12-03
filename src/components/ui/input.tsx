import * as React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => (
    <input
      ref={ref}
      className="w-full border border-gray-300 rounded-2xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      {...props}
    />
  )
);
Input.displayName = 'Input';
