import { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'default' | 'primary' | 'accent'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-white text-primary border-2 border-primary shadow-stamp btn-press sketch-box',
  primary: 'bg-primary text-on-primary border-2 border-primary shadow-stamp btn-press sketch-box stamp',
  accent: 'bg-secondary-fixed text-on-secondary-fixed border-2 border-primary shadow-stamp btn-press sketch-box',
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 font-epilogue font-bold uppercase text-sm tracking-wider ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
