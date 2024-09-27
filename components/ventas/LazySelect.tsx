import React, { useState, useEffect, useRef } from "react"

type FilterVal = {
  id: number
  name: string | null
}

interface LazySelectProps {
  filterVal?: FilterVal[]
  label?: string
  placeholder?: string
  onSelect: (selected: FilterVal) => void
}

const LazySelect: React.FC<LazySelectProps> = ({
  filterVal = [],
  label,
  placeholder,
  onSelect,
}) => {
  const [options, setOptions] = useState<FilterVal[]>(filterVal)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true)
      // Simulate an API call
      setTimeout(() => {
        const filteredOptions = filterVal.filter((option) =>
          (option.name ?? "").toLowerCase().includes(inputValue.toLowerCase())
        )
        setOptions(filteredOptions)
        setIsLoading(false)
      }, 500)
    } else {
      setOptions(filterVal)
    }
  }, [inputValue, filterVal])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const handleSelect = (option: FilterVal) => {
    setInputValue(option.name ?? "")
    onSelect(option)
    setShowDropdown(false)
  }

  return (
    <div className="relative inline-block w-52" ref={dropdownRef}>
      {label && (
        <label className="block text-left mb-2 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
        />
        {isLoading && (
          <div className="mt-2 text-gray-700 dark:text-gray-300">
            Loading...
          </div>
        )}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 max-h-52 overflow-y-auto border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 rounded shadow-lg z-10">
            {options.map((option) => (
              <div
                key={option.id}
                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LazySelect
