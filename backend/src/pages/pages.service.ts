import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().exec();
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.pageModel.findOne({ slug }).exec();
  }

  async update(slug: string, updatePageDto: UpdatePageDto): Promise<Page | null> {
    return this.pageModel.findOneAndUpdate({ slug }, updatePageDto, { new: true }).exec();
  }

  async initializeDefaultPages(): Promise<void> {
    const defaultPages = [
      {
        slug: 'about',
        title: 'О нас',
        content: 'Уникальные свитеры ручной работы с авторскими принтами и дизайном.',
        isActive: true,
      },
      {
        slug: 'contacts',
        title: 'Контакты',
        content: 'Email: info@silasvitera.ru\nTelegram: @silasvitera',
        isActive: true,
      },
      {
        slug: 'delivery',
        title: 'Доставка и оплата',
        content: 'Информация о доставке и способах оплаты.',
        isActive: true,
      },
      {
        slug: 'returns',
        title: 'Возврат и обмен',
        content: 'Условия возврата и обмена товаров.',
        isActive: true,
      },
      {
        slug: 'privacy',
        title: 'Политика конфиденциальности',
        content: 'Политика обработки персональных данных.',
        isActive: true,
      },
    ];

    for (const page of defaultPages) {
      const exists = await this.pageModel.findOne({ slug: page.slug });
      if (!exists) {
        await this.pageModel.create(page);
      }
    }
  }
}
