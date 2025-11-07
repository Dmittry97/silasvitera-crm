import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    const created = new this.productModel(dto);
    return created.save();
  }

  async findAll() {
    return this.productModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.productModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Product not found');
    return doc;
  }

  async update(id: string, dto: UpdateProductDto) {
    const doc = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Product not found');
    return doc;
  }

  async remove(id: string) {
    const res = await this.productModel.findByIdAndDelete(id).lean();
    if (!res) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  async upsertBySlug(createProductDto: CreateProductDto) {
    const existing = await this.productModel.findOne({ slug: createProductDto.slug }).exec();
    if (existing) {
      Object.assign(existing, createProductDto);
      return existing.save();
    }
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async reserveProduct(id: string, userId: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if already reserved by current user - just extend the reservation
    if (product.isReserved && product.reservedBy === userId) {
      const reservedUntil = new Date();
      reservedUntil.setMinutes(reservedUntil.getMinutes() + 20);
      product.reservedUntil = reservedUntil;
      return product.save();
    }
    
    // Check if already reserved by someone else and not expired
    if (product.isReserved && product.reservedUntil && product.reservedUntil > new Date()) {
      throw new Error('Product is already reserved by another user');
    }

    // Reserve for 20 minutes
    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 20);

    product.isReserved = true;
    product.reservedUntil = reservedUntil;
    product.reservedBy = userId;

    return product.save();
  }

  async unreserveProduct(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new Error('Product not found');
    }

    product.isReserved = false;
    product.reservedUntil = undefined;
    product.reservedBy = undefined;

    return product.save();
  }

  async cleanExpiredReservations() {
    const now = new Date();
    await this.productModel.updateMany(
      {
        isReserved: true,
        reservedUntil: { $lt: now },
      },
      {
        $set: {
          isReserved: false,
          reservedUntil: null,
          reservedBy: null,
        },
      }
    ).exec();
  }
}
