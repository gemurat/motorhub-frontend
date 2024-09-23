"use client"
import { Select, SelectItem } from "@nextui-org/react"

type filterVal = {
  id: number
  name: string
}

export default function FilterDrawer({
  filterVal,
  label,
  placeholder,
}: {
  label?: string
  placeholder?: string
  filterVal?: filterVal[]
}) {
  return (
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
      <Select
        label={label ?? "label"}
        placeholder={placeholder ?? "placeholder"}
        className="max-w-xs min-w-60"
      >
        {(filterVal || []).map((val) => (
          <SelectItem key={val.id}>
            {val.name ? val.name : "NO DATA"}
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
