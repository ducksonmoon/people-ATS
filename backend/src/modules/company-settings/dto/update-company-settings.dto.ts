import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsUrl({}, { message: 'Website must be a valid URL.' })
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Logo URL must be a valid URL.' })
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsEmail({}, { message: 'Contact email must be a valid email address.' })
  @IsOptional()
  contactEmail?: string;

  @IsBoolean()
  @IsOptional()
  showNameInNav?: boolean;

  @IsNumber()
  @Min(0.01, { message: 'Growth rate must be at least 1%' })
  @Max(1, { message: 'Growth rate must be at most 100%' })
  @IsOptional()
  growthRate?: number;
}
