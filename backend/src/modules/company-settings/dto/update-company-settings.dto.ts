import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

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
}
