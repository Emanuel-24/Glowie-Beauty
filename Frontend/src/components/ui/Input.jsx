import { forwardRef } from 'react'

const sizes = {
  sm: 'min-h-10 px-4 py-2 text-xs',
  md: 'min-h-11 px-5 py-3 text-xs',
}

const Input = forwardRef(function Input({ size = 'md', className = '', ...props }, ref) {
  return <input ref={ref} className={`glass-input ${sizes[size] || sizes.md} ${className}`} {...props} />
})

Input.displayName = 'Input'

export default Input
