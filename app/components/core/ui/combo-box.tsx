import * as React from "react"
import { Icon } from '~/components/icons'
import { Button } from "~/components/core/ui/button"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/Command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover"

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export function Combobox({options, value, setValue}: any) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option: any) => option.value === value)?.label
            : "Select framework..."}
          <Icon name="chevrons-up-down" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No match found.</CommandEmpty>
          <CommandGroup>
            {options.map((option: any) => (
              <CommandItem
                key={options.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <Icon name="check"
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


/*
const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

const [value, setValue] = React.useState("")
<Combobox 
    options={frameworks} 
    value={value}
    setValue={setValue}    
/>
*/