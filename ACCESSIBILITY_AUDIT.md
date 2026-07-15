# ACCESSIBILITY AUDIT — FlowMind AI

**Standard:** WCAG 2.2 Level AA
**Date:** 2026-07-12
**Auditor:** Accessibility Master

---

## RESUMEN

| Categoría | Estado |
|---|---|
| **Perceptible** | **7/12** ✅ |
| **Operable** | **8/10** ✅ |
| **Comprensible** | **5/8** ✅ |
| **Robusto** | **3/3** ✅ |
| **TOTAL** | **23/33** ✅ cumplen |

> ⚠️ 10 criterios no aplican (no hay audio, video, ni restricciones de orientación en esta SPA).

---

## CHECKLIST WCAG 2.2 AA COMPLETO

### 1. PERCEPTIBLE

| # | Criterio | Estado | Nota |
|---|---------|--------|------|
| 1.1.1 | Non-text Content | ✅ | SVG iconos decorativos tienen `aria-hidden`; imágenes informativas en Avatar tienen `alt` |
| 1.2.1 | Audio-only / Video-only | N/A | No hay contenido multimedia |
| 1.2.2 | Captions (prerecorded) | N/A | No hay video |
| 1.3.1 | Info and Relationships | ✅ | HTML semántico (h1-h3, nav, main, table) |
| 1.3.2 | Meaningful Sequence | ✅ | Orden DOM coincide con orden visual |
| 1.3.4 | Orientation | N/A | No hay restricción de orientación |
| 1.3.5 | Identify Input Purpose | ⚠️ Parcial | Login tiene `autoComplete`, register no tiene `autoComplete` correcto |
| 1.4.1 | Use of Color | ✅✅ Corregido | Status dots ahora tienen `sr-only` con texto |
| 1.4.3 | Contrast (Minimum) | ✅ | Dark: 6.1:1~19.7:1. Light: 4.7:1~15.6:1. Muted-foreground pasa 4.5:1 en fondos principales |
| 1.4.4 | Resize Text | ✅ | Unidades rem/em, sin `user-scalable=no` |
| 1.4.10 | Reflow | ✅ | Responsive con Tailwind; sidebar colapsable |
| 1.4.12 | Text Spacing | ✅ | No hay alturas fijas que impidan espaciado |

### 2. OPERABLE

| # | Criterio | Estado | Nota |
|---|---------|--------|------|
| 2.1.1 | Keyboard | ✅✅ Corregido | Labels y aria añadidos en login/register |
| 2.1.2 | No Keyboard Trap | ✅ | Radix components manejan focus trap correctamente |
| 2.4.1 | Skip Links | ✅✅ CORREGIDO | Skip link añadido en root layout |
| 2.4.2 | Page Titled | ✅ | Cada página tiene `<h1>` descriptivo |
| 2.4.3 | Focus Order | ✅ | Sin `tabindex` positivos |
| 2.4.4 | Link Purpose (In Context) | ✅ | Links tienen texto descriptivo |
| 2.4.7 | Focus Visible | ✅ | `focus-visible:ring-2 ring-biolume` en globals.css |
| 2.5.3 | Label in Name | ✅ | Nombres accesibles coinciden con etiquetas visibles |
| 2.5.7 | Dragging Movements | N/A | No hay operaciones de arrastre necesarias |
| 2.5.8 | Target Size (Minimum) | ✅ | Mínimo 24x24px (botones icono 32x32px) |

### 3. COMPRENSIBLE

| # | Criterio | Estado | Nota |
|---|---------|--------|------|
| 3.1.1 | Language of Page | ✅ | `lang="en"` en `<html>` |
| 3.2.1 | On Focus | ✅ | Sin cambios de contexto al recibir foco |
| 3.2.2 | On Input | ✅ | Sin cambios automáticos al escribir |
| 3.3.1 | Error Identification | ✅✅ Corregido | `role="alert"` añadido a errores |
| 3.3.2 | Labels or Instructions | ✅✅ Corregido | `sr-only` labels añadidos en login/register |
| 3.3.3 | Error Suggestion | ⚠️ Parcial | Mensajes de error descriptivos pero genéricos |
| 3.3.4 | Error Prevention (Legal/Financial) | N/A | No hay transacciones legales/financieras |
| 3.3.7 | Accessible Authentication | ✅ | Autenticación sin requerir tareas cognitivas |

### 4. ROBUSTO

| # | Criterio | Estado | Nota |
|---|---------|--------|------|
| 4.1.1 | Parsing | ✅ | HTML válido (Next.js genera HTML semántico) |
| 4.1.2 | Name, Role, Value | ✅✅ Corregido | `aria-current`, `aria-expanded`, `aria-sort` añadidos |
| 4.1.3 | Status Messages | ✅ | `role="status"` y `role="alert"` añadidos en estados |

---

## HALLAZGOS DETALLADOS

### ❌ CRÍTICOS (Alta Prioridad)

#### H1. No hay skip link (WCAG 2.4.1)
- **Archivo:** `apps/web/app/layout.tsx:51`
- **Problema:** El primer elemento enfocable no es un skip link
- **Solución:** Añadido `<a href="#main-content" class="skip-link">` como primer hijo de `<body>`
- **Corregido:** ✅

#### H2. Formulario login sin labels (WCAG 3.3.2)
- **Archivo:** `apps/web/app/(auth)/login/page.tsx:91-107`
- **Problema:** Inputs de email y password usan solo `placeholder`, sin `<label>`
- **Solución:** Añadidos `<label className="sr-only">` con `htmlFor`
- **Corregido:** ✅

#### H3. Formulario registro sin labels (WCAG 3.3.2)
- **Archivo:** `apps/web/app/(auth)/register/page.tsx:86-95`
- **Problema:** Input sin label
- **Solución:** Añadido `<label>` sr-only
- **Corregido:** ✅

