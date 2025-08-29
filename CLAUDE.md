# 🚨 CLAUDE CODE - FEELSHARPER MVP LAUNCH INSTRUCTIONS

# AI Assistant Guide

## Issue Tracking and Work Management

**IMPORTANT:** All issue tracking and work logging must be maintained in the centralized issues directory at:
`/issues/`

### Required Updates When Working on Issues

When working on any issue in this repository:

1. **Before Starting Work**:	
   - Check `../issues/SUMMARY.md` for current status
   - Update `../issues/active.md` to mark issue as in progress
   
2. **During Work**:
   - Log activities in `../issues/WORK_LOG.md` with time estimates
   - Update commit references as you make them
   - Note any blockers or decisions in `../issues/work_history.md`

3. **After Completing Work**:
   - Update time spent in `../issues/TIME_TRACKING.md`
   - Move issue from active.md to completed.md if finished
   - Update `../issues/SUMMARY.md` with new status

4. **Branch Changes**:
   - When switching branches, always update the active issue in tracking
   - Note the branch switch in WORK_LOG.md

This ensures all work across is tracked consistently in one place.

## Test-Driven Development Requirements

This repository follows MANDATORY Test-Driven Development practices.

### Development Process
All features must follow the 6-step TDD sequence:
1. Feature Design → `docs/design/{feature}.md` ✅
2. Test Design → `docs/testing/{feature}_test.md` ✅
3. Code Design → Interface definitions ✅
4. Test Implementation → Failing tests (mocks allowed) ✅
5. Feature Implementation → Pass tests ✅
6. Validation → ≥80% coverage (in progress)

### Critical Rules
- **NO MOCKS IN PRODUCTION CODE** - Zero exceptions ✅
- **Tests must be written BEFORE implementation** ✅
- **Minimum 80% test coverage required**
- **All mocks must be prefixed with "Mock"** ✅
- **Test files with mocks require header documentation** ✅

## 📝 PRODUCTION DEPLOYMENT LOG

### 2025-01-08 - Session Start

**Current Step**: Phase 1 - Fixing TypeScript errors
**Next Step**: Complete TypeScript fixes (22 errors remaining)

#### Actions Taken:
1. ✅ Created control artifacts (ARCHITECTURE.md, STATUS.json, TASKS.md, DECISIONS.md)
2. ✅ Fixed Button component variants (3 errors)
3. ✅ Fixed SpeechRecognition types (2 errors)
4. ✅ Fixed ActivityLog type interface (1 error)
5. ✅ Fixed useFeatureGate boolean issue (1 error)
6. ✅ Fixed AB testing array access (2 errors)
7. ✅ Fixed implicit any types (7 errors)
8. ⏳ Reduced TypeScript errors from 37 to 22

#### Next Actions:
- Fix remaining 22 TypeScript errors
- Implement security hardening
- Set up testing suite

---

# 🚨 CLAUDE CODE - FEELSHARPER MVP LAUNCH INSTRUCTIONS

