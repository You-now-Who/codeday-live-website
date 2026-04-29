import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'default' | 'primary' | 'accent'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-white text-primary border-2 border-primary shadow-hard btn-press',
  primary: 'bg-primary text-on-primary border-2 border-primary shadow-hard btn-press',
  accent: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-hard btn-press',
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-epilogue font-bold uppercase text-sm ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
