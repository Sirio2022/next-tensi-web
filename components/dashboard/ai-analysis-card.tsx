import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { formatPercent } from "@/lib/format/percent"
import type { AIInsight } from "@/lib/readings/types"
import { Bot, Crown, Sparkles } from "lucide-react"
import { AiInsightText } from "./ai-insight-text"

interface AiAnalysisCardProps {
  /** Análisis devuelto por el back tras guardar; ausente antes del primer submit. */
  analysis?: AIInsight
  /** Plan del usuario; en Premium se muestra el badge y se ocultan los CTAs de venta. */
  isPremium: boolean
}

/**
 * Tarjeta de "Análisis IA". Antes del primer submit muestra un estado vacío
 * explicativo; tras guardar renderiza el `insight`, la `confidence` y los
 * `patterns` reales del back. Si el back corta por cuota agotada, muestra su
 * `error` (y `usageCount`, si viene) con un CTA a Premium. Nunca inventa una
 * cuota "X/10".
 *
 * `isPremium` decide la presentación: en Premium se muestra un badge con
 * corona y se ocultan el banner y los CTAs de venta; en Free se conserva el
 * comportamiento original.
 */
export function AiAnalysisCard({
  analysis,
  isPremium
}: Readonly<AiAnalysisCardProps>) {
  const hasError = Boolean(analysis?.error)
  const hasInsight = Boolean(analysis?.insight) && !hasError
  const patterns = analysis?.patterns ?? []

  return (
    <section
      aria-labelledby="ai-analysis-title"
      className="space-y-5 rounded-3xl border border-blue-900/50 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-400">
            <Bot className="size-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="ai-analysis-title"
                className="text-sm font-semibold text-slate-100"
              >
                Análisis IA con OpenAI GPT-OSS
              </h2>
              <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                REAL
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              {isPremium ? (
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Crown className="size-3" aria-hidden />
                  PREMIUM
                </span>
              ) : null}
              <p className="text-xs text-blue-400">
                {hasInsight
                  ? `${formatPercent(analysis!.confidence)} de confianza`
                  : "Interpretación de tus valores"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
        {hasError ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-amber-400">
              {analysis!.error}
            </p>
            {typeof analysis!.usageCount === "number" ? (
              <p className="text-xs text-slate-400">
                Análisis IA usados en este ciclo: {analysis!.usageCount}
              </p>
            ) : null}
            {isPremium ? null : (
              <ButtonLink href="/dashboard#upgrade" tone="amber" size="sm">
                Mejorar a Premium
              </ButtonLink>
            )}
          </div>
        ) : hasInsight ? (
          <AiInsightText
            text={analysis!.insight}
            className="space-y-3 text-xs/relaxed text-slate-300"
          />
        ) : (
          <p className="py-2 text-center text-xs/relaxed text-slate-400">
            Aún no hay análisis. Registra tu primera medición para que la IA
            interprete tus valores y detecte patrones.
          </p>
        )}
      </div>

      {patterns.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            Patrones detectados:
          </span>
          {patterns.map((pattern) => (
            <Badge key={pattern} tone="sky">
              {pattern}
            </Badge>
          ))}
        </div>
      ) : null}

      {hasInsight ? (
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400">Precisión del análisis IA:</span>
          <div className="flex w-1/2 items-center gap-2">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: formatPercent(analysis!.confidence) }}
              />
            </div>
            <span className="text-[11px] text-slate-300">
              {formatPercent(analysis!.confidence)}
            </span>
          </div>
        </div>
      ) : null}

      {isPremium ? null : (
        <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-linear-to-r from-blue-950/60 to-purple-950/60 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-400" aria-hidden />
            <span className="text-xs text-slate-300">
              Premium: análisis más profundos, patrones avanzados, predicciones
            </span>
          </div>
          <ButtonLink
            href="/dashboard#upgrade"
            tone="primary"
            size="sm"
            className="shrink-0 bg-purple-600 shadow-purple-600/25 hover:bg-purple-500"
          >
            Upgrade
          </ButtonLink>
        </div>
      )}
    </section>
  )
}
