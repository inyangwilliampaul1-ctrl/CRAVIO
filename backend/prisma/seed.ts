import { PrismaClient } from '@prisma/client';
import { Faker, en_NG, en } from '@faker-js/faker';

const prisma = new PrismaClient({} as any);
const faker = new Faker({ locale: [en_NG, en] });

async function main() {
    console.log('Seeding database...');

    // 1. Create Customers
    const customers = [];
    for (let i = 0; i < 50; i++) {
        const customer = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                phone: faker.phone.number({ style: 'international' }),
                password: 'password123', // In real app, hash this!
                fullName: faker.person.fullName(),
                role: "CUSTOMER",
                isVerified: true,
            },
        });
        customers.push(customer);
    }
    console.log(`Created ${customers.length} customers.`);

    // 2. Create Couriers
    const couriers = [];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                phone: faker.phone.number({ style: 'international' }),
                password: 'password123',
                fullName: faker.person.fullName(),
                role: "COURIER",
                isVerified: true,
            },
        });

        const courier = await prisma.courierProfile.create({
            data: {
                userId: user.id,
                vehicleType: faker.helpers.arrayElement(['Bike', 'Car', 'Bicycle']),
                isOnline: faker.datatype.boolean(),
                currentLat: 6.5244 + (Math.random() - 0.5) * 0.1, // Near Lagos
                currentLng: 3.3792 + (Math.random() - 0.5) * 0.1,
                cashBalance: 0,
            },
        });
        couriers.push(courier);
    }
    console.log(`Created ${couriers.length} couriers.`);

    // 3. Create Vendors
    const vendors = [];
    const vendorNames = [
        "Lagos Island Grills", "Mama Nkechi’s Kitchen", "Iya Moria Bukka",
        "Taste of Calabar", "Naija Delights", "Lekki Lounge",
        "Mainland Spice", "Victoria's Bistro", "Yaba Suya Spot", "Egusi Express"
    ];

    for (const name of vendorNames) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                phone: faker.phone.number({ style: 'international' }),
                password: 'password123',
                fullName: `Owner of ${name}`,
                role: "VENDOR",
                isVerified: true,
            },
        });

        const vendor = await prisma.vendorProfile.create({
            data: {
                userId: user.id,
                name: name,
                location: faker.location.streetAddress(),
                address: "Lagos, Nigeria",
                status: faker.helpers.arrayElement(["APPROVED", "PENDING"]),
                bvn: faker.string.numeric(11),
                rcNumber: `RC${faker.string.numeric(6)}`,
            },
        });
        vendors.push(vendor);

        // Create Categories and Menu Items
        const categoriesList = ["SWALLOW", "SOUPS", "RICE", "GRILLS", "DRINKS", "OTHER"];
        const createdCategories = [];

        for (const catName of categoriesList) {
            const cat = await prisma.category.create({
                data: {
                    name: catName,
                    vendorId: vendor.id
                }
            });
            createdCategories.push(cat);
        }

        for (let j = 0; j < 5; j++) {
            await prisma.menuItem.create({
                data: {
                    vendorId: vendor.id,
                    categoryId: faker.helpers.arrayElement(createdCategories).id,
                    name: faker.food.dish(), // Generic dish, close enough for demo
                    description: faker.food.description(),
                    price: parseFloat(faker.commerce.price({ min: 2500, max: 8000 })),
                    imageUrl: "https://placehold.co/400x300?text=Food",
                    customizationConfig: JSON.stringify({ options: ["Spicy", "Extra Sauce"] })
                },
            });
        }
    }
    console.log(`Created ${vendors.length} vendors.`);

    // 4. Create Historical Orders
    const approvedVendors = vendors.filter(v => v.status === "APPROVED");
    if (approvedVendors.length > 0) {
        for (let i = 0; i < 20; i++) {
            const vendor = faker.helpers.arrayElement(approvedVendors);
            const customer = faker.helpers.arrayElement(customers);

            const foodSubtotal = parseFloat(faker.commerce.price({ min: 3000, max: 15000 }));
            const deliveryFee = 1500;
            const taxAmount = foodSubtotal * 0.075;
            const totalAmount = foodSubtotal + deliveryFee + taxAmount;

            await prisma.order.create({
                data: {
                    customerId: customer.id,
                    vendorId: vendor.id,
                    status: "DELIVERED",
                    deliveryMode: "DELIVERY",
                    paymentMethod: "CARD",
                    foodSubtotal,
                    deliveryFee,
                    taxAmount,
                    totalAmount,
                    amountPaidUpfront: totalAmount,
                    amountDueOnDelivery: 0,
                    deliveryAddress: faker.location.streetAddress(),
                    deliveryLat: 6.5244,
                    deliveryLng: 3.3792,
                }
            });
        }
    }

    // 5. Create Active Orders
    // PLACED
    const subtotal1 = 5000;
    const tax1 = subtotal1 * 0.075;
    const total1 = subtotal1 + 1000 + tax1;

    await prisma.order.create({
        data: {
            customerId: customers[0].id,
            vendorId: approvedVendors[0].id,
            status: "PLACED",
            deliveryMode: "DELIVERY",
            paymentMethod: "CARD",
            foodSubtotal: subtotal1,
            deliveryFee: 1000,
            taxAmount: tax1,
            totalAmount: total1,
            amountPaidUpfront: total1,
            amountDueOnDelivery: 0,
            deliveryAddress: "123 Lagos Way",
        }
    });

    // RIDER_ASSIGNED
    const subtotal2 = 7500;
    const tax2 = subtotal2 * 0.075;
    const total2 = subtotal2 + 1200 + tax2;

    await prisma.order.create({
        data: {
            customerId: customers[1].id,
            vendorId: approvedVendors[0].id,
            courierId: couriers[0].id,
            status: "ACCEPTED",
            deliveryMode: "DELIVERY",
            paymentMethod: "CARD",
            foodSubtotal: subtotal2,
            deliveryFee: 1200,
            taxAmount: tax2,
            totalAmount: total2,
            amountPaidUpfront: total2,
            amountDueOnDelivery: 0,
            deliveryAddress: "456 Victoria Island",
        }
    });


    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
