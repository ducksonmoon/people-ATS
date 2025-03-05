import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// Import our type extensions
import '../../types/prisma-extensions';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to database');

    // Add middleware for logging if needed
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Query ${params.model}.${params.action} took ${after - before}ms`,
        );
      }

      return result;
    });
  }
}
