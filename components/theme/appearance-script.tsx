import { APPEARANCE_COOKIE } from "@/lib/theme/core/appearance"

/**
 * Script anti-FOUC de apariencia (SPEC 21).
 *
 * Lee la cookie `tensi_appearance`, la decodifica y escribe en `<html>` solo
 * los atributos que difieren del default del CSS. Sin cookie no toca nada, de
 * modo que landing y auth siguen `prefers-color-scheme`.
 *
 * Se usa un `<script>` plano en lugar de `next/script` con
 * `strategy="beforeInteractive"`: Next encola los scripts inline y los ejecuta
 * desde `app-bootstrap.js` (async) después del primer pintado, lo que produce
 * FOUC. Un script síncrono en el HTML inicial se ejecuta durante el parseo,
 * antes de pintar el contenido. El contenido es estático (no interpola datos
 * de usuario), así que encaja con la CSP actual
 * (`script-src 'self' 'unsafe-inline'`).
 *
 * La lógica debe mantenerse alineada con `parseAppearanceCookie` y
 * `toAppearanceAttributes`.
 */
const APPEARANCE_SCRIPT = `(function () {
  try {
    var cookies = document.cookie ? document.cookie.split("; ") : [];
    var raw = null;
    for (var i = 0; i < cookies.length; i++) {
      var item = cookies[i];
      var equals = item.indexOf("=");
      if (equals > -1 && item.slice(0, equals) === "${APPEARANCE_COOKIE}") {
        raw = item.slice(equals + 1);
        break;
      }
    }
    if (!raw) return;

    try {
      raw = decodeURIComponent(raw);
    } catch (error) {
      /* Cookie mal codificada: se parsea tal cual. */
    }

    var values = {};
    var pairs = raw.split("&");
    for (var j = 0; j < pairs.length; j++) {
      var pair = pairs[j];
      var index = pair.indexOf("=");
      if (index < 1) continue;
      values[pair.slice(0, index)] = pair.slice(index + 1);
    }

    var root = document.documentElement;
    if (values.theme === "light" || values.theme === "dark") {
      root.setAttribute("data-theme", values.theme);
    }
    if (
      values.accent === "green" ||
      values.accent === "purple" ||
      values.accent === "red"
    ) {
      root.setAttribute("data-accent", values.accent);
    }
    if (values.contrast === "high") {
      root.setAttribute("data-contrast", "high");
    }
    if (values.motion === "reduced") {
      root.setAttribute("data-motion", "reduced");
    }
    if (values.density === "compact") {
      root.setAttribute("data-density", "compact");
    }
  } catch (error) {
    /* La apariencia es cosmética: ante cualquier fallo se usa el default. */
  }
})();`

/**
 * Monta el script en el HTML inicial. Debe ser el primer hijo de `<body>` para
 * que el navegador lo ejecute antes de parsear y pintar el resto del documento.
 */
export function AppearanceScript() {
  return (
    <script
      id="tensi-appearance-script"
      // Contenido estático de confianza: no hay HTML de usuario (SPEC 09).
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }}
    />
  )
}
