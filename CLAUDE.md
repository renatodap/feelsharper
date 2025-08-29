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

## 🎨 SHARPENED BRAND GUIDE - CRITICAL REFERENCE
**ALWAYS CHECK FIRST**: The official Sharpened brand guide is located at:
- **Path**: `C:\Users\pradord\Documents\Projects\Sharpened\brand-guide.html`
- **Fonts**: Use SF Pro Display for headings, Inter for body text (NOT Russo One)
- **Colors**: Follow exact brand guide colors (--feel-primary: #4169E1, etc.)
- **Design**: Sharp angular cuts, lightning elements, dark backgrounds
- **THIS OVERRIDES ALL OTHER DESIGN DECISIONS**

---
**These rules are MANDATORY and execute automatically. No exceptions.**