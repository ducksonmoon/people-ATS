import { Injectable, NotFoundException } from '@nestjs/common';
import { InterviewRepository } from '../repositories/interview.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import {
  ScheduleInterviewDto,
  UpdateInterviewDto,
  InterviewFilterDto,
} from '../dtos/interview.dto';
import { Interview } from '@prisma/client';

// Define a type that includes the application relation for better type safety
interface InterviewWithRelations extends Interview {
  application?: {
    id: number;
    status: string;
    // Add other properties as needed
  };
}

@Injectable()
export class InterviewService {
  constructor(
    private interviewRepository: InterviewRepository,
    private applicationRepository: ApplicationRepository,
  ) {}

  /**
   * Schedule a new interview for an application
   * @param applicationId The ID of the application to schedule an interview for
   * @param data The interview data
   * @param userId The ID of the user scheduling the interview
   * @returns The newly created interview
   */
  async scheduleInterview(
    applicationId: number,
    data: ScheduleInterviewDto,
    userId: number,
  ): Promise<Interview> {
    // Get the application first to check if it exists
    const application =
      await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Schedule the interview
    const interview = await this.interviewRepository.schedule(
      applicationId,
      data,
      userId,
    );

    // Update the application status to INTERVIEWING if it's not already
    if (application.status === 'PENDING') {
      await this.updateApplicationStatus(
        applicationId,
        'INTERVIEWING',
        new Date(data.scheduledAt),
      );
    } else {
      // Just update the next interview date
      await this.updateApplicationStatus(
        applicationId,
        undefined,
        new Date(data.scheduledAt),
      );
    }

    return interview;
  }

  /**
   * Update an existing interview
   * @param id The ID of the interview to update
   * @param data The updated interview data
   * @param userId The ID of the user updating the interview
   * @returns The updated interview
   */
  async updateInterview(
    id: number,
    data: UpdateInterviewDto,
    userId: number,
  ): Promise<Interview> {
    // Get the interview with relations
    const interview = (await this.interviewRepository.findById(
      id,
    )) as InterviewWithRelations;

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    const updatedInterview = await this.interviewRepository.update(id, data);

    // If the interview is completed, check if there are other scheduled interviews
    if (
      data.status === 'COMPLETED' &&
      interview.application?.status === 'INTERVIEWING'
    ) {
      const applicationId = interview.applicationId;
      const pendingInterviews =
        await this.interviewRepository.findPendingInterviewsByApplicationId(
          applicationId,
        );

      // If no other scheduled interviews, update application status
      if (pendingInterviews.length === 0) {
        await this.updateApplicationStatus(applicationId, undefined, null);
      }
    }

    return updatedInterview;
  }

  /**
   * Get an interview by ID
   * @param id The ID of the interview to retrieve
   * @returns The interview
   */
  async getInterviewById(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findById(id);

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  /**
   * Get all interviews with optional filtering
   * @param filters Optional filters to apply
   * @param userId Optional user ID for permission filtering
   * @param userRole Optional user role for permission filtering
   * @returns Array of interviews matching the criteria
   */
  async getAllInterviews(
    filters?: InterviewFilterDto,
    userId?: number,
    userRole?: string,
  ): Promise<Interview[]> {
    return this.interviewRepository.findAll(filters, userId, userRole);
  }

  /**
   * Delete an interview
   * @param id The ID of the interview to delete
   * @returns The deleted interview
   */
  async deleteInterview(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findById(id);

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return this.interviewRepository.delete(id);
  }

  /**
   * Internal method to update an application's status after an interview
   */
  private async updateApplicationStatus(
    applicationId: number,
    status?: string,
    nextInterviewDate?: Date | null,
  ): Promise<void> {
    if (!status) return;

    await this.interviewRepository.updateApplicationAfterInterview(
      applicationId,
      status,
      nextInterviewDate,
    );
  }

  /**
   * Retrieves all users who can serve as interviewers
   * (Admin, HR, and Recruiters are eligible as interviewers)
   * @returns A list of eligible interviewers with their basic information
   */
  async getAllInterviewers(): Promise<any> {
    try {
      return await this.interviewRepository.findAllInterviewers();
    } catch (error) {
      throw error;
    }
  }
}
