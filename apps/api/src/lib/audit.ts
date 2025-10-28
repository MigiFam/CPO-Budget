import { prisma } from '../lib/prisma';
import { AuditAction } from '@prisma/client';

interface AuditLogData {
  organizationId: string;
  actorId: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  diffJSON?: Record<string, unknown>;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: data.organizationId,
        actorId: data.actorId,
        entity: data.entity,
        entityId: data.entityId,
        action: data.action,
        diffJSON: data.diffJSON || {},
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - we don't want audit logging to break the main operation
  }
}

export function generateDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  // Check for changed fields
  Object.keys(newData).forEach((key) => {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      diff[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  });

  return diff;
}
