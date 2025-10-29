"use client"

import type * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva("text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 leading-none")

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  return <LabelPrimitive.Root data-slot="label" className={cn(labelVariants(), className)} {...props} />
}

export { Label }
