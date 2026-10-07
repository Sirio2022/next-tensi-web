/**
 * Catálogo de presentación de los medicamentos para hipertensión que muestra
 * el selector de perfil, agrupados por familia. Refleja el mockup
 * `references/dashboard/03-profile` (5 grupos, 24 fármacos); se omite el grupo
 * vacío "Vasodilatadores" porque no aporta ninguna opción seleccionable.
 */

export interface MedicationGroup {
  id: string
  label: string
  medications: readonly string[]
}

export const MEDICATION_GROUPS: readonly MedicationGroup[] = [
  {
    id: "diuretics",
    label: "Diuréticos",
    medications: [
      "Hidroclorotiazida",
      "Furosemida",
      "Clortalidona",
      "Espironolactona"
    ]
  },
  {
    id: "beta-blockers",
    label: "Betabloqueadores",
    medications: [
      "Atenolol",
      "Metoprolol",
      "Carvedilol",
      "Bisoprolol",
      "Propranolol"
    ]
  },
  {
    id: "ace-inhibitors",
    label: "IECA (Inhibidores ECA)",
    medications: [
      "Enalapril",
      "Lisinopril",
      "Ramipril",
      "Captopril",
      "Perindopril"
    ]
  },
  {
    id: "arb-blockers",
    label: "ARA-II (Antagonistas de Angiotensina II)",
    medications: [
      "Losartán",
      "Valsartán",
      "Irbesartán",
      "Candesartán",
      "Telmisartán"
    ]
  },
  {
    id: "calcium-antagonists",
    label: "Calcioantagonistas",
    medications: [
      "Amlodipino",
      "Nifedipino",
      "Diltiazem",
      "Verapamilo",
      "Felodipino"
    ]
  }
]
