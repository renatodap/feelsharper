# Architecture Decision Records

## ADR-001: Button Component Variant Types
**Date**: 2025-01-08
**Status**: Accepted

### Context
The SchemaEvolutionDashboard component was using 'default' and 'destructive' button variants that don't exist in our Button component.

### Decision
Changed button variants to use the existing types: 'primary', 'secondary', 'outline', 'ghost'.
- 'default' → 'primary' (for primary actions)
- 'destructive' → 'secondary' (for rejection/negative actions)

### Consequences
- TypeScript compilation errors resolved
- UI consistency maintained
- May need to add destructive variant styling later if needed

### Links
- Commit: Phase 1 TypeScript fixes
- Guide Reference: PRODUCTION_DEPLOYMENT_GUIDE.md section 1.1

---

## ADR-002: Speech Recognition Types
**Date**: 2025-01-08
**Status**: Accepted

### Context
VoiceInput.tsx had conflicting SpeechRecognition type declarations causing TypeScript errors.

### Decision
Created a dedicated global types file (types/global.d.ts) with proper TypeScript interface extensions for browser Speech Recognition API.

### Consequences
- Clean separation of browser API types
- Reusable across the application
- Better type safety for voice features

### Links
- File: types/global.d.ts
- Guide Reference: PRODUCTION_DEPLOYMENT_GUIDE.md section 1.1

---

## ADR-003: ActivityLog Type Interface
**Date**: 2025-01-08
**Status**: Accepted

### Context
EnhancedStreakSystem was creating ActivityLog objects missing required properties.

### Decision
Use the existing ActivityLog interface from lib/ai-coach/types.ts and provide all required fields with sensible defaults.

### Consequences
- Type safety maintained
- Consistent data structure across the app
- May need to refactor streak system to better align with ActivityLog structure

### Links
- Interface: lib/ai-coach/types.ts
- Component: components/streaks/EnhancedStreakSystem.tsx

---

## ADR-004: AB Testing Data Structure
**Date**: 2025-01-08
**Status**: Accepted

### Context
The experiment_variants field in AB testing was being accessed as an object but could be an array.

### Decision
Added defensive code to handle both array and object structures with safe fallbacks.

### Consequences
- More robust error handling
- Works with different Supabase query results
- May need to standardize the data structure in future

### Links
- File: lib/ab-testing/core.ts
- Guide Reference: Database type alignment fixes