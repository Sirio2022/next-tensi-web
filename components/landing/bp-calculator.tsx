"use client"

import type { BpCategory, BpVisualBucket } from "@/lib/bp/bp-categories"
import { useBpCalculator } from "@/lib/bp/hooks/use-bp-calculator"
import { ArrowDown, CircleCheck, Info, TriangleAlert } from "lucide-react"
import { useId } from "react"

const CATEGORY_LABELS: Record<BpCategory, string> = {
  optimal: "Presión Arterial Óptima",
  normal: "Presión Arterial Normal",
  high_normal: "Presión Arterial Normal-Alta",
  grade_1_hypertension: "Hipertensión Nivel 1",
  grade_2_hypertension: "Hipertensión Nivel 2",
  grade_3_hypertension: "Hipertensión Nivel 3",
  mild_hypotension: "Hipotensión Leve",
  moderate_hypotension: "Hipotensión Moderada",
  severe_hypotension: "Hipotensión Severa"
}

interface BucketStyle {
  label: string
  box: string
  icon: string
  tag: string
  title: string
}

const BUCKET_STYLES: Record<BpVisualBucket, BucketStyle> = {
  saludable: {
    label: "Saludable",
    box: "bg-emerald-500/10 border-emerald-500/30",
    icon: "bg-emerald-500/20 text-tone-emerald",
    tag: "bg-emerald-500/10 text-tone-emerald",
    title: "text-tone-emerald"
  },
  atencion: {
    label: "Atención",
    box: "bg-amber-500/10 border-amber-500/30",
    icon: "bg-amber-500/20 text-tone-amber",
    tag: "bg-amber-500/10 text-tone-amber",
    title: "text-tone-amber"
  },
  riesgo_moderado: {
    label: "Riesgo Moderado",
    box: "bg-orange-500/10 border-orange-500/30",
    icon: "bg-orange-500/20 text-tone-orange",
    tag: "bg-orange-500/10 text-tone-orange",
    title: "text-tone-orange"
  },
  consultar_medico: {
    label: "Consultar Médico",
    box: "bg-rose-500/10 border-rose-500/30",
    icon: "bg-rose-500/20 text-tone-rose",
    tag: "bg-rose-500/10 text-tone-rose",
    title: "text-tone-rose"
  },
  presion_baja: {
    label: "Presión Baja",
    box: "bg-sky-500/10 border-sky-500/30",
    icon: "bg-sky-500/20 text-tone-sky",
    tag: "bg-sky-500/10 text-tone-sky",
    title: "text-tone-sky"
  }
}

/** Icono por bucket; el color lo aporta el contenedor. */
function BucketIcon({ bucket }: Readonly<{ bucket: BpVisualBucket }>) {
  const className = "size-6"

  if (bucket === "saludable") {
    return <CircleCheck className={className} />
  }

  if (bucket === "presion_baja") {
    return <ArrowDown className={className} />
  }

  return <TriangleAlert className={className} />
}

const INPUT_CLASSES =
  "w-full bg-card border border-line-strong rounded-xl px-4 py-2.5 text-fg font-mono text-lg focus:outline-none focus:border-tensi-400 focus:ring-1 focus:ring-focus transition-colors"
const LABEL_CLASSES = "block text-xs font-semibold text-fg-muted mb-2"

/** Calculadora de presión de la landing: solo renderiza el estado del hook. */
export function BpCalculator() {
  const ids = { sys: useId(), dia: useId(), pulse: useId() }
  const { values, setSystolic, setDiastolic, setPulse, result } =
    useBpCalculator()

  const bucketStyle = result ? BUCKET_STYLES[result.bucket] : null

  return (
    <section id="simulador" className="scroll-mt-20 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-accent-text">
            Herramienta Interactiva
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-fg mt-1">
            Calculadora de Presión Arterial
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted mt-2">
            Ingresa tus valores para evaluar tu estado de salud en tiempo real.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card/70 backdrop-blur-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor={ids.sys} className={LABEL_CLASSES}>
                Sistólica (SYS mmHg)
              </label>
              <input
                id={ids.sys}
                type="number"
                inputMode="numeric"
                min={70}
                max={220}
                value={values.systolic}
                onChange={(event) => setSystolic(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
            <div>
              <label htmlFor={ids.dia} className={LABEL_CLASSES}>
                Diastólica (DIA mmHg)
              </label>
              <input
                id={ids.dia}
                type="number"
                inputMode="numeric"
                min={40}
                max={140}
                value={values.diastolic}
                onChange={(event) => setDiastolic(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
            <div>
              <label htmlFor={ids.pulse} className={LABEL_CLASSES}>
                Pulso (BPM)
              </label>
              <input
                id={ids.pulse}
                type="number"
                inputMode="numeric"
                min={40}
                max={180}
                value={values.pulse}
                onChange={(event) => setPulse(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
          </div>

          <div
            aria-live="polite"
            aria-atomic="true"
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3 ${
              bucketStyle ? bucketStyle.box : "bg-card/60 border-line"
            }`}
          >
            {result && bucketStyle ? (
              <>
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`size-10 shrink-0 rounded-lg flex items-center justify-center ${bucketStyle.icon}`}
                  >
                    <BucketIcon bucket={result.bucket} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-fg-muted">
                      Categoría estimada:
                    </div>
                    <div
                      className={`text-base/snug font-extrabold ${bucketStyle.title}`}
                    >
                      {CATEGORY_LABELS[result.category]}
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-mono font-bold px-3 py-1 rounded ${bucketStyle.tag}`}
                >
                  {bucketStyle.label}
                </span>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="size-10 shrink-0 rounded-lg bg-card-muted flex items-center justify-center text-fg-muted">
                  <Info className="size-6" />
                </div>
                <div>
                  <div className="text-xs text-fg-muted">
                    Categoría estimada:
                  </div>
                  <div className="text-base font-semibold text-fg-muted">
                    Ingresa tu sistólica y diastólica
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
