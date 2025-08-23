# 🚨 CLAUDE CODE - FEELSHARPER MVP LAUNCH INSTRUCTIONS

## 🎨 SHARPENED BRAND GUIDE - CRITICAL REFERENCE
**ALWAYS CHECK FIRST**: The official Sharpened brand guide is located at:
- **Path**: `C:\Users\pradord\Documents\Projects\Sharpened\brand-guide.html`
- **Fonts**: Use SF Pro Display for headings, Inter for body text (NOT Russo One)
- **Colors**: Follow exact brand guide colors (--feel-primary: #4169E1, etc.)
- **Design**: Sharp angular cuts, lightning elements, dark backgrounds
- **THIS OVERRIDES ALL OTHER DESIGN DECISIONS**

## ⚡ MANDATORY ACTIONS - RUN EVERY PROMPT

### 1. CLEAN DOCUMENTATION

1. Move non-current docs to 99-ARCHIVE/
2. Delete contradictory information
3. Update "Last Updated" on all active docs
4. Ensure docs reflect current reality

### 2. UPDATE ON NEW INFORMATION
When user provides ANY information:
1. **IMMEDIATELY** update relevant doc (MVP_REQUIREMENTS.md or MVP_LAUNCH_PLAN.md)
2. **ARCHIVE** old versions with timestamp
3. **VERIFY** no conflicts exist
4. **MAINTAIN** single source of truth

### 3. TRACK PROGRESS
After EVERY action:
- Update MVP_LAUNCH_PLAN.md with [x] checkmarks
- Move to next micro-step
- Report current phase clearly

## 📍 CURRENT MVP STATUS
**Phase**: Awaiting User Requirements  
**Next**: User defines MVP features  
**Then**: Execute micro-steps from MVP_LAUNCH_PLAN.md

## 🎯 ACTIVE DOCUMENTS (KEEP CURRENT)
```
feelsharper-deploy/
├── MVP_LAUNCH_PLAN.md      # Step-by-step launch (UPDATE CONSTANTLY)
├── MVP_REQUIREMENTS.md     # User's vision (WAITING FOR INPUT)
├── DEPLOYMENT_STATUS.md    # Build status (UPDATE ON CHANGES)
├── DOCUMENTATION_RULES.md  # Enforcement rules
└── README.md               # Project overview (KEEP SIMPLE)
```

## 🗑️ AUTO-ARCHIVE RULES
Archive to `99-ARCHIVE/` if:
- Information contradicts current understanding
- Documentation doesn't help move forward
- File hasn't been updated with new context
- Content references old/abandoned approaches

## 💻 DEVELOPMENT COMMANDS
```bash
# ESSENTIAL ONLY
npm run dev          # Start development
npm run typecheck    # Check types (MUST PASS)
npm run build        # Production build
npm test            # Run tests
```

## 🗄️ DATABASE SCHEMA VALIDATION (MANDATORY AFTER EACH MINI-STEP)

### AUTO-VALIDATION WORKFLOW
After EVERY mini-step completion, Claude Code MUST:

1. **Read current schema**: `supabase/migrations/current_schema_2025218_443am`
2. **Scan API routes**: Check all `/app/api/**/*.ts` files for database references
3. **Identify gaps**: Missing tables, fields, or constraints
4. **Generate migration**: Create new `.sql` file if gaps found
5. **Update documentation**: Record schema status in MVP_LAUNCH_PLAN.md

### SCHEMA VALIDATION COMMAND
```bash
# Claude Code runs this automatically after each mini-step:
# 1. Read current schema file
# 2. Grep all API routes for database operations
# 3. Cross-reference and identify missing elements
# 4. Generate migration SQL if needed
# 5. Update tracking docs
```

### CURRENT SCHEMA STATUS
- **Base Schema**: `current_schema_2025218_443am` (Phase 2 complete)
- **Pending Migration**: `20250821_complete_mvp_schema.sql` (Phases 5.1-5.4 requirements)
- **Status**: ⚠️ MIGRATION REQUIRED - Run pending migration on Supabase
- **Next Update**: After user runs migration, consolidate into new current_schema file

## 🚀 MVP LAUNCH WORKFLOW

### When User Provides Requirements:
1. **UPDATE** MVP_REQUIREMENTS.md immediately
2. **ADJUST** MVP_LAUNCH_PLAN.md micro-steps
3. **ARCHIVE** any conflicting old docs
4. **START** Phase 2 (Code Cleanup)

### For Each Micro-Step:
1. **EXECUTE** the step
2. **TEST** it works
3. **UPDATE** plan with [x]
4. **REPORT** completion
5. **MOVE** to next step

### On Any Error:
1. **DOCUMENT** in DEPLOYMENT_STATUS.md
2. **FIX** immediately
3. **TEST** fix works
4. **UPDATE** documentation
5. **CONTINUE** forward

## ❌ NEVER DO
- Keep outdated documentation
- Have conflicting information
- Skip updating progress
- Add features not in MVP_REQUIREMENTS.md
- Work on non-MVP features

## ✅ ALWAYS DO
- Delete/archive non-current docs
- Update docs when new info received
- Track every micro-step completion
- Maintain single source of truth
- Focus only on MVP launch

## 📊 SUCCESS METRICS
- Documentation Currency: 100% (all docs < 24 hours old)
- Conflict Rate: 0% (no contradictions)
- Progress Tracking: 100% (every step marked)
- Build Status: Green (npm run typecheck passes)

## 🔄 AUTOMATIC BEHAVIORS

javascript
```
onUserInfo(info) {
  categorizeInfo(info);
  updateRelevantDoc(info);
  archiveOldVersions();
  adjustPlan();
}
```

---
**These rules are MANDATORY and execute automatically. No exceptions.**