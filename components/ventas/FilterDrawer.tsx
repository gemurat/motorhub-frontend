"use client"
import React, { useState } from "react"
import LazySelect from "./LazySelect"

type FilterVal = {
  id: number
  name: string | null
}

interface FilterDrawerProps {
  filterVal?: FilterVal[]
  label?: string
  placeholder?: string
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filterVal,
  label,
  placeholder,
}) => {
  const [selectedValue, setSelectedValue] = useState<FilterVal | null>(null)

  const handleSelect = (selected: FilterVal) => {
    setSelectedValue(selected)
    console.log("Selected value:", selected)
  }

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4">
      <LazySelect
        label={label}
        placeholder={placeholder}
        filterVal={filterVal}
        onSelect={handleSelect}
      />
    </div>
  )
}

export default FilterDrawer
