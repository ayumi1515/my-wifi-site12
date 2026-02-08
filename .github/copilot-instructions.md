# Copilot Instructions for my-wifi-site

## Project Overview

A React + Vite SPA that compares WiFi/internet providers (光回線) in Japan, specifically targeting Kagoshima region users. The app helps users find the best provider based on their building type (house/mansion), carrier preference (au/docomo/softbank), and contract terms.

**Stack**: React 19, Vite, Tailwind CSS, Lucide React icons

---

## Architecture & Key Patterns

### Data Structure: Provider Database
- **Location**: [src/App.jsx](src/App.jsx#L4) - `DEFAULT_PROVIDERS` constant (lines 4-398)
- **Format**: Array of provider objects with these critical fields:
  - `id`: Unique identifier (1-100 for houses, 101-107 for mansions)
  - `buildingType`: "house" | "mansion" (filters entire UI)
  - `type`: "fiber" | "home" (technology type)
  - `carrier`: "au" | "docomo" | "softbank" | "all" (affects bundle deals)
  - `monthlyFee`, `cashback`, `contractYear`: Pricing calculations
  - `badge`: "recommend" | "cheapest" | "popularity" | null (visual ranking)
  - `link`: Affiliate URL (A8.net affiliate links)

### State Management Pattern
- Single monolithic state using `useState` hooks
- Key state variables control filtering & UI:
  - `buildingType`: filters providers display
  - `selectedCarrier`: highlights matching providers
  - `editMode`: toggle between view/edit provider mode
  - Custom providers stored alongside DEFAULT_PROVIDERS

### Component Organization
- **[src/App.jsx](src/App.jsx)**: Single 398-line component handling:
  - Provider filtering logic (by building type, carrier)
  - Custom provider CRUD operations
  - Provider comparison cards rendering
  - Edit modal for custom providers
- **Styling**: Tailwind CSS classes only (no CSS modules)
- **Icons**: All from lucide-react (Wifi, Home, Smartphone, Check, etc.)

---

## Critical Business Logic

### Provider Filtering
When `buildingType` changes, filter `DEFAULT_PROVIDERS`:
```javascript
DEFAULT_PROVIDERS.filter(p => p.buildingType === buildingType)
```
Never combine house + mansion providers in displays - they have different cost structures.

### Carrier Highlighting
- `carrier: "all"` providers always apply to selected carrier
- `carrier: "au"` providers only relevant when `selectedCarrier === "au"`
- NTT回線 (Flets) acts as fallback for unsupported carriers

### Pricing Logic
- **Total Cost**: `(monthlyFee * 36) - cashback` (3-year TCO reference)
- **Contract Year 0**: No penalty on early termination (SoftBank Air, GMO)
- Always display both monthly AND total ownership cost

---

## Essential Commands & Dev Workflow

```bash
# Start dev server with HMR (port 5173)
npm run dev

# Build for production (output to dist/)
npm run build

# Lint check (ESLint config in eslint.config.js)
npm run lint

# Preview production build locally
npm run preview
```

**Build Note**: Vite's React Fast Refresh enabled via `@vitejs/plugin-react`

---

## Common Patterns & Conventions

### Provider Badge System
- `badge: "recommend"`: Primary choice (BBIQ for houses, BBIQ mansion for mansions)
- `badge: "cheapest"`: Lowest monthly cost option
- `badge: "popularity"`: Widely available/trusted (Docomo Light, Softbank Light)
- Used for visual differentiation only; don't auto-filter by badge

### Affiliate Link Handling
- Providers use A8.net affiliate links (search `a8mat` in constants)
- `link: "#"` indicates no affiliate configured yet (GMO 光アクセス)
- Never modify affiliate parameters in links - preserve as-is

### Custom Provider Storage
- Stored in component state, NOT in localStorage (temporary session only)
- Edit modal allows name, fee, cashback modifications
- Custom providers use `id >= 200` to avoid collision

---

## Code Style & Quick Wins

### Naming Conventions
- Boolean state: `isLoading`, `isOpen`, `showDetails`
- Handlers: `handleClick`, `handleChangeBuildingType`
- Arrays of objects: plural form (`providers`, `features`, `points`)

### Tailwind + Component Tips
- Provider cards: `border-2 border-yellow-400` for "recommend" badge
- Responsive: Use `md:` breakpoint for tablet (most used breakpoint)
- Colors: Use Tailwind defaults (no custom color extensions)

### Icon Usage Pattern
```javascript
import { Wifi, Smartphone, Check } from 'lucide-react'
<Wifi className="w-6 h-6" /> // Default size, customizable
```

---

## When to Ask for Clarification

Before implementing changes, verify:
1. **Which building types affected?** (house-only or mansion-only changes differ significantly)
2. **Affiliate link requirements?** (Never remove/modify a8mat parameters)
3. **Mobile responsiveness needed?** (Check against current Tailwind breakpoints)
4. **Provider data schema change?** (Impacts filtering, display, pricing calculations)

---

## Performance & Testing Notes

- **No tests configured** - unit tests should target provider filtering & pricing calcs
- **No Redux/Context** - monolithic App.jsx is intentional for this size
- **Bundle size**: ~150KB (Tailwind + Lucide are main dependencies)
- Future refactor candidates: Extract provider cards → ProviderCard component

