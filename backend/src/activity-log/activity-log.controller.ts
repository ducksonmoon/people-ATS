import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async getAllActivityLogs(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      return await this.activityLogService.getActivityLogs(
        limit ? +limit : 50,
        offset ? +offset : 0,
      );
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving activity logs: ${error.message}`,
      );
    }
  }

  @Get('resource/:type/:id')
  async getResourceActivityLogs(
    @Param('type') resourceType: string,
    @Param('id') resourceId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.activityLogService.getResourceActivityLogs(
        resourceType,
        resourceId,
        limit ? +limit : 20,
      );
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving resource activity logs: ${error.message}`,
      );
    }
  }

  @Get('user/:userId')
  async getUserActivityLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.activityLogService.getUserActivityLogs(
        +userId,
        limit ? +limit : 20,
      );
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving user activity logs: ${error.message}`,
      );
    }
  }

  @Get('action/:action')
  async getActionActivityLogs(
    @Param('action') action: string,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.activityLogService.getActionActivityLogs(
        action,
        limit ? +limit : 20,
      );
    } catch (error) {
      throw new BadRequestException(
        `Error retrieving action activity logs: ${error.message}`,
      );
    }
  }
}
