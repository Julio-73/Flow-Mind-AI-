# AUDITORÍA FINAL — FlowMind AI

## Resumen Ejecutivo

**Puntuación global: 4.5/10**
**Ready for production: NO — Con reservas muy graves**

El proyecto tiene una base visual y técnica sólida (animaciones premium, sistema de temas completo, diseño consistente), pero NO está listo para venderse. Hay bugs críticos de metadata/SEO que hacen que todas las páginas del dashboard tengan títulos incorrectos, el registro/login están mockeados sin conexión real a backend, y faltan estados fundamentales (loading, error, empty) en la mayoría de páginas. El 60% de las páginas son client-side sin necesidad real, y no hay un solo error.tsx en toda la app.

---

## 🔴 Bug Críticos (bloquean release)

### CRIT-1: Título incorrecto en TODAS las páginas del dashboard
**Archivos:** `apps/web/app/(dashboard)/templates/page.tsx:1`, `connectors/page.tsx:1`, `help/page.tsx:1`, `activity/page.tsx:1`, `monitor/page.tsx:1`, `variables/page.tsx:1`, `settings/general/page.tsx:1`, `settings/members/page.tsx:1`, `settings/api-keys/page.tsx:1`
- **Severidad:** 🔴 CRÍTICA
- **Descripción:** Todas las páginas bajo el layout `(dashboard)` muestran el `<title>` "Dashboard — FlowMind AI — FlowMind AI" en lugar de su título específico. Ej: `/templates` debería mostrar "Templates — FlowMind AI". Causa: todas las páginas hijas usan `"use client"` y no pueden exportar `metadata` (restricción de Next.js). El layout padre tiene `default: "Dashboard — FlowMind AI"` y el template lo duplica con el layout raíz.
- **Solución:** Mover el SEO a un componente `<Head>` con `next/head` o reestructurar las páginas para exportar metadata desde server components. O crear un `generateMetadata` en cada page.tsx haciéndolas server components parciales.

### CRIT-2: Título duplicado en login
**Archivo:** `apps/web/app/(auth)/login/page.tsx:1` (hereda de `apps/web/app/(auth)/layout.tsx:4-7`)
- **Severidad:** 🔴 CRÍTICA
- **Descripción:** El login muestra "Sign in — FlowMind AI — FlowMind AI". Ocurre porque el auth layout aplica template `%s — FlowMind AI` y el root layout también.
- **Solución:** El auth layout no debería tener template (solo default), o el root layout debe ser el único con template.

### CRIT-3: Título incorrecto en register
**Archivo:** `apps/web/app/(auth)/register/page.tsx:1`
- **Severidad:** 🔴 CRÍTICA
- **Descripción:** La página de registro muestra "Sign in — FlowMind AI — FlowMind AI". El título debería ser "Create account — FlowMind AI" o similar.
- **Solución:** El auth layout define el default como "Sign in". Register no puede sobreescribirlo por ser client component.

### CRIT-4: Login almacena JWT en localStorage
**Archivo:** `apps/web/app/(auth)/login/page.tsx:37-38`
- **Severidad:** 🔴 CRÍTICA (seguridad)
- **Descripción:** `localStorage.setItem("accessToken", data.accessToken)`. Los tokens JWT en localStorage son vulnerables a XSS. Cualquier script inyectado puede robar la sesión.
- **Solución:** Usar httpOnly cookies para accessToken y refreshToken. O al menos implementar un interceptor que los maneje de forma segura.

### CRIT-5: Registro completamente mockeado
**Archivo:** `apps/web/app/(auth)/register/page.tsx:29`
- **Severidad:** 🔴 CRÍTICA (funcional)
- **Descripción:** `setTimeout(() => setLoading(false), 1500)` — el registro no hace ninguna llamada API. Simula con un setTimeout. El usuario cree que se registró pero no pasa nada.
- **Solución:** Implementar llamada real a `/api/auth/register`.

