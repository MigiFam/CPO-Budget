# Testing Guide: Project Details & Edit Functionality

## Pre-Test Setup

1. **Ensure API is running:**
   ```powershell
   cd "d:\Git\CPO budget app\apps\api"
   npm run dev
   ```

2. **Ensure Web app is running:**
   ```powershell
   cd "d:\Git\CPO budget app\apps\web"
   npm run dev
   ```

3. **Login to the application:**
   - Navigate to http://localhost:5173
   - Login with test credentials

## Test Scenarios

### ✅ Test 1: View Project Details
**Goal:** Verify project detail page loads correctly

1. Navigate to Projects page (`/projects`)
2. Click on any project card
3. **Expected Results:**
   - ✓ Page loads without errors
   - ✓ Breadcrumb shows: "Projects / [Project Name]"
   - ✓ Project name appears as h1
   - ✓ Status badge displays with correct color
   - ✓ 4 quick stat cards show (Baseline, Committed, Actuals, Variance)
   - ✓ 6 tabs visible (Overview, Budget Lines, Budget Breakdown, Cost Events, Team, Comments)
   - ✓ "Edit Project" button visible in header

---

### ✅ Test 2: Open Edit Modal
**Goal:** Verify edit modal opens and displays correctly

1. On project detail page, click **"Edit Project"** button
2. **Expected Results:**
   - ✓ Modal opens with backdrop
   - ✓ Modal title: "Edit Project"
   - ✓ X close button visible
   - ✓ All fields pre-populated with current project data
   - ✓ Dropdowns populated:
     - Facility dropdown has options
     - Funding Source dropdown has options
     - Project Manager dropdown has options (filtered to PMs/Directors)
   - ✓ Required fields marked with red asterisk (*)
   - ✓ Cancel and Save Changes buttons visible

---

### ✅ Test 3: Edit Project Name
**Goal:** Verify simple field editing works

1. Open edit modal
2. Change project name to "Test Project - EDITED"
3. Click **Save Changes**
4. **Expected Results:**
   - ✓ Button shows "Saving..." briefly
   - ✓ Modal closes automatically
   - ✓ Page refreshes
   - ✓ Project h1 now shows "Test Project - EDITED"
   - ✓ No errors in console

---

### ✅ Test 4: Change Project Status
**Goal:** Verify status changes work and reflect in UI

1. Open edit modal
2. Change Status dropdown from "PLANNED" to "ACTIVE"
3. Click Save
4. **Expected Results:**
   - ✓ Modal closes
   - ✓ Status badge changes to green "ACTIVE"
   - ✓ Correct status color displayed

---

### ✅ Test 5: Reassign Project Manager
**Goal:** Verify PM reassignment works

1. Open edit modal
2. Change Project Manager dropdown to different user
3. Click Save
4. **Expected Results:**
   - ✓ Modal closes
   - ✓ Overview tab → Project Manager shows new name
   - ✓ Team tab → Project Manager card shows new user

---

### ✅ Test 6: Change Facility & Funding Source
**Goal:** Verify critical relationships can be changed

1. Open edit modal
2. Change Facility to different facility
3. Change Funding Source to different source
4. Click Save
5. **Expected Results:**
   - ✓ Modal closes
   - ✓ Overview tab → Facility shows new facility name
   - ✓ Overview tab → Funding Source shows new source
   - ✓ Project card on /projects page updates

---

### ✅ Test 7: Update Dates
**Goal:** Verify date fields work

1. Open edit modal
2. Set Start Date to "2025-01-01"
3. Set End Date to "2025-12-31"
4. Click Save
5. **Expected Results:**
   - ✓ Modal closes
   - ✓ Overview tab → Start Date shows "Jan 1, 2025"
   - ✓ Overview tab → End Date shows "Dec 31, 2025"

---

### ✅ Test 8: Edit Description
**Goal:** Verify textarea fields work

1. Open edit modal
2. Change description to multi-line text:
   ```
   This is a test project.
   
   It has multiple lines.
   And some details.
   ```
3. Click Save
4. **Expected Results:**
   - ✓ Modal closes
   - ✓ Overview tab → Description shows full text
   - ✓ Line breaks preserved

---

### ✅ Test 9: Change Project Type
**Goal:** Verify type changes work

1. Open edit modal
2. Change Project Type from "Small Works" to "Major Project"
3. Click Save
4. **Expected Results:**
   - ✓ Modal closes
   - ✓ Header shows "MAJOR" type

---

### ✅ Test 10: Cancel Editing
**Goal:** Verify cancel doesn't save changes

1. Open edit modal
2. Change project name to "TEST CANCEL"
3. Click **Cancel** button
4. **Expected Results:**
   - ✓ Modal closes
   - ✓ Project name unchanged
   - ✓ No API call made

---

### ✅ Test 11: Close Modal with Backdrop
**Goal:** Verify clicking outside closes modal

1. Open edit modal
2. Click on dark backdrop (outside modal)
3. **Expected Results:**
   - ✓ Modal closes
   - ✓ No changes saved

---

### ✅ Test 12: Required Field Validation
**Goal:** Verify required fields are enforced

1. Open edit modal
2. Clear the project name field (delete all text)
3. Try to click Save
4. **Expected Results:**
   - ✓ Browser shows validation error
   - ✓ Form doesn't submit
   - ✓ "Please fill out this field" message

---

### ✅ Test 13: Tab Navigation
**Goal:** Verify all tabs work

1. On project detail page, click each tab:
   - Overview
   - Budget Lines
   - Budget Breakdown
   - Cost Events
   - Team
   - Comments

2. **Expected Results:**
   - ✓ Each tab activates (blue underline)
   - ✓ Content changes for each tab
   - ✓ No errors in console
   - ✓ No broken components

