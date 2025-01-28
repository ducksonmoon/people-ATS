import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsResolver } from './applications.resolver';
import { PrismaService } from '../../common/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ApplicationsController } from './applications.controller';

@Module({
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    ApplicationsResolver,
    PrismaService,
    NotificationsGateway,
  ],
})
export class ApplicationsModule {}
