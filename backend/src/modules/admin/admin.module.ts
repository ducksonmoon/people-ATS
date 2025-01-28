import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService, RolesGuard],
})
export class AdminModule {}
