import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { JobRepository } from '../repositories/job.repository';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from '../dtos/job.dto';
import { Job } from '@prisma/client';

/**
 * Service responsible for job requisition business logic
 */
@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(private readonly jobRepository: JobRepository) {}

  /**
   * Create a new job requisition
   * @param data Job data
   * @param userId ID of user creating the job
   * @returns Created job
   */
  async createJobRequisition(data: CreateJobDto, userId: number): Promise<Job> {
    try {
      this.logger.log(`Creating job requisition by user ${userId}`);
      return await this.jobRepository.create(data, userId);
    } catch (error) {
      this.logger.error(
        `Failed to create job requisition: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update an existing job requisition
   * @param id Job ID
   * @param data Updated job data
   * @param userId ID of user updating the job
   * @returns Updated job
   * @throws NotFoundException if job not found
   */
  async updateJobRequisition(
    id: number,
    data: UpdateJobDto,
    userId: number,
  ): Promise<Job> {
    try {
      this.logger.log(`Updating job requisition ${id} by user ${userId}`);
      await this.findJobOrThrow(id);
      return await this.jobRepository.update(id, data);
    } catch (error) {
      this.logger.error(
        `Failed to update job requisition ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a job requisition and its related applications
   * @param id Job ID
   * @returns Deleted job
   * @throws NotFoundException if job not found
   */
  async deleteJobRequisition(id: number): Promise<Job> {
    try {
      this.logger.log(`Deleting job requisition ${id}`);
      await this.findJobOrThrow(id);

      // Check if job has applications using Prisma's count
      const applicationCount =
        await this.jobRepository.countApplicationsByJobId(id);

      if (applicationCount > 0) {
        this.logger.log(
          `Deleting ${applicationCount} applications for job ${id}`,
        );
        await this.jobRepository.deleteApplicationsByJobId(id);
      }

      return await this.jobRepository.delete(id);
    } catch (error) {
      this.logger.error(
        `Failed to delete job requisition ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a job requisition by ID
   * @param id Job ID
   * @returns Job details
   * @throws NotFoundException if job not found
   */
  async getJobRequisition(id: number): Promise<Job> {
    try {
      this.logger.log(`Fetching job requisition ${id}`);
      return await this.findJobOrThrow(id);
    } catch (error) {
      this.logger.error(
        `Failed to fetch job requisition ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all job requisitions with optional filtering
   * @param filters Optional filters to apply
   * @returns Array of jobs matching the filters
   */
  async getAllJobRequisitions(filters?: JobFilterDto): Promise<Job[]> {
    try {
      this.logger.log('Fetching all job requisitions with filters', filters);
      return await this.jobRepository.findAll(filters);
    } catch (error) {
      this.logger.error(
        `Failed to fetch job requisitions: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Helper method to find a job by ID or throw an exception
   * @param id Job ID
   * @returns Job if found
   * @throws NotFoundException if job not found
   * @private
   */
  private async findJobOrThrow(id: number): Promise<Job> {
    const job = await this.jobRepository.findById(id);

    if (!job) {
      this.logger.warn(`Job with ID ${id} not found`);
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }
}
