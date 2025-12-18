
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Deep Verification of Implementation ---');

    // 1. Verify Catalog (Categories & FoodItems)
    console.log('\n[1. Catalog & Food Items]');
    const vendorWithMenu = await prisma.vendorProfile.findFirst({
        include: {
            categories: true,
            menuItems: { take: 1 }
        }
    });

    if (vendorWithMenu) {
        console.log(`Vendor: ${vendorWithMenu.name}`);
        console.log(`Categories: ${vendorWithMenu.categories.map(c => c.name).join(', ')}`);

        const item = vendorWithMenu.menuItems[0];
        if (item) {
            console.log(`Sample Item: ${item.name}`);
            console.log(`- CategoryId: ${item.categoryId}`);
            console.log(`- Customization: ${item.customizationConfig}`);
            console.log(`- Price: ${item.price}`);
        }
    }

    // 2. Verify Orders (Financial Engine)
    console.log('\n[2. Orders & Financial Engine]');
    const richOrder = await prisma.order.findFirst({
        where: { status: 'PLACED' },
        include: {
            customer: { select: { fullName: true } }
        }
    });

    if (richOrder) {
        console.log(`Order ID: ${richOrder.id}`);
        console.log(`Customer: ${richOrder.customer.fullName}`);
        console.log(`Status: ${richOrder.status}`);
        console.log(`Delivery Mode: ${richOrder.deliveryMode}`);   // Command: delivery_mode
        console.log(`Payment Method: ${richOrder.paymentMethod}`); // Command: payment_method

        console.log('\n--- Financial Breakdown ---');
        console.log(`Food Subtotal:      ₦${richOrder.foodSubtotal}`);      // Command: food_subtotal
        console.log(`Delivery Fee:       ₦${richOrder.deliveryFee}`);       // Command: delivery_fee
        console.log(`Tax Amount (7.5%):  ₦${richOrder.taxAmount}`);         // Command: tax_amount
        console.log(`Total Amount:       ₦${richOrder.totalAmount}`);       // Command: total_amount
        console.log(`Paid Upfront:       ₦${richOrder.amountPaidUpfront}`); // Command: amount_paid_upfront
        console.log(`Due on Delivery:    ₦${richOrder.amountDueOnDelivery}`);// Command: amount_due_on_delivery
    } else {
        console.log('No PLACED order found to verify.');
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