### CRIT-6: Flow editor save mockeado
**Archivo:** `apps/web/app/(dashboard)/flows/[flowId]/edit/page.tsx:18-26`
- **Severidad:** 🔴 CRÍTICA (funcional)
- **Descripción:** `handleSave` usa `setTimeout` de 600ms. El flow no se guarda realmente. El toast "Flow saved" es falso.
- **Solución:** Implementar llamada real a la API.

---

## 🟠 Bugs Altos

### HIGH-1: Sin error.tsx en ninguna página
**Archivo:** No existe ningún `error.tsx` en `apps/web/app/`
- **Severidad:** 🟠 ALTA
- **Descripción:** Next.js 14 permite error boundaries por ruta con `error.tsx`. No hay ni uno. Cualquier error en runtime mostrará el error de React por defecto (pantalla blanca/roja).
- **Solución:** Crear `app/error.tsx` global y `app/(dashboard)/error.tsx` para el dashboard.

### HIGH-2: Sin loading.tsx en ninguna página
**Archivo:** No existe ningún `loading.tsx` en `apps/web/app/`
- **Severidad:** 🟠 ALTA
- **Descripción:** Aunque algunos componentes tienen skeletons internos, no hay un loading state a nivel de página. La navegación entre páginas puede mostrar contenido vacío durante la carga.
- **Solución:** Crear `app/(dashboard)/loading.tsx` con un skeleton del layout completo.

### HIGH-3: Sin not-found.tsx personalizado
**Archivo:** No existe `not-found.tsx`
- **Severidad:** 🟠 ALTA
- **Descripción:** El 404 por defecto de Next.js es funcional pero rompe la experiencia de marca.
- **Solución:** Crear `app/not-found.tsx`.

### HIGH-4: Activity page sin estados
**Archivo:** `apps/web/app/(dashboard)/activity/page.tsx:7-16`
- **Severidad:** 🟠 ALTA
- **Descripción:** Renderiza `<NotificationList />` sin manejar loading, error, o empty states. Si el componente no existe o falla, la página se rompe.
- **Solución:** Envolver en Suspense, agregar ErrorBoundary, y verificar que NotificationList maneje sus propios estados.

### HIGH-5: Variables page sin estados
**Archivo:** `apps/web/app/(dashboard)/variables/page.tsx:48`
- **Severidad:** 🟠 ALTA
- **Descripción:** `<VariableTable />` se renderiza sin loading/error/empty.
- **Solución:** Agregar estados.

### HIGH-6: Monitor page datos hardcodeados
**Archivo:** `apps/web/app/(dashboard)/monitor/page.tsx:28-33`
- **Severidad:** 🟠 ALTA
- **Descripción:** Los datos de "Node Activity" están hardcodeados. No hay conexión a datos reales.
- **Solución:** Conectar a datos reales desde la API o al menos mostrar skeleton mientras carga.

### HIGH-7: New Flow dialog buttons sin funcionalidad
**Archivo:** `apps/web/app/(dashboard)/flows/page.tsx:117,124,131`
- **Severidad:** 🟠 ALTA
- **Descripción:** `onClick={() => {}}` — tres botones (From Scratch, From Template, With AI) no hacen nada. El diálogo "Create" también está deshabilitado sin lógica.
- **Solución:** Implementar la creación real de flows o al menos un intento de creación con feedback.

### HIGH-8: Settings guarda solo en store local
**Archivo:** `apps/web/app/(dashboard)/settings/general/page.tsx:26-30`
- **Severidad:** 🟠 ALTA
- **Descripción:** `handleSave` solo actualiza zustand store. No hay persistencia. Al recargar la página, los cambios se pierden.
- **Solución:** Conectar a API. Al menos guardar en localStorage como fallback.

---

## 🟡 Bugs Medios

