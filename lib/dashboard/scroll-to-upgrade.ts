/**
 * Desplaza el viewport al banner de upgrade (`#upgrade`). Lo consumen el botón
 * "Mejorar Plan" del header y los ítems bloqueados del sidebar.
 */
export function scrollToUpgradeBanner(): void {
  document
    .getElementById("upgrade")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}
