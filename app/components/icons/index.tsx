import { type SVGProps } from "react"
import spriteHref from "./icon.svg"
import type { iconNames } from "./icons.json"
import { extendTailwindMerge } from 'tailwind-merge'

import { type ClassValue, clsx } from "clsx"

type IconName = keyof typeof iconNames

const sizeClassName = {
	font: 'w-[1em] h-[1em]',
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
	xl: 'w-7 h-7',
} as const

type Size = keyof typeof sizeClassName

const childrenSizeClassName = {
	font: 'gap-1',
	xs: 'gap-1',
	sm: 'gap-1',
	md: 'gap-2',
	lg: 'gap-2',
	xl: 'gap-3',
} satisfies Record<Size, string>

const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function IconSimple({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName
  className?: string
}) {
  return (
    <svg 
		className={cn(className, "w-6 h-6")}
		{...props}
	>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  )
}

export function Icon({
	name,
	size = 'font',
	className,
	children,
	...props
}: SVGProps<SVGSVGElement> & {
	name: IconName
	size?: Size
}) {
	if (children) {
		return (
			<span className={`inline-flex ${childrenSizeClassName[size]}`}>
				<Icon name={name} size={size} className={className} {...props} />
				{children}
			</span>
		)
	}
	return (
		<svg
			{...props}
			className={cn(sizeClassName[size], 'inline self-center', className)}
		>
			<use href={`${spriteHref}#${name}`} />
		</svg>
	)
}

/*
// preload:
import iconHref from "~/components/icons/icon.svg"
export const links: LinksFunction = () => {
  return [
    {
      rel: "preload",
      href: iconHref,
      as: "image",
      type: "image/svg+xml",
    },
  ]
}

// to use
import { Icon } from '~/components/icons'

<Icon name="wrench" className="w-5 h-5" />
*/

/*
import { type SVGProps } from 'react'
import { cn } from 'tailwind.config.ts'
import href from './icon.svg'
import type {iconNames} from './icons.json'
type IconName = keyof typeof iconNames

const sizeClassName = {
	font: 'w-[1em] h-[1em]',
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
	xl: 'w-7 h-7',
} as const

type Size = keyof typeof sizeClassName

const childrenSizeClassName = {
	font: 'gap-1',
	xs: 'gap-1',
	sm: 'gap-1',
	md: 'gap-2',
	lg: 'gap-2',
	xl: 'gap-3',
} satisfies Record<Size, string>

export function Icon({
	name,
	size = 'font',
	className,
	children,
	...props
}: SVGProps<SVGSVGElement> & {
	name: IconName
	size?: Size
}) {
	if (children) {
		return (
			<span className={`inline-flex ${childrenSizeClassName[size]}`}>
				<Icon name={name} size={size} className={className} {...props} />
				{children}
			</span>
		)
	}
	return (
		<svg
			{...props}
			className={cn(sizeClassName[size], 'inline self-center', className)}
		>
			<use href={`${href}#${name}`} />
		</svg>
	)
}
*/