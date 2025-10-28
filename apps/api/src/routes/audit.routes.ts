import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Get recent activity (audit logs, comments, issues, cost events)
router.get('/recent-activity', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get recent comments
    const comments = await prisma.comment.findMany({
      where: {
        project: {
          organizationId: user.organizationId,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get recent issues
    const issues = await prisma.issue.findMany({
      where: {
        project: {
          organizationId: user.organizationId,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get recent cost events
    const costEvents = await prisma.costEvent.findMany({
      where: {
        project: {
          organizationId: user.organizationId,
        },
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Combine and sort all activities
    const activities = [
      ...auditLogs.map((log: any) => ({
        id: log.id,
        type: 'audit',
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        user: log.actor.name,
        timestamp: log.createdAt,
        message: `${log.actor.name} ${log.action.toLowerCase()}d ${log.entity.toLowerCase()}`,
      })),
      ...comments.map((comment: any) => ({
        id: comment.id,
        type: 'comment',
        action: 'COMMENT',
        entity: 'Project',
        entityId: comment.projectId,
        user: comment.author.name,
        projectName: comment.project.name,
        timestamp: comment.createdAt,
        message: `${comment.author.name} commented on ${comment.project.name}`,
        preview: comment.body.substring(0, 100),
      })),
      ...issues.map((issue: any) => ({
        id: issue.id,
        type: 'issue',
        action: 'CREATE',
        entity: 'Issue',
        entityId: issue.id,
        user: issue.createdBy.name,
        projectName: issue.project.name,
        timestamp: issue.createdAt,
        message: `${issue.createdBy.name} reported issue: ${issue.title}`,
        status: issue.status,
      })),
      ...costEvents.map((event: any) => ({
        id: event.id,
        type: 'cost_event',
        action: event.status,
        entity: 'CostEvent',
        entityId: event.id,
        user: event.submittedBy?.name || 'System',
        projectName: event.project.name,
        timestamp: event.createdAt,
        message: `${event.type}: ${event.description} - $${Number(event.amount).toLocaleString()}`,
        amount: Number(event.amount),
        status: event.status,
      })),
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActivities = activities.slice(0, limit);

    res.json(recentActivities);
  } catch (error) {
    next(error);
  }
});

// Get alerts and actions
router.get('/alerts', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const alerts: any[] = [];

    // 1. Budget variance alerts (projects over/under budget by more than threshold)
    const projectsWithBudgets = await prisma.project.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'ACTIVE',
      },
      include: {
        budgets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        projectBudgets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    projectsWithBudgets.forEach((project: any) => {
      const budget = project.budgets[0];
      const projectBudget = project.projectBudgets[0];

      if (budget && budget.variance) {
        const variancePercent = budget.baselineAmount
          ? (Number(budget.variance) / Number(budget.baselineAmount)) * 100
          : 0;

        if (Math.abs(variancePercent) > 5) {
          alerts.push({
            id: `budget-variance-${project.id}`,
            type: 'budget_variance',
            severity: Math.abs(variancePercent) > 10 ? 'high' : 'medium',
            projectId: project.id,
            projectName: project.name,
            message: `${project.name} is ${variancePercent > 0 ? 'over' : 'under'} budget by ${Math.abs(variancePercent).toFixed(1)}%`,
            amount: Number(budget.variance),
            timestamp: new Date(),
          });
        }
      }

      if (projectBudget && projectBudget.remainder !== null) {
        const remainder = Number(projectBudget.remainder);
        const approvedTotal = Number(projectBudget.approvedBudgetTotal || 0);

        if (approvedTotal > 0 && remainder < 0) {
          const overBudgetPercent = Math.abs((remainder / approvedTotal) * 100);
          alerts.push({
            id: `over-budget-${project.id}`,
            type: 'over_budget',
            severity: overBudgetPercent > 10 ? 'high' : 'medium',
            projectId: project.id,
            projectName: project.name,
            message: `${project.name} is over approved budget by $${Math.abs(remainder).toLocaleString()}`,
            amount: remainder,
            timestamp: new Date(),
          });
        }
      }
    });

    // 2. Pending approvals (cost events waiting for approval)
    const pendingCostEvents = await prisma.costEvent.findMany({
      where: {
        project: {
          organizationId: user.organizationId,
        },
        status: 'PENDING',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingCostEvents.length > 0) {
      alerts.push({
        id: 'pending-cost-events',
        type: 'pending_approval',
        severity: 'medium',
        message: `${pendingCostEvents.length} cost event${pendingCostEvents.length > 1 ? 's' : ''} awaiting approval`,
        count: pendingCostEvents.length,
        items: pendingCostEvents.slice(0, 5).map((ce: any) => ({
          id: ce.id,
          projectName: ce.project.name,
          type: ce.type,
          amount: Number(ce.amount),
        })),
        timestamp: new Date(),
      });
    }

    // 3. Open issues
    const openIssues = await prisma.issue.findMany({
      where: {
        project: {
          organizationId: user.organizationId,
        },
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (openIssues.length > 0) {
      alerts.push({
        id: 'open-issues',
        type: 'open_issues',
        severity: 'low',
        message: `${openIssues.length} open issue${openIssues.length > 1 ? 's' : ''} across projects`,
        count: openIssues.length,
        items: openIssues.slice(0, 5).map((issue: any) => ({
          id: issue.id,
          projectName: issue.project.name,
          title: issue.title,
          status: issue.status,
        })),
        timestamp: new Date(),
      });
    }

    // Sort by severity and timestamp
    const severityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => {
      const severityDiff = severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

export default router;
