import {
  buttonClasses,
  type ButtonSize,
  type ButtonTone
} from "@/components/ui/button"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  tone?: ButtonTone
  size?: ButtonSize
  className?: string
  children: ReactNode
}

/**
 * Variante de `Button` que navega: comparte sus clases y renderiza `next/link`,
 * de modo que un CTA de enlace se ve igual que un botón nativo.
 */
export function ButtonLink({
  tone = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: Readonly<ButtonLinkProps>) {
  return (
    <Link className={buttonClasses({ tone, size, className })} {...rest}>
      {children}
    </Link>
  )
}
