import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  canManageTeam: boolean;
}

/**
 * Check if a user has access to a specific project
 * Directors can see all projects
 * Others can only see projects they're assigned to
 */
export async function hasProjectAccess(
  userId: string,
  projectId: string,
  role: UserRole
): Promise<boolean> {
  // Directors can see everything
  if (role === UserRole.DIRECTOR) {
    return true;
  }

  // Check if user is the project manager
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectManagerId: true },
  });

  if (project?.projectManagerId === userId) {
    return true;
  }

  // Check if user is a team member
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId,
      team: { projectId },
    },
  });

  return !!teamMember;
}

/**
 * Get permissions for a user on a specific project
 */
export async function getProjectPermissions(
  userId: string,
  projectId: string,
  role: UserRole
): Promise<PermissionCheck> {
  const hasAccess = await hasProjectAccess(userId, projectId, role);

  if (!hasAccess) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canExport: false,
      canManageTeam: false,
    };
  }

  // Director has full permissions
  if (role === UserRole.DIRECTOR) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
      canExport: true,
      canManageTeam: true,
    };
  }

  // Check if user is the project manager
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectManagerId: true },
  });

  const isPM = project?.projectManagerId === userId;

  if (isPM && role === UserRole.PROJECT_MANAGER) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canApprove: true,
      canExport: true,
      canManageTeam: true,
    };
  }

  // Finance role
  if (role === UserRole.FINANCE) {
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canApprove: true,
      canExport: true,
      canManageTeam: false,
    };
  }

  // Team member
  if (role === UserRole.TEAM_MEMBER) {
    return {
      canView: true,
      canEdit: true,
      canDelete: false,
      canApprove: false,
      canExport: false,
      canManageTeam: false,
    };
  }

  // Contractor
  if (role === UserRole.CONTRACTOR) {
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canExport: false,
      canManageTeam: false,
    };
  }

  // Viewer/Auditor
  return {
    canView: true,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canExport: role === UserRole.AUDITOR,
    canManageTeam: false,
  };
}

/**
 * Filter projects based on user role and access
 * Directors see all, others see only their assigned projects
 */
export async function getAccessibleProjectIds(
  userId: string,
  organizationId: string,
  role: UserRole
): Promise<string[]> {
  // Directors can see all projects in their org
  if (role === UserRole.DIRECTOR) {
    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { id: true },
    });
    return projects.map((p) => p.id);
  }

  // Get projects where user is PM
  const managedProjects = await prisma.project.findMany({
    where: {
      organizationId,
      projectManagerId: userId,
    },
    select: { id: true },
  });

  // Get projects where user is a team member
  const teamProjects = await prisma.teamMember.findMany({
    where: {
      userId,
      team: {
        project: { organizationId },
      },
    },
    include: {
      team: {
        select: { projectId: true },
      },
    },
  });

  const projectIds = new Set([
    ...managedProjects.map((p) => p.id),
    ...teamProjects.map((tm) => tm.team.projectId),
  ]);

  return Array.from(projectIds);
}
