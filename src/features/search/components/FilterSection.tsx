"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface FilterSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function FilterSection({
  title,
  defaultOpen = true,
  children,
}: FilterSectionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 font-medium text-sm hover:text-foreground/80 transition-colors">
        <span>{title}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
