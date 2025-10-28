# Recent Activity & Alerts Implementation

## Summary
Implemented comprehensive Recent Activity and Alerts & Actions features for the CPO Budget App dashboard.

## Components Created/Updated

### 1. API Routes (`apps/api/src/routes/audit.routes.ts`)
**NEW ENDPOINTS:**

#### `GET /api/audit/recent-activity`
- Combines activity from multiple sources:
  - **Audit Logs**: System-level actions (CREATE, UPDATE, DELETE, APPROVE, etc.)
  - **Comments**: User comments on projects
  - **Issues**: Newly created or updated issues
  - **Cost Events**: Invoice submissions, change orders, etc.
- Returns unified activity feed sorted by timestamp
- Supports `?limit=N` query parameter (default: 10)
- Each activity includes:
  - `id`, `type`, `action`, `entity`, `entityId`
  - `user`, `projectName`, `timestamp`, `message`
  - Optional: `preview` (for comments), `status`, `amount`

#### `GET /api/audit/alerts`
- Generates actionable alerts from current project state:
  
  **Budget Variance Alerts:**
  - Detects projects over/under budget by >5%
  - Severity: HIGH (>10%), MEDIUM (5-10%)
  - Shows exact variance amount and percentage
  
  **Over Budget Alerts:**
  - Projects exceeding approved budget total
  - Based on `projectBudgets.remainder` field
  - Includes dollar amount over budget
  
  **Pending Approvals:**
  - Cost events with status = 'PENDING'
  - Shows count and top 5 items
  
  **Open Issues:**
  - Issues with status = 'OPEN' or 'IN_PROGRESS'
  - Shows count and top 5 items

- Returns array sorted by severity (HIGH → MEDIUM → LOW) then timestamp
- Each alert includes:
  - `id`, `type`, `severity`, `message`
  - Optional: `projectId`, `projectName`, `amount`, `count`, `items[]`

### 2. Dashboard Hook (`apps/web/src/hooks/useDashboard.ts`)
**UPDATED:**
- Added `ActivityItem` interface
- Added `AlertItem` interface
- Updated `DashboardSummary` to include:
  - `recentActivity: ActivityItem[]`
  - `alerts: AlertItem[]`
- Fetches activity and alerts in parallel with project data
- Gracefully handles API failures (continues with empty arrays)

### 3. Dashboard Page (`apps/web/src/pages/DashboardPage.tsx`)
**UPDATED:**

#### Recent Activity Card:
- Displays last 5 activities
- Shows:
  - Activity message
  - Project name (if applicable)
  - Comment preview (for comment activities)
  - User who performed action
  - Formatted timestamp (e.g., "Jan 15, 2:30 PM")
- Empty state: "No recent activity"

#### Alerts & Actions Card:
- Displays top 5 alerts
- Color-coded severity indicators:
  - 🔴 Red dot = HIGH severity
  - 🟡 Yellow dot = MEDIUM severity
  - 🔵 Blue dot = LOW severity
- Shows:
  - Alert message
  - Link to project (if project-specific)
  - Expandable items list (for pending approvals/issues)
  - Item details with amounts
- Empty state: "No alerts - all systems normal" (green)

### 4. Bug Fix: Total Funding Display (`apps/web/src/pages/FundingSourcesPage.tsx`)
**FIXED:**
- Issue: Total Funding showed `$3.4870000649999996e+27M` (scientific notation)
- Cause: Prisma Decimal objects being added without Number() conversion
- Solution: Changed `sum + (f.totalAllocation || 0)` to `sum + Number(f.totalAllocation || 0)`
- Result: Proper currency formatting (e.g., `$174.9M`)

## Data Flow

```
Dashboard Load
    ↓
useDashboard Hook
    ↓
Parallel Fetch:
    ├─→ GET /api/projects (existing)
    ├─→ GET /api/audit/recent-activity?limit=10
    └─→ GET /api/audit/alerts
    ↓
Combine & Return DashboardSummary
    ↓
DashboardPage renders:
    ├─→ Recent Activity Card (5 latest items)
    └─→ Alerts & Actions Card (5 highest priority)
```

## Database Models Used

### AuditLog
```prisma
model AuditLog {
  id             String      @id @default(uuid())
  organizationId String
  actorId        String
  entity         String      // "Project", "Budget", etc.
  entityId       String      // ID of the entity
  action         AuditAction // CREATE, UPDATE, DELETE, APPROVE, DENY, SUBMIT
  diffJSON       Json?       // Change details
  createdAt      DateTime    @default(now())
}
```

### Comment, Issue, CostEvent
- Used for real-time activity tracking
- All have `createdAt` timestamps
- All linked to projects

## Testing

To test the implementation:

1. **Start the API:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Access endpoints directly:**
   - `GET http://localhost:3001/api/audit/recent-activity`
   - `GET http://localhost:3001/api/audit/alerts`

3. **View in dashboard:**
   - Login to app
   - Dashboard shows Recent Activity and Alerts cards
   - Should populate with real data from database

## Future Enhancements

1. **Real-time Updates:**
   - Add WebSocket support for live activity feed
   - Toast notifications for high-severity alerts

2. **Filtering:**
   - Filter activity by type (comments, issues, cost events)
   - Filter alerts by severity or project

3. **Pagination:**
   - "View All Activity" link to dedicated activity page
   - Infinite scroll for activity feed

4. **Alert Actions:**
   - "Dismiss" button for alerts
   - "Snooze" option for reminders
   - Direct action buttons (e.g., "Approve", "Review")

5. **Activity Details:**
   - Click activity item to see full details
   - View diff for audit log entries
   - Inline comment preview expansion

## Files Modified

```
apps/api/src/routes/audit.routes.ts         - NEW IMPLEMENTATION (340 lines)
apps/web/src/hooks/useDashboard.ts          - UPDATED (added activity/alerts)
apps/web/src/pages/DashboardPage.tsx        - UPDATED (real data display)
apps/web/src/pages/FundingSourcesPage.tsx   - FIXED (Decimal conversion bug)
```

## Completion Status

✅ Recent Activity API endpoint
✅ Alerts & Actions API endpoint  
✅ Dashboard hook integration
✅ UI components with real data
✅ Bug fix for Total Funding display
✅ Error handling and empty states
✅ Severity-based alert sorting
✅ Responsive design (grid layout)

---

**Date Implemented:** January 2025  
**Developer:** GitHub Copilot  
**Status:** ✅ COMPLETE - Ready for testing
