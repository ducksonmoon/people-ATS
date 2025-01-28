import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll() {
    return this.prisma.application.findMany({
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  async create(data: {
    candidateId: number;
    jobId: number;
    status?: string;
    resumePath?: string;
  }) {
    const { candidateId, jobId, resumePath } = data;

    if (!candidateId) {
      throw new Error(`Candidate with ID ${data.candidateId} does not exist.`);
    }

    const existingApplication = await this.prisma.application.findFirst({
      where: { candidateId, jobId },
    });

    if (existingApplication) {
      throw new Error('You have already applied for this job.');
    }

    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new Error(`Job with ID ${data.jobId} does not exist.`);
    }

    return this.prisma.application.create({
      data: {
        candidateId,
        jobId,
        resumePath,
        status: data.status || 'PENDING',
      },
      include: {
        candidate: true,
        job: true,
      },
    });
  }

  async updateStatus(applicationId: number, status: string) {
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        candidate: true,
        job: true,
      },
    });

    this.notificationsGateway.sendNotification('applicationStatusUpdated', {
      applicationId,
      status,
    });

    return updatedApplication;
  }

  async getApplicationsByCandidate(candidateId: number) {
    return this.prisma.application.findMany({
      where: { candidateId },
      include: { job: true },
    });
  }

  // TODO: Remove?
  async applyWithResume(data: {
    candidateId: number;
    jobId: number;
    resumePath: string;
  }) {
    const candidate = await this.prisma.user.findUnique({
      where: { id: data.candidateId },
    });
    if (!candidate) {
      throw new Error(`Candidate with ID ${data.candidateId} does not exist.`);
    }

    const job = await this.prisma.job.findUnique({
      where: { id: data.jobId },
    });
    if (!job) {
      throw new Error(`Job with ID ${data.jobId} does not exist.`);
    }

    const application = await this.prisma.application.create({
      data: {
        candidateId: data.candidateId,
        jobId: data.jobId,
        resumePath: data.resumePath,
        status: 'PENDING',
      },
      include: {
        job: true,
      },
    });

    this.notificationsGateway.sendNotification('newApplication', {
      jobId: data.jobId,
      candidateId: data.candidateId,
      applicationId: application.id,
    });

    return application;
  }
}
