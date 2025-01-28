import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RecruiterService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicationsByRecruiter(recruiterId: number) {
    return this.prisma.application.findMany({
      where: { job: { postedById: recruiterId } },
      include: { candidate: true, job: true },
    });
  }
}
