import Link from "next/link"
import type { ComponentProps } from "react"

type AppLinkProps = ComponentProps<typeof Link>

/**
 * Adaptador de navegación de las vistas portables (SPEC 17).
 *
 * Envuelve `next/link` para que los componentes reutilizables por la futura app
 * Expo no dependan de Next directamente: el único punto de acoplamiento con el
 * enrutador web vive aquí. Reenvía todas las props de `next/link` (`href`,
 * `className`, `children` y el resto) sin alterar su comportamiento.
 *
 * Úsalo en las vistas clientes que deban poder portarse a DOM components en
 * lugar de importar `next/link`. Los enlaces de la capa web no portable pueden
 * seguir usando `next/link` mientras se migra cada dominio de forma incremental.
 */
export function AppLink({
  href,
  className,
  children,
  ...rest
}: Readonly<AppLinkProps>) {
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  )
}
