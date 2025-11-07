import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { PagesModule } from './pages/pages.module';
import { GetSviterController } from './getsviter.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/silasvitera'),
    ProductsModule,
    AuthModule,
    OrdersModule,
    SettingsModule,
    UsersModule,
    PagesModule,
  ],
  controllers: [GetSviterController],
})
export class AppModule {}
