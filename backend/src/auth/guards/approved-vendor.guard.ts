
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsApprovedVendorGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user?.role !== 'VENDOR') {
            // If not a vendor, this guard shouldn't really apply, OR it should return false.
            // Assuming this guard is stacked AFTER RolesGuard('VENDOR')
            return false;
        }

        if (user.vendorStatus === 'APPROVED') {
            return true;
        }

        throw new ForbiddenException('Vendor account is PENDING approval.');
    }
}
