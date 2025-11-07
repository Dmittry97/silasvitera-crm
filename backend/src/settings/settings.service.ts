import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Settings.name) private settingsModel: Model<Settings>) {}

  async getSettings() {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      // Create default settings if none exist
      settings = new this.settingsModel({
        categories: ['Свитер', 'Двусторонний сарафан', 'Рубашка'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      });
      await settings.save();
    }
    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    const settings = await this.getSettings();
    Object.assign(settings, updateSettingsDto);
    return settings.save();
  }
}
