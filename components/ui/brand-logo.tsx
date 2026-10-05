import Image from "next/image"

interface BrandLogoProps {
  /** Tamaño cuadrado del contenedor (p. ej. `size-9`). Define el recorte del logo. */
  className: string
  /** Carga prioritaria para la marca visible en el primer viewport (headers). */
  priority?: boolean
}

/**
 * Marca Tensi a partir de `/logo.svg`. El SVG original reserva ~30% de padding
 * transparente alrededor del arte y lo centra, así que se recorta con un
 * contenedor cuadrado `overflow-hidden` que escala la imagen (`scale-[2.49]` ≈
 * 1 / 0.40) para que el arte llene el contenedor. El wordmark "Tensi" se
 * renderiza aparte, junto al logo, porque su estilo cambia por superficie.
 */
export function BrandLogo({
  className,
  priority = false
}: Readonly<BrandLogoProps>) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={1024}
        height={1024}
        priority={priority}
        className="size-full scale-[2.49]"
      />
    </span>
  )
}
