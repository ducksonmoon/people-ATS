import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { Public } from '../auth/public.decorator';

@Controller('company-settings')
export class CompanySettingsController {
  constructor(
    private readonly companySettingsService: CompanySettingsService,
  ) {}

  @Public()
  @Get()
  async getSettings() {
    return this.companySettingsService.getSettings();
  }

  @Patch()
  async updateSettings(@Body() updateDto: UpdateCompanySettingsDto) {
    return this.companySettingsService.updateSettings(updateDto);
  }
}
