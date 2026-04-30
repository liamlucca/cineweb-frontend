
interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

function Button({ onClick, disabled, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export default Button