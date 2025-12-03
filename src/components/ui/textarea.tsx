import * as React from 'react';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ ...props }, ref) => (
    <textarea
      ref={ref}
      className="w-full border border-gray-300 rounded-2xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
