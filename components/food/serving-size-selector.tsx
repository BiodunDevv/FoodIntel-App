"use client"

interface ServingSizeSelectorProps {
  value: number
  onChange: (value: number) => void
}

const OPTIONS = [100, 150, 200, 250, 300, 400, 500]

export function ServingSizeSelector({ value, onChange }: ServingSizeSelectorProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Serving size
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}g
          </option>
        ))}
      </select>
    </div>
  )
}
