# 📚 Documentation Enforcement Rules
*Auto-enforced on every Claude Code interaction*

## 🚨 CRITICAL RULES

### 1. DELETE OLD DOCUMENTATION
**Every prompt triggers:**
- Scan for files older than 7 days
- Archive files with outdated information
- Remove conflicting documentation
- Keep only current, accurate docs

### 2. UPDATE ON NEW INFORMATION
**When user provides info:**
- Immediately update relevant docs
- Archive old versions with timestamp
- Ensure no conflicts exist
- Single source of truth

### 3. DOCUMENTATION HIERARCHY

#### Active Documents (Keep Current):
```
feelsharper-deploy/
├── MVP_LAUNCH_PLAN.md         # Current launch plan
├── MVP_REQUIREMENTS.md        # User's MVP vision (to be created)
├── DEPLOYMENT_STATUS.md       # Live deployment status
├── DOCUMENTATION_RULES.md     # This file
└── README.md                  # Project overview
```

#### Archive Immediately:
- Old deployment attempts
- Outdated feature plans
- Previous configurations
- Conflicting documentation
- Files not updated in 7+ days

## 🔄 Auto-Enforcement Actions

### On Every Prompt:
```javascript
function enforceDocumentation() {
  // 1. Check for old files
  const oldFiles = findFilesOlderThan(7, 'days');
  if (oldFiles.length > 0) {
    archiveFiles(oldFiles, '99-ARCHIVE/');
  }
  
  // 2. Scan for conflicts
  const conflicts = findConflictingDocs();
  if (conflicts.length > 0) {
    resolveConflicts(conflicts);
  }
  
  // 3. Update current docs
  updateTimestamps();
  ensureSingleTruth();
}
```

### On User Information:
```javascript
function processUserInfo(info) {
  // 1. Categorize information
  const category = categorizeInfo(info);
  
  // 2. Update relevant docs
  switch(category) {
    case 'MVP_REQUIREMENTS':
      updateFile('MVP_REQUIREMENTS.md', info);
      break;
    case 'TIMELINE':
      updateFile('MVP_LAUNCH_PLAN.md', info);
      break;
    case 'TECHNICAL':
      updateFile('README.md', info);
      break;
  }
  
  // 3. Archive old versions
  archiveOldVersions();
  
  // 4. Verify no conflicts
  verifyConsistency();
}
```

## 📋 Document Templates

### MVP_REQUIREMENTS.md Template:
```markdown
# MVP Requirements
*Last Updated: [TIMESTAMP]*

## Core Features (Max 5)
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

## Success Metrics
- Metric 1: [Target]
- Metric 2: [Target]

## Timeline
- MVP Launch: [Date]
- First Users: [Date]

## Constraints
- [Constraint 1]
- [Constraint 2]
```

## 🎯 Truth Rules

### Single Source of Truth:
- ONE file per topic
- NO duplicate information
- NO conflicting versions
- IMMEDIATE updates

### Version Control:
- Archive with timestamp: `YYYYMMDD_HHMM_filename.md`
- Keep maximum 3 versions
- Older versions auto-deleted

### Clarity Standards:
- Clear headings
- Bullet points over paragraphs
- Status indicators (✅, ⏳, ❌)
- Timestamps on every update

## 🔍 Validation Checks

### Every Documentation Update:
- [ ] Old files archived?
- [ ] Timestamps updated?
- [ ] No conflicts exist?
- [ ] Clear next actions?
- [ ] Success metrics defined?

### Red Flags (Fix Immediately):
- 🚨 Documentation older than 7 days
- 🚨 Conflicting information
- 🚨 Missing timestamps
- 🚨 Unclear status
- 🚨 No next actions

## 📊 Documentation Health Score

Calculate on every interaction:
```
Health Score = 
  (Current Docs / Total Docs) * 40 +
  (No Conflicts) * 30 +
  (Clear Actions) * 20 +
  (Recent Updates) * 10
```

Target: 95%+ always

## 🚀 Implementation

This system is NOW ACTIVE and will:
1. Run automatically on every prompt
2. Archive old files without asking
3. Update docs when new info provided
4. Maintain single source of truth
5. Keep documentation lean and current

---
*These rules are non-negotiable and automatically enforced*