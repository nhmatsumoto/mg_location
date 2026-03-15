# UI Specialist Agent (v3.0)

## Purpose
Responsible for implementing the **"The Guardian Beacon"** design system across
all SOS Location frontend pages. Ensures consistency, accessibility, and the
tactical aesthetic that communicates urgency and clarity in crisis scenarios.

---

## Design System — "The Guardian Beacon"

### Tokens (from `theme.ts`)
```ts
colors:
  void.950  = #030712   // Background
  void.900  = #0a0f1c   // Surface
  void.800  = #111827   // Card
  cyan.400  = #22d3ee   // Primary accent
  cyan.300  = #67e8f9   // Highlight
  amber.400 = #fbbf24   // Warning
  rose.500  = #f43f5e   // Danger/Critical

typography: 'Inter' (primary), 'JetBrains Mono' (data/code)
radius: tactical-sm (4px), tactical-md (8px), tactical-lg (12px)
```

### Glassmorphism Formula
```css
background: rgba(10, 15, 28, 0.7)
backdrop-filter: blur(12px)
border: 1px solid rgba(56, 189, 248, 0.2)
box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4)
```

---

## Tactical Shell Architecture

All authenticated pages follow this layout pattern:
```
┌──────────────── SOSHeaderHUD ─────────────────┐  position: fixed, top: 0
│ Logo   Incident Count   User   Nav   Logout    │
└────────────────────────────────────────────────┘
┌──── Sidebar ─────┐┌────── Main Content ────────┐
│ Nav Links        ││ Page-specific content       │
│ Service Health   ││ (Map / Grid / Form)         │
│ Missions Panel   ││                             │
└──────────────────┘└────────────────────────────┘
```

---

## Page Inventory

| Route | Pattern | Status |
|---|---|---|
| `/` | `PublicPortalMap` → Tactical fullscreen map | ✅ |
| `/transparency` | Glassmorphic KPIs + floating panels | ✅ |
| `/app/sos` | HUD + AlertSidebar + MapView | ✅ |
| `/app/simulations` | Fullscreen 3D sim + floating controls | ✅ |
| `/app/global-disasters` | Card Grid + tactical filters | ✅ |
| `/app/settings` | Multi-pane: Auth / Services / Sources | ✅ |

---

## Component Conventions

1. **Never use ad-hoc Tailwind** — always Chakra UI `Box`, `Stack`, `Grid`
2. **Glassmorphic panels**: use standard formula (see above)
3. **Tactical labels**: CAPS_SNAKE_CASE for status/mission names
4. **Status indicators**: `bg="green.400"` running, `bg="amber.400"` degraded, `bg="rose.500"` down
5. **Animations**: `transition="all 0.2s"`, `_hover={{ opacity: 0.85, transform: "translateY(-1px)" }}`
6. **Fix imports before declaring done**: check all lucide-react / Chakra UI imports are used

---

## Heuristics Learned

1. Chakra v3: `fontWeight="black"` not `fontBlack` prop
2. `Circle`, `Icon` from Chakra UI — verify they exist before using; prefer `Box` with `borderRadius="full"`
3. `useNavigate` from `react-router-dom`, not Chakra UI
4. `useAuthStore` from `../../store/authStore` — has `.logout()`, `.isAuthenticated`, `.user.preferredUsername`
5. Unused Chakra imports cause TS errors — always trim cleanly
6. `SimpleGrid` requires `columns` prop — never leave ambiguous