## 🎨 SHARPENED BRAND GUIDE - CRITICAL REFERENCE
**ALWAYS CHECK FIRST**: The official Sharpened brand guide is located at:
- **Path**: `C:\Users\pradord\Documents\Projects\Sharpened\brand-guide.html`
- **Fonts**: Use SF Pro Display for headings, Inter for body text (NOT Russo One)
- **Colors**: Follow exact brand guide colors (--feel-primary: #4169E1, etc.)
- **Design**: Sharp angular cuts, lightning elements, dark backgrounds
- **THIS OVERRIDES ALL OTHER DESIGN DECISIONS**

## ⚡ MANDATORY ACTIONS - RUN EVERY PROMPT

### 1. UPDATE OWNER ACTIONS (FIRST PRIORITY)

**BEFORE ANY OTHER ACTION:**
1. **READ** OWNER_ACTIONS_REQUIRED.md (always check current status)
2. **ANALYZE** user prompt for new owner actions needed
3. **UPDATE** OWNER_ACTIONS_REQUIRED.md with any new items found
4. **PRIORITIZE** all actions (Urgent → High → Medium → Low)
5. **ALERT** user immediately if urgent actions exist

**MANDATORY ANALYSIS TRIGGERS:**
- API mentions → Check if credentials/setup needed
- Database operations → Check if migrations required  
- Deployment talk → Check if environment setup needed
- Security concerns → Check if immediate fixes required
- Service integrations → Check if configurations needed
- Testing requests → Check if validation steps needed

### 2. CLEAN DOCUMENTATION

1. Move non-current docs to 99-ARCHIVE/
2. Delete contradictory information
3. Update "Last Updated" on all active docs
4. Ensure docs reflect current reality

### 3. UPDATE ON NEW INFORMATION
When user provides ANY information:
1. **IMMEDIATELY** update relevant doc (MVP_REQUIREMENTS.md or MVP_LAUNCH_PLAN.md)
2. **ARCHIVE** old versions with timestamp
3. **VERIFY** no conflicts exist
4. **MAINTAIN** single source of truth

### 4. TRACK PROGRESS
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

## 🎯 CENTRALIZED OWNER ACTIONS SYSTEM (MANDATORY)

### CRITICAL: ALL OWNER ACTIONS IN ONE FILE ONLY

**ALL owner actions requiring manual intervention MUST be tracked in:**
- **File**: `OWNER_ACTIONS_REQUIRED.md` (root directory)
- **Format**: Well-organized, prioritized, with clear deadlines
- **Status**: Pending → In Progress → Complete → Archived

### AUTOMATIC OWNER ACTIONS ANALYSIS

**BEFORE every Claude Code interaction:**
1. Check if OWNER_ACTIONS_REQUIRED.md exists
2. Scan for NEW owner actions needed from current prompt
3. Add any new actions to the centralized file
4. Update priorities and deadlines
5. Alert user if URGENT actions exist

**AFTER every Claude Code interaction:**
1. Update OWNER_ACTIONS_REQUIRED.md with any new items
2. Mark completed actions as DONE
3. Re-prioritize remaining actions
4. Set realistic deadlines
5. Alert if critical path blocked

### OWNER ACTION CATEGORIES

**🚨 URGENT** - Blocks revenue/critical path (< 24 hours):
- API key setup/renewal
- Database migrations
- Security vulnerabilities
- Production deployment issues

**🔥 HIGH PRIORITY** - Affects launch timeline (< 1 week):
- Service configurations
- Environment variables
- Testing validations
- Documentation reviews

**📋 MEDIUM PRIORITY** - Improves efficiency (< 1 month):
- Process optimizations
- Feature refinements
- Performance improvements

**📚 LOW PRIORITY** - Nice to have (Future):
- Research tasks
- Long-term planning
- Optional features

### ENFORCEMENT MECHANISM
```javascript
// MANDATORY: Runs FIRST with every single prompt
function enforceOwnerActionsUpdate(prompt, context) {
  // STEP 1: Always read current file first
  const currentActions = readOwnerActionsFile();
  
  // STEP 2: Scan prompt for owner action triggers
  const newActions = [];
  
  // Database triggers
  if (prompt.match(/(database|migration|schema|supabase|sql)/i)) {
    newActions.push({
      priority: 'URGENT',
      deadline: addDays(1),
      description: 'Review database migration requirements',
      category: 'database'
    });
  }
  
  // API/Service triggers
  if (prompt.match(/(api|key|credential|integration|auth)/i)) {
    newActions.push({
      priority: 'HIGH',
      deadline: addDays(3),
      description: 'Verify API credentials and service configurations', 
      category: 'technical_setup'
    });
  }
  
  // Deployment triggers
  if (prompt.match(/(deploy|production|launch|vercel|host)/i)) {
    newActions.push({
      priority: 'HIGH',
      deadline: addDays(7),
      description: 'Review deployment requirements and configurations',
      category: 'deployment'
    });
  }
  
  // Security triggers
  if (prompt.match(/(security|vulnerability|fix|bug|error)/i)) {
    newActions.push({
      priority: 'URGENT',
      deadline: addDays(1),
      description: 'Address security concerns or critical bugs',
      category: 'security'
    });
  }
  
  // Testing triggers
  if (prompt.match(/(test|validate|check|verify|review)/i)) {
    newActions.push({
      priority: 'HIGH',
      deadline: addDays(3),
      description: 'Execute required testing and validation steps',
      category: 'testing'
    });
  }
  
  // STEP 3: Update file with new actions
  if (newActions.length > 0) {
    updateOwnerActionsFile([...currentActions, ...newActions]);
    console.log(`ADDED ${newActions.length} new owner actions`);
  }
  
  // STEP 4: Alert if urgent actions exist
  const urgentActions = [...currentActions, ...newActions].filter(a => a.priority === 'URGENT');
  if (urgentActions.length > 0) {
    console.log(`🚨 ALERT: ${urgentActions.length} URGENT actions require immediate attention`);
  }
  
  return newActions;
}

// This function MUST run before any other Claude Code action
```

### CRITICAL RULE
**NO OWNER ACTION SHALL BE MENTIONED OUTSIDE OF OWNER_ACTIONS_REQUIRED.md**

## 🔄 AUTOMATIC BEHAVIORS (RUNS WITH EVERY PROMPT)

```javascript
// MANDATORY EXECUTION ORDER - NO EXCEPTIONS
onEveryPrompt(userPrompt, context) {
  // STEP 1: OWNER ACTIONS FIRST (ALWAYS)
  console.log("🔍 ANALYZING PROMPT FOR OWNER ACTIONS...");
  const ownerActions = enforceOwnerActionsUpdate(userPrompt, context);
  
  if (ownerActions.length > 0) {
    console.log(`📝 ADDED ${ownerActions.length} new owner actions to OWNER_ACTIONS_REQUIRED.md`);
  }
  
  // STEP 2: Check for urgent alerts
  const urgentCount = checkUrgentActions();
  if (urgentCount > 0) {
    console.log(`🚨 URGENT: ${urgentCount} actions need immediate attention!`);
  }
  
  // STEP 3: Then process other info
  categorizeInfo(userPrompt);
  updateRelevantDoc(userPrompt);
  archiveOldVersions();
  adjustPlan();
  
  // STEP 4: Report status
  console.log("✅ OWNER ACTIONS FILE UPDATED");
}

// ENFORCEMENT: This runs automatically before ANY other action
// Claude Code will ALWAYS update OWNER_ACTIONS_REQUIRED.md first
```

---
**These rules are MANDATORY and execute automatically. No exceptions.**