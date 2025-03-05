import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationRepository } from '../repositories/application.repository';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationFilterDto,
  ApplicationStatus,
} from '../dtos/application.dto';
import { Application } from '@prisma/client';
import { UsersService } from '../../users/users.service';

/**
 * Service handling application business logic
 */
@Injectable()
export class ApplicationService {
  // Status to progress mapping as a private static readonly - better type safety and immutability
  private static readonly STATUS_PROGRESS_MAP: Record<
    ApplicationStatus,
    number
  > = {
    [ApplicationStatus.PENDING]: 20,
    [ApplicationStatus.SCREENING]: 40,
    [ApplicationStatus.INTERVIEWING]: 60,
    [ApplicationStatus.OFFER_SENT]: 80,
    [ApplicationStatus.OFFER_ACCEPTED]: 90,
    [ApplicationStatus.HIRED]: 100,
    [ApplicationStatus.REJECTED]: 100,
    [ApplicationStatus.WITHDRAWN]: 100,
  };

  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Get all applications with optional filtering
   * @param filters Optional filter criteria
   */
  async getAllApplications(
    filters?: ApplicationFilterDto,
  ): Promise<Application[]> {
    return this.applicationRepository.findAll(filters);
  }

  /**
   * Get application by ID
   * @param id Application ID
   * @throws {NotFoundException} If application not found
   */
  async getApplicationById(id: number): Promise<Application> {
    const application = await this.findApplicationOrThrow(id);
    return application;
  }

  /**
   * Update application status
   * @param id Application ID
   * @param status New application status
   * @throws {NotFoundException} If application not found
   */
  async updateApplicationStatus(
    id: number,
    status: ApplicationStatus,
  ): Promise<Application> {
    await this.findApplicationOrThrow(id);
    return this.applicationRepository.updateStatus(id, status);
  }

  /**
   * Add comment to an application
   * @param id Application ID
   * @param comment Comment text
   * @param userId User ID of the commenter
   * @throws {NotFoundException} If application or user not found
   */
  async addApplicationComment(
    id: number,
    comment: string,
    userId: number,
  ): Promise<Application> {
    await this.findApplicationOrThrow(id);

    try {
      const user = await this.usersService.findById(userId);
      return this.applicationRepository.addComment(
        id,
        comment,
        userId,
        // Using type assertion to access the name property
        (user as any).name,
      );
    } catch (error) {
      // Re-throw user not found errors
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Log and rethrow other errors
      throw error;
    }
  }

  /**
   * Create a new application
   * @param data Application data
   */
  async createApplication(data: CreateApplicationDto): Promise<Application> {
    return this.applicationRepository.create(data);
  }

  /**
   * Update an application
   * @param id Application ID
   * @param data Updated application data
   * @throws {NotFoundException} If application not found
   */
  async updateApplication(
    id: number,
    data: UpdateApplicationDto,
  ): Promise<Application> {
    await this.findApplicationOrThrow(id);
    return this.applicationRepository.update(id, data);
  }

  /**
   * Delete an application
   * @param id Application ID
   * @throws {NotFoundException} If application not found
   */
  async deleteApplication(id: number): Promise<Application> {
    await this.findApplicationOrThrow(id);
    return this.applicationRepository.delete(id);
  }

  /**
   * Calculate application progress based on status
   * @param status Application status
   * @returns Progress percentage (0-100)
   */
  calculateApplicationProgress(status: ApplicationStatus): number {
    return ApplicationService.STATUS_PROGRESS_MAP[status] || 0;
  }

  /**
   * Helper method to find an application or throw not found exception
   * @param id Application ID
   * @private
   * @throws {NotFoundException} If application not found
   */
  private async findApplicationOrThrow(id: number): Promise<Application> {
    const application = await this.applicationRepository.findById(id);

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }
}
