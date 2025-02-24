import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}