---

### ✅ Test 14: Budget Breakdown Tab
**Goal:** Verify budget breakdown displays

1. Click "Budget Breakdown" tab
2. **Expected Results:**
   - ✓ Shows "Total Funding (Approved Budget)" in blue header
   - ✓ Shows Construction Cost Subtotal
   - ✓ Shows Other Cost Subtotal
   - ✓ Shows Total Project Cost in orange header
   - ✓ Shows Remaining Budget (green or red)
   - ✓ All currency values formatted correctly ($X,XXX.XX)

---

### ✅ Test 15: Overview Tab - All Sections
**Goal:** Verify all overview sections display

1. Click "Overview" tab
2. **Expected Results:**
   - ✓ Project Details card shows all fields
   - ✓ Budget Progress card shows 2 progress bars
   - ✓ Activity Summary card shows counts
   - ✓ Notes card shows if project has notes
   - ✓ All icons display correctly
   - ✓ No layout issues

---

### ✅ Test 16: Quick Stats Cards
**Goal:** Verify stat cards calculate correctly

1. Note the budget values
2. **Expected Results:**
   - ✓ Baseline Budget: Shows approved budget
   - ✓ Committed: Shows committed + percentage
   - ✓ Actuals: Shows spent amount + percentage
   - ✓ Variance: Positive = green, negative = red
   - ✓ All values formatted as currency

---

### ✅ Test 17: Team Tab - Project Manager
**Goal:** Verify PM display in team tab

1. Click "Team" tab
2. **Expected Results:**
   - ✓ Project Manager card visible
   - ✓ Avatar circle with user icon
   - ✓ PM name displayed
   - ✓ PM email displayed
   - ✓ "Project Manager" badge (blue)
   - ✓ If no PM: Shows empty state message

---

### ✅ Test 18: Comments Tab - UI
**Goal:** Verify comments tab UI

1. Click "Comments" tab
2. **Expected Results:**
   - ✓ Textarea for new comment
   - ✓ "Post Comment" button
   - ✓ Empty state: "No comments yet..."
   - ✓ MessageSquare icon in header

---

### ✅ Test 19: Cost Events Tab - Table
**Goal:** Verify cost events table structure

1. Click "Cost Events" tab
2. **Expected Results:**
   - ✓ Table headers: Type, Description, Amount, Status, Date
   - ✓ "Add Cost Event" button with dollar icon
   - ✓ Empty state: "No cost events recorded yet"
   - ✓ Table properly formatted

---

### ✅ Test 20: Edit Multiple Fields at Once
**Goal:** Verify multiple edits save correctly

1. Open edit modal
2. Change:
   - Name: "Multi-Edit Test"
   - Description: "Testing multiple changes"
   - Status: "ACTIVE"
   - Start Date: "2025-02-01"
   - End Date: "2025-11-30"
3. Click Save
4. **Expected Results:**
   - ✓ All changes saved
   - ✓ All fields reflect new values
   - ✓ No data lost

---

### ✅ Test 21: Breadcrumb Navigation
**Goal:** Verify breadcrumb works

1. On project detail page
2. Click "Projects" in breadcrumb
3. **Expected Results:**
   - ✓ Navigates back to /projects
   - ✓ Project list displays
   - ✓ Edited project shows updated name

---

### ✅ Test 22: Error Handling - Network Failure
**Goal:** Verify error handling

1. Open edit modal
2. Stop API server
3. Make a change and click Save
4. **Expected Results:**
   - ✓ Error message displays
   - ✓ Modal stays open
   - ✓ User can retry
   - ✓ No crash/white screen

---

### ✅ Test 23: Loading States
**Goal:** Verify loading indicators work

1. On slow network, navigate to project detail
2. **Expected Results:**
   - ✓ Spinner shows while loading
   - ✓ No content flash

3. Open edit modal, save changes
4. **Expected Results:**
   - ✓ Button shows "Saving..."
   - ✓ Button disabled during save

---

### ✅ Test 24: 404 - Missing Project
**Goal:** Verify 404 handling

1. Navigate to `/projects/invalid-id-123`
2. **Expected Results:**
   - ✓ "Project not found" message
   - ✓ AlertCircle icon
   - ✓ "Back to Projects" button
   - ✓ Clicking button goes to /projects

---

### ✅ Test 25: Responsive Design - Mobile
**Goal:** Verify mobile responsiveness

1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Navigate through project detail page
4. **Expected Results:**
   - ✓ Quick stats stack vertically
   - ✓ Tabs scroll horizontally if needed
   - ✓ Modal fits on screen
   - ✓ Form fields stack properly
   - ✓ All content readable

---

## Automated Test Checklist

### Data Integrity:
- [ ] Edit preserves unchanged fields
- [ ] Cache invalidates correctly
- [ ] Optimistic updates work
- [ ] No duplicate API calls
- [ ] Concurrent edits handled

### Security:
- [ ] Auth required for edit
- [ ] Role permissions checked
- [ ] CSRF protection
- [ ] SQL injection prevented
- [ ] XSS protection

### Performance:
- [ ] Page loads < 2 seconds
- [ ] Edit saves < 1 second
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Lazy loading works

## Bug Report Template

If you find issues, report using this format:

```
**Bug:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[Attach if applicable]

**Console Errors:**
```
[Paste console output]
```

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- API Version: [Check package.json]
- Web Version: [Check package.json]
```

## Success Criteria

All tests pass = ✅ **PRODUCTION READY**

Any test fails = ⚠️ **Needs attention**

Critical failures (edit not saving, crashes) = 🚫 **DO NOT DEPLOY**

---

**Testing Date:** _____________
**Tester:** _____________
**Result:** [ ] Pass [ ] Fail
**Notes:**

