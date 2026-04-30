interface FileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept?: string
}

function FileInput({ onChange, accept }: FileInputProps) {
  return (
    <input
      type="file"
      accept={accept}
      onChange={onChange}
      className="text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
    />
  )
}

export default FileInput