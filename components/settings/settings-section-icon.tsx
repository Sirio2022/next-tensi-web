import type { SettingsIconId } from "@/lib/settings/core/sections"
import {
  Bell,
  Crown,
  Palette,
  Shield,
  SlidersHorizontal,
  User,
  type LucideIcon
} from "lucide-react"

const ICON_COMPONENTS: Record<SettingsIconId, LucideIcon> = {
  user: User,
  bell: Bell,
  palette: Palette,
  shield: Shield,
  crown: Crown,
  sliders: SlidersHorizontal
}

interface SettingsSectionIconProps {
  id: SettingsIconId
  className?: string
}

/**
 * Resuelve un `SettingsIconId` del núcleo portable a su icono de Lucide (SPEC
 * 18). Lo comparten el sub-sidebar y los placeholders "Disponible próximamente".
 * El tamaño/color se controla por `className`.
 */
export function SettingsSectionIcon({
  id,
  className
}: Readonly<SettingsSectionIconProps>) {
  const Icon = ICON_COMPONENTS[id]

  return <Icon className={className} aria-hidden />
}
