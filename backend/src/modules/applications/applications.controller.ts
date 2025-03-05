import {
  Request,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('upload-resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || '/tmp/uploads',
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
        destination: process.env.UPLOAD_DIR || '/tmp/uploads',
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

  @Public()
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.match(
            /\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
          )
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF and DOCX files are allowed!'), false);
        }
      },
    }),
  )
  async apply(
    @Body()
    body: {
      jobId: string;
      applicantId?: string;
      name?: string;
      email?: string;
      phone?: string;
      note?: string;
      coverLetter?: string;
    },
    @UploadedFile() resume: Express.Multer.File,
  ) {
    const { jobId, applicantId, name, email, phone, note, coverLetter } = body;

    return this.applicationsService.createApplication({
      jobId: parseInt(jobId, 10),
      applicantId: applicantId ? parseInt(applicantId, 10) : undefined,
      name,
      email,
      phone,
      note,
      coverLetter,
      resumePath: resume ? resume.path : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-applications')
  async getMyApplications(@Request() req) {
    return this.applicationsService.getApplicationsByCandidate(req.user.userId);
  }

  @Public()
  @Get('uuid/:uuid')
  async getApplicationByUuid(@Param('uuid') uuid: string) {
    // Note: This endpoint now accepts either a numeric ID or a legacy UUID
    // It's maintained for backward compatibility but will convert UUIDs to IDs internally
    return this.applicationsService.getApplicationByUuid(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('external')
  async addExternalApplication(
    @Body()
    data: {
      name: string;
      email: string;
      phone?: string;
      jobId: number;
      source: string;
      status: string;
      resumePath?: string;
      coverLetter?: string;
      note?: string;
    },
  ) {
    return this.applicationsService.createApplication({
      jobId: data.jobId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      note: data.note,
      coverLetter: data.coverLetter,
      resumePath: data.resumePath,
      status: data.status,
      source: data.source,
    });
  }
}
