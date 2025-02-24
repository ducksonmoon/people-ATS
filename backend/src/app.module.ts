import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { PrismaService } from './common/prisma.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsGateway } from './modules/notifications/notifications.gateway';
import { RecruiterModule } from './modules/recruiter/recruiter.module';
import { CompanySettingsModule } from './modules/company-settings/company-settings.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
      playground: true,
    }),
    UsersModule,
    JobsModule,
    ApplicationsModule,
    AuthModule,
    RecruiterModule,
    CompanySettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, NotificationsGateway],
})
export class AppModule {}
