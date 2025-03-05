import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreateActivityLogDto {
  action: string;
  details: string;
  userId?: number;
  entityType?: string;
  entityIds?: string;
  resourceId?: string;
  resourceType?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Log an activity
   * @param data Activity log data
   * @returns The created activity log
   */
  async logActivity(data: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: data.userId,
        entityType: data.entityType || data.resourceType || 'UNKNOWN',
        entityIds: data.entityIds || data.resourceId || '',
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get all activity logs with optional pagination
   * @param limit Number of logs to return
   * @param offset Offset for pagination
   * @returns Array of activity logs
   */
  async getActivityLogs(limit = 50, offset = 0) {
    return this.prisma.activityLog.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get activity logs for a specific resource
   * @param resourceType Type of resource (e.g., 'hiringGoal', 'department')
   * @param resourceId ID of the resource
   * @param limit Number of logs to return
   * @returns Array of activity logs for the resource
   */
  async getResourceActivityLogs(
    resourceType: string,
    resourceId: string,
    limit = 20,
  ) {
    return this.prisma.activityLog.findMany({
      where: {
        entityType: resourceType,
        entityIds: {
          contains: resourceId,
        },
      },
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get activity logs for a specific user
   * @param userId User ID
   * @param limit Number of logs to return
   * @returns Array of activity logs for the user
   */
  async getUserActivityLogs(userId: number, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Get recent activities for a specific action type
   * @param action Action type (e.g., 'archive', 'create')
   * @param limit Number of logs to return
   * @returns Array of activity logs for the action
   */
  async getActionActivityLogs(action: string, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: {
        action,
      },
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
