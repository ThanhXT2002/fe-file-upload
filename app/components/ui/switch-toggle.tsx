import React from 'react'

interface SwitchToggleProps {
  id: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
  className?: string
}

export function SwitchToggle({
  id,
  checked,
  onChange,
  disabled = false,
  label = 'Toggle',
  className = ''
}: SwitchToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type='checkbox'
        className='peer sr-only opacity-0'
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className='relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-400 px-0.5 outline-gray-400 transition-colors before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition-transform before:duration-300 peer-checked:bg-green-500 peer-checked:before:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-400 peer-checked:peer-focus-visible:outline-green-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
      >
        <span className='sr-only'>{label}</span>
      </label>
    </div>
  )
}
