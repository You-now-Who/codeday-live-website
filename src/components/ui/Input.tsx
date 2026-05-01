import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="font-grotesk text-xs font-medium uppercase tracking-widest text-primary/70"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`border-0 border-b-2 border-primary bg-transparent outline-none focus:border-secondary-fixed px-0 py-2 font-grotesk text-base text-on-surface caret-[#c3f400] ${className}`}
        {...props}
      />
    </div>
  )
}
