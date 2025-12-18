import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { EventsGateway } from './events/events.gateway';
import { CustomerModule } from './customer/customer.module';
import { CourierModule } from './courier/courier.module';
import { WalletModule } from './wallet/wallet.module';

import { GroupCartModule } from './group-cart/group-cart.module';

@Module({
  imports: [
    PrismaModule, UsersModule, AuthModule, VendorModule, CustomerModule, CourierModule, WalletModule,
    GroupCartModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule { }
