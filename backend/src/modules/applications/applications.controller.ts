import {
  Request,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('upload-resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  uploadResume(@UploadedFile() file: Express.Multer.File) {
    console.log(file);

    return {
      message: 'File uploaded successfully',
      file,
    };
  }

  @Post('apply-with-resume')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async applyWithResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new Error('Resume file is required.');
    }

    const user = req.user;
    if (!user) {
      throw new Error('User not authenticated.');
    }

    const application = await this.applicationsService.applyWithResume({
      candidateId: user.userId,
      jobId: +req.body.jobId,
      resumePath: file.path,
    });

    return {
      message: 'Application submitted successfully',
      data: application,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async applyForJob(
    @UploadedFile() resume: Express.Multer.File,
    @Body() body: { jobId: number },
    @Request() req,
  ) {
    return this.applicationsService.create({
      candidateId: req.user.id,
      jobId: body.jobId,
      status: 'PENDING',
      resumePath: resume.path,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-applications')
  async getMyApplications(@Request() req) {
    return this.applicationsService.getApplicationsByCandidate(req.user.id);
  }
}
