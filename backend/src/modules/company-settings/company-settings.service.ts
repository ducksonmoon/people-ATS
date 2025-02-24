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
        },
      });
    }
    return settings;
  }

  async updateSettings(updateDto: UpdateCompanySettingsDto) {
    const settings = await this.getSettings();
    return this.prisma.companySettings.update({
      where: { id: settings.id },
      data: updateDto,
    });
  }
}