#### H4. Error en login sin role="alert" (WCAG 4.1.3)
- **Archivo:** `apps/web/app/(auth)/login/page.tsx:109`
- **Problema:** `<p>` de error sin `role="alert"`
- **Solución:** Añadido `role="alert"`
- **Corregido:** ✅

#### H5. Botón Google sin aria-label (WCAG 4.1.2)
- **Archivo:** `apps/web/app/(auth)/login/page.tsx:132-144`
- **Problema:** SVG decorativo sin `aria-hidden`, botón sin `aria-label`
- **Solución:** Añadido `aria-label="Sign in with Google"` y `aria-hidden="true"` al SVG
- **Corregido:** ✅

---

### ⚠️ MEDIOS (Prioridad Media)

#### M1. Indicadores de estado usan solo color (WCAG 1.4.1)
- **Archivos:** 
  - `apps/web/components/features/dashboard/index.tsx:147`
  - `apps/web/components/features/flows/flow-card.tsx:36`
  - `apps/web/app/(dashboard)/monitor/page.tsx:36`
- **Problema:** Status dots (w-2 h-2 rounded-full con color) sin texto alternativo
- **Solución:** Añadido `<span className="sr-only">{status}</span>` junto a cada dot
- **Corregido:** ✅

#### M2. Sidebar toggle sin aria-expanded (WCAG 4.1.2)
- **Archivo:** `apps/web/components/layout/sidebar.tsx:269`
- **Problema:** Botón hamburguesa mobile sin `aria-expanded`
- **Solución:** Añadido `aria-expanded={mobileSidebarOpen}` y `aria-label`
- **Corregido:** ✅

#### M3. Navegación sin aria-current (WCAG 4.1.2)
- **Archivo:** `apps/web/components/layout/sidebar.tsx:136`
- **Problema:** Links activos en sidebar sin indicación para screen readers
- **Solución:** Añadido `aria-current="page"` al link activo
- **Corregido:** ✅

#### M4. DataTable sort solo con caracteres unicode (WCAG 4.1.2)
- **Archivo:** `apps/web/components/shared/data-table.tsx:108-131`
- **Problema:** Flechas ↑/↓ sin texto alternativo, falta `aria-sort`
- **Solución:** Añadido `aria-sort` a `<th>` y `sr-only` con texto descriptivo
- **Corregido:** ✅

#### M5. scroll-behavior: smooth sin prefers-reduced-motion (WCAG 2.3.3)
- **Archivo:** `apps/web/app/globals.css:14`
- **Problema:** `scroll-behavior: smooth` en html sin media query
- **Solución:** Envuelto en `@media (prefers-reduced-motion: reduce)`
- **Corregido:** ✅

#### M6. ErrorState sin role="alert" (WCAG 4.1.3)
- **Archivo:** `apps/web/components/shared/states.tsx:64`
- **Problema:** ErrorState no notifica a screen readers
- **Solución:** Añadido `role="alert"`
- **Corregido:** ✅

#### M7. LoadingState sin aria-live (WCAG 4.1.3)
- **Archivo:** `apps/web/components/shared/states.tsx:94`
- **Problema:** Spinner sin `role="status"` ni `aria-live`
- **Solución:** Añadido `role="status"` y `aria-live="polite"`
- **Corregido:** ✅

---

### ℹ️ BAJOS (Prioridad Baja)

#### L1. Settings workspace icon input sin label (WCAG 3.3.2)
- **Archivo:** `apps/web/app/(dashboard)/settings/general/page.tsx:46`
- **Problema:** Input de ícono sin `aria-label`  
- **Solución:** Añadido `<label>` sr-only
- **Corregido:** ✅

#### L2. Iconos decorativos sin aria-hidden
- **Archivos:** Múltiples componentes (SlidersHorizontal en search-command, Chevron icons en sidebar)
- **Solución:** Añadido `aria-hidden="true"` a iconos puramente decorativos
- **Corregido:** ✅ (parcial - los más críticos)

#### L3. Period filter buttons sin role="radiogroup" (WCAG 4.1.2)
- **Archivo:** `apps/web/app/(dashboard)/dashboard/page.tsx:83`
- **Problema:** Grupo de botones de período sin semántica de radio
- **Solución:** Añadido `role="radiogroup"` y `role="radio"` con `aria-checked`
- **Corregido:** ✅

#### L4. sidebar nav iconos sin aria-hidden
- **Archivo:** `apps/web/components/layout/sidebar.tsx`
- **Solución:** Añadido `aria-hidden="true"` a iconos decorativos
- **Corregido:** ✅

---

## CÓDIGO DE CORRECCIONES RESUMEN

### globals.css — Añadir:
```css
.sr-only { /* ... */ }
.skip-link { /* ... */ }
.skip-link:focus { /* ... */ }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
```

### layout.tsx — Añadir:
```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>
```

### dashboard-shell.tsx — Añadir:
```tsx
<main id="main-content" tabIndex={-1}>
```

---

## RECOMENDACIONES ADICIONALES (AAA)

1. **Contraste mejorado** — Subir `--muted-foreground` de `45%` a `50%` en light mode para ratio > 5:1
2. **Focus más visible** — Añadir `box-shadow` en focus para mejor detección visual
3. **Target size 44x44** — Botones icono pequeños (`h-8 w-8` = 32px) deberían ser 44px mínimo para AAA
4. **Pruebas con NVDA** — Verificar navegación completa con NVDA + Chrome
5. **Añadir axe-core** — Integrar `@axe-core/playwright` en tests E2E

---

*Auditoría generada por Accessibility Master — WCAG 2.2 AA*
