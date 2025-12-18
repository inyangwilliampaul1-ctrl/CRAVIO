import { Module } from '@nestjs/common';
import { GroupCartController } from './group-cart.controller';
import { GroupCartService } from './group-cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [PrismaModule, WalletModule],
    controllers: [GroupCartController],
    providers: [GroupCartService],
})
export class GroupCartModule { }