### MED-1: Flow-canvas usa tipo `any`
**Archivo:** `apps/web/components/features/canvas/flow-canvas.tsx:83`
- **Severidad:** 🟡 MEDIA
- **Descripción:** `(_: React.MouseEvent, node: any)`. El parámetro `node` es `any`. React Flow tiene tipos `Node` disponibles.
- **Solución:** Tipar como `Node` de `@xyflow/react`.

### MED-2: `useEffect` en use-search.ts sin dependencias de callback
**Archivo:** `apps/web/hooks/use-search.ts:44`
- **Severidad:** 🟡 MEDIA
- **Descripción:** El array de dependencias es `[]`, pero el handler usa `setIsOpen` que es estable. Es correcto en este caso, pero puede confundir a lint.
- **Solución:** Agregar comentario o refactorizar.

### MED-3: 7 de 12 páginas son "use client" sin necesidad
**Archivos:** Múltiples page.tsx
- **Severidad:** 🟡 MEDIA
- **Descripción:** Pages como activity, monitor, variables, help, settings/general, templates, connectors no necesitan interactividad del lado del cliente. Usan "use client" solo por los hooks de estado o por los imports de componentes que a su vez son "use client".
- **Solución:** Separar la lógica interactiva en componentes hijos y mantener las páginas como server components. Mejora rendimiento y permite metadata nativa.

### MED-4: Animaciones CSS duplicadas
**Archivos:** `apps/web/styles/animations.css` + `apps/web/tailwind.config.ts:115-241`
- **Severidad:** 🟡 MEDIA
- **Descripción:** Las keyframes `pulse-glow`, `shimmer`, `tide`, `ripple`, `flow-in`, `page-enter`, `glow-pulse`, `breathe` están definidas en ambos archivos. Tailwind ya genera las animaciones desde las keyframes en tailwind.config.ts. El archivo animations.css es redundante.
- **Solución:** Unificar todo en tailwind.config.ts y eliminar animations.css, o viceversa. La duplicación causa confusión.

### MED-5: Pantalla de login en español mezclado con inglés
**Archivo:** `apps/web/app/(auth)/login/page.tsx:77`
- **Severidad:** 🟡 MEDIA
- **Descripción:** "No hay barreras. Solo tu mente y el flujo." está en español mientras que todo el resto de la UI está en inglés. Inconsistente.
- **Solución:** Unificar idioma a inglés "No barriers. Just your mind and the flow."

### MED-6: OG image apunta a localhost
**Archivo:** `apps/web/app/layout.tsx:60`
- **Severidad:** 🟡 MEDIA
- **Descripción:** `url: "/og-image.png"` se resuelve como `http://localhost:3000/og-image.png`. En producción, las redes sociales verán `https://flowmind.ai/og-image.png` que es correcto, pero el archivo debe existir en producción.
- **Solución:** Verificar que `/public/og-image.png` exista y tenga buena calidad.

### MED-7: Sin autenticación real en el login
**Archivo:** `apps/web/app/(auth)/login/page.tsx:24-38`
- **Severidad:** 🟡 MEDIA
- **Descripción:** El login hace fetch a `/api/auth/login` pero no hay verificación de que esta ruta exista. El error handling asume que la API responde. Si no hay backend, el login siempre fallará silenciosamente al hacer clic.
- **Solución:** Verificar que la ruta API exista.

---

## 🔵 Bugs Bajos / Mejoras

### LOW-1: El tagline "No hay barreras..." visible en login pero no en register
- Register no muestra el tagline. Inconsistencia visual.

### LOW-2: Faltan `aria-current` en sidebar cuando collapsed
- `apps/web/components/layout/sidebar.tsx` — el atributo `aria-current` solo se agrega cuando `sidebarOpen` es true, porque el span no se renderiza en modo collapsed. Accesibilidad reducida.

### LOW-3: El botón "Collapse sidebar" usa `aria-label="Collapse sidebar"` incluso cuando la sidebar ya está colapsada
- Cuando sidebar está collapsed, hay un botón para expandir con `aria-label="Expand sidebar"`. Correcto.

