import { Injectable } from '@nestjs/common';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.companySettings.findFirst();
    if (!settings) {
      settings = await this.prisma.companySettings.create({
        data: {
          companyName: 'Default Company',
          growthRate: 0.1, // Default to 10% growth rate
        },
      });
    }
    return settings;
  }

  async updateSettings(updateDto: UpdateCompanySettingsDto) {
    const settings = await this.getSettings();

    if (!settings || !settings.id) {
      throw new Error('Company settings not found');
    }

    // Clean and validate the data before updating
    const cleanedData: any = {};

    // Handle string fields
    if (updateDto.companyName !== undefined)
      cleanedData.companyName = String(updateDto.companyName);
    if (updateDto.industry !== undefined)
      cleanedData.industry = updateDto.industry
        ? String(updateDto.industry)
        : null;
    if (updateDto.website !== undefined)
      cleanedData.website = updateDto.website
        ? String(updateDto.website)
        : null;
    if (updateDto.description !== undefined)
      cleanedData.description = updateDto.description
        ? String(updateDto.description)
        : null;
    if (updateDto.logoUrl !== undefined)
      cleanedData.logoUrl = updateDto.logoUrl
        ? String(updateDto.logoUrl)
        : null;
    if (updateDto.primaryColor !== undefined)
      cleanedData.primaryColor = updateDto.primaryColor
        ? String(updateDto.primaryColor)
        : null;
    if (updateDto.contactEmail !== undefined)
      cleanedData.contactEmail = updateDto.contactEmail
        ? String(updateDto.contactEmail)
        : null;

    // Handle boolean field
    if (updateDto.showNameInNav !== undefined)
      cleanedData.showNameInNav = Boolean(updateDto.showNameInNav);

    // Handle growth rate field
    if (updateDto.growthRate !== undefined) {
      const growthRate = Number(updateDto.growthRate);
      // Ensure growth rate is between 0.01 and 1 (1% to 100%)
      if (!isNaN(growthRate) && growthRate >= 0.01 && growthRate <= 1) {
        cleanedData.growthRate = growthRate;
      }
    }

    // Add updatedAt timestamp
    cleanedData.updatedAt = new Date();

    return this.prisma.companySettings.update({
      where: { id: settings.id },
      data: cleanedData,
    });
  }
}
