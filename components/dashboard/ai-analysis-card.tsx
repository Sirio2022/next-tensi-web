import { Bot, Sparkles } from "lucide-react"
import Link from "next/link"

/**
 * Tarjeta estática de "Análisis IA" del plan Free. Sin datos ni llamadas: los
 * valores (8/10, 65%, NORMAL) son de presentación. El copy del mockup se
 * corrige (sin `**` literales ni el typo `Premium:**`).
 */
export function AiAnalysisCard() {
  return (
    <section
      aria-labelledby="ai-analysis-title"
      className="space-y-5 rounded-3xl border border-blue-900/50 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-400">
            <Bot className="size-5" />
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
            <p className="mt-0.5 text-xs text-blue-400">~ 65% precisión</p>
          </div>
        </div>
        <span className="rounded-lg border border-blue-500/30 bg-blue-600/20 px-2.5 py-1 text-xs font-semibold text-blue-300">
          8/10 restantes
        </span>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs/relaxed text-slate-300">
        <p className="text-center font-medium text-slate-200">
          Presión arterial 120 sobre 80?
          <br />
          La OMS (Organización Mundial de la Salud) ha creado un sistema sin
          precedentes para identificar e informar aumento del tratamiento de la
          presión arterial.
        </p>

        <div className="space-y-1 text-center">
          <p className="text-slate-400">Declaración</p>
          <p className="font-semibold text-slate-100">
            Su presión arterial es:{" "}
            <span className="text-emerald-400">NORMAL</span>
          </p>
        </div>

        <p className="text-center">
          💡 <strong className="font-semibold">Acción recomendada:</strong>{" "}
          Mantén hábitos saludables y monitorea regularmente.
        </p>

        <div className="space-y-1 rounded-lg border border-blue-800/40 bg-blue-950/40 p-3 text-center leading-normal text-slate-300">
          <p>
            ✨ 📈 🚀{" "}
            <strong className="font-semibold">Upgrade a Premium:</strong>{" "}
            Análisis profundo con IA avanzada, detección de patrones complejos,
            predicciones personalizadas, recomendaciones específicas según tu
            historial. ¡Análisis ilimitados por solo $4.99/mes!
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400">Precisión del análisis IA:</span>
          <div className="flex w-1/2 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[65%] rounded-full bg-blue-500" />
            </div>
            <span className="text-[11px] text-slate-300">65%</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-linear-to-r from-blue-950/60 to-purple-950/60 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-400" />
            <span className="text-xs text-slate-300">
              Premium: análisis más profundos, patrones avanzados, predicciones
            </span>
          </div>
          <Link
            href="#upgrade"
            className="shrink-0 rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-purple-500"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </section>
  )
}