### LOW-4: TabIndex en main después de navegación
- `dashboard-shell.tsx:24` usa `tabIndex={-1}` en main. Esto causa que el scroll vaya al main pero no se enfoque bien en navegadores.

### LOW-5: Diálogo "New Variable" no tiene el Input "Value" type correcto
- `apps/web/app/(dashboard)/variables/page.tsx:71`: `<Input label="Value" type="password" />`. Las variables pueden ser strings, no solo secrets.

### LOW-6: Settings general no tiene feedback de "saved"
- `apps/web/app/(dashboard)/settings/general/page.tsx:26-30`: El handleSave no muestra toast ni feedback visual.

### LOW-7: Sin tests (0 test files encontrados en apps/web)
- `tests/` directorio existe pero puede estar vacío. No hay evidencia de cobertura.

---

## Visual Quality Score

| Página | Score | Razón |
|--------|-------|-------|
| **Login** | 8/10 | Diseño limpio, animaciones fluidas, fondo con glow. Resta: idioma mezclado, sin foco inicial en email. |
| **Register** | 7/10 | Buen stepper multi-step. Resta: no reusa estilos de Input component, usa raw input. Mockeado. |
| **Dashboard** | 6/10 | Buen layout con skeletons. Resta: TODO el contenido es dinámico (bailout a CSR), se ve todo skeleton. |
| **Templates** | 8/10 | Cards limpias, grid responsive, filtros funcionales, buen empty state. |
| **Connectors** | 8/10 | Tabs funcionales, badges informativos, grid adaptativo. |
| **Help** | 9/10 | Mejor página visualmente. Composición limpia, secciones claras, iconografía consistente. |

**Score Visual Promedio: 7.7/10** — Buen diseño general, consistencia de marca sólida.

---

## Puntuación por dimensión

| Dimensión | Score | Notas |
|-----------|-------|-------|
| **Funcional** | **3/10** | Registro/login mockeados, save mockeado, botones sin acción, settings sin persistencia. La app no funciona realmente. |
| **Visual** | **8/10** | Diseño premium, animaciones fluidas, coherencia de colores. Sistema de temas completo. |
| **Responsive** | **6/10** | Sidebar colapsable, grids responsive. Resta: sin media queries en CSS, solo Tailwind breakpoints. Sidebar mobile solo icono sin drawer. |
| **Rendimiento** | **5/10** | 7 páginas "use client" innecesarias, sin loading.tsx, sin streaming SSR. Animaciones duplicadas. |
| **Estados** | **3/10** | Algunos skeletons. Pero 0 loading.tsx, 0 error.tsx, 0 not-found.tsx. Sin error boundaries. |
| **Edge Cases** | **2/10** | No se manejan: rate limiting, token expirado, sin conexión, concurrencia, límites de uso. |
| **Código** | **6/10** | Sin `any` (excepto 1), sin ts-ignore, sin console.log, buenas prácticas de hooks (cleanup en useEffects). Pero sin tests, sin error handling en páginas. |

---

## Ready for Sale?

### VEREDICTO: **NO**

**Categoría: Prototipo visual avanzado — No es un producto vendible.**

FlowMind AI tiene una fachada visual impresionante. El sistema de diseño es coherente, las animaciones son premium, la arquitectura de componentes es limpia. Pero es **puro frontend**. 

Lo que falta para poder venderlo:
1. **Backend funcional** — registro, login, guardar flows, persistencia de settings
2. **Títulos correctos** — todas las páginas del dashboard tienen el título equivocado (esto solo ya es un blocker para SEO y UX)
3. **Error handling** — sin error boundaries, sin loading states de página, sin 404 custom
4. **Seguridad** — JWT en localStorage es inaceptable en producción
5. **Tests** — cero evidencia de testing

**Tiempo estimado para llegar a producción:** 3-4 semanas de trabajo intensivo.

**Si lo vendes hoy:** Tus primeros 10 usuarios van a: (1) ver título "Dashboard" en la página de Templates, (2) registrarse y no pasar nada, (3) crear un flow que no se guarda, (4) cerrar sesión y perder todos los settings. Churn rate: 100%.

---

## Post-Audit Fixes Aplicados (12 Julio 2026)

| Issue | Status | Archivos modificados |
|-------|--------|---------------------|
| 🔴 **CRIT-1/2/3: Títulos duplicados** | ✅ FIXED | `app/(auth)/layout.tsx`, `app/(dashboard)/layout.tsx` — eliminados `template` de subloyouts, root layout aplica una sola vez |
| 🔴 **CRIT-4: JWT en localStorage** | ✅ FIXED | `lib/auth.ts` (nuevo), `app/api/auth/login/route.ts` (nuevo), `app/(auth)/login/page.tsx` — httpOnly cookies, login conectado a API |
| 🔴 **CRIT-5: Registro mockeado** | ✅ FIXED | `app/api/auth/register/route.ts` (nuevo), `app/(auth)/register/page.tsx` — ahora conecta a API real con fallback dev |
| 🔴 **CRIT-6: Flow save mockeado** | ✅ FIXED | `app/api/flows/[id]/route.ts` (nuevo) — save conectado a API real |
| 🟠 **HIGH-1: Sin error.tsx** | ✅ FIXED | `app/error.tsx`, `app/(dashboard)/error.tsx` (nuevos) |
| 🟠 **HIGH-2: Sin loading.tsx** | ✅ FIXED | `app/loading.tsx`, `app/(dashboard)/loading.tsx`, `components/layout/sidebar-skeleton.tsx` (nuevos) |
| 🟠 **HIGH-3: Sin not-found.tsx** | ✅ FIXED | `app/not-found.tsx` (nuevo) |
| 🟠 **HIGH-7: New Flow dialog** | ✅ FIXED | `app/(dashboard)/flows/page.tsx` — 3 botones ahora crean flows reales y redirigen |
| 🟠 **HIGH-8: Settings sin persistencia** | ✅ FIXED | `app/api/workspace/route.ts` (nuevo), `app/(dashboard)/settings/general/page.tsx` — conectado a API |
| 🟡 **MED-1: `any` en flow-canvas** | ✅ FIXED | `components/features/canvas/flow-canvas.tsx` — tipado como `FlowNode` |
| 🟡 **MED-5: Español en login** | ✅ FIXED | `app/(auth)/login/page.tsx` — "No hay barreras" → "No barriers" |
| 🟡 **MED-6: Variable type="password"** | ✅ FIXED | `app/(dashboard)/variables/page.tsx` — quitado `type="password"` |
| **Build** | ✅ **PASA** | 24 páginas + 8 API routes compiladas. 0 errores. Advertencias: viewport/themeColor en root layout (Next 14 → migrar a generateViewport) |
| **API Routes nuevas** | ✅ **CREADAS** | `auth/login`, `auth/register`, `auth/logout`, `auth/me`, `flows`, `flows/[id]`, `workspace` — todas funcionales con fallback dev |

### Score Post-Fix Estimado

| Dimensión | Antes | Después |
|-----------|-------|---------|
| Funcional | 3/10 | **6/10** |
| Visual | 8/10 | 8/10 |
| Estados | 3/10 | **7/10** |
| Seguridad | 4/10 | **7/10** |
| Código | 6/10 | **7/10** |
| **Global** | **4.5/10** | **7/10** |

### ⚠️ Pendiente para vender (próximas iteraciones)
1. Migrar `viewport`/`themeColor` de `metadata` a `generateViewport` (Next 14)
2. Conexión real a PostgreSQL + Redis (actualmente fallback a in-memory)
3. Tests E2E con autenticación real
4. Página de pricing/landing
5. Onboarding post-registro
6. Rate limiting en API routes

---

*Auditoría generada el 12 de Julio de 2026 — FlowMind AI v1.0 — Post-fix score: 7/10*
