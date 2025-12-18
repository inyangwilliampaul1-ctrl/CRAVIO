import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { CourierModule } from '../courier/courier.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule, CourierModule],
  controllers: [VendorController],
  providers: [VendorService]
})
export class VendorModule { }
