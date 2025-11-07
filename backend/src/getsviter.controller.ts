import { Controller, Get } from '@nestjs/common';
import axios from 'axios';
import { ProductsService } from './products/products.service';
import { CreateProductDto } from './products/dto/create-product.dto';

@Controller()
export class GetSviterController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('getsviter')
  async syncFromExternal() {
    const base = 'https://silasvitera.up.railway.app';

    const [productsRes, filtersRes] = await Promise.all([
      axios.get(`${base}/api/products`, { timeout: 15000 }).catch((e: any) => {
        throw new Error(`Fetch products failed: ${e?.message || e}`);
      }),
      axios.get(`${base}/api/filters`, { timeout: 15000 }).catch((e: any) => {
        throw new Error(`Fetch filters failed: ${e?.message || e}`);
      }),
    ]);

    const raw = productsRes.data?.products || [];
    const mapped: CreateProductDto[] = raw.map((p: any) => {
      const slug = `sviter-${p.number}`.toLowerCase();
      const images = (Array.isArray(p.photos) ? p.photos : p.photo ? [p.photo] : [])
        .map((f: string) => `${base}/api/image/${f}`);

      const dto: CreateProductDto = {
        title: p.product_name || `${p.category || 'Свитер'} ${p.number}`,
        slug,
        price: Number(p.price) || 0,
        images,
        sizes: p.size ? [String(p.size)] : [],
        colors: [],
        description: p.full_text,
        category: p.category || 'Свитер',
        stock: 1,
        featured: false,
      };
      return dto;
    });

    const results = [] as any[];
    for (const dto of mapped) {
      const saved = await this.productsService.upsertBySlug(dto);
      results.push({ slug: dto.slug, _id: saved?._id });
    }

    const filters = filtersRes.data || {};
    return {
      ok: true,
      imported: results.length,
      slugs: results.map((r) => r.slug).slice(0, 50),
      filters,
    };
  }
}
