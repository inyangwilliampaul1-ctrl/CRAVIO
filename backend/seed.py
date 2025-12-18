import logging
import uuid
import random
import json
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy import create_engine, MetaData, Table, Column, String, Float, DateTime, Boolean, Integer, Enum, ForeignKey, insert, select, text

# -- CONFIGURATION --
DATABASE_URL = "sqlite:///dev.db"  # Using SQLite as per project config (override with postgresql://... if needed)
LOCALE = 'en_NG'

# Initialize Faker
fake = Faker(LOCALE)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_db(engine):
    """
    Reflects existing tables from the database.
    Assumes tables are already created via Prisma Migrate.
    """
    metadata = MetaData()
    metadata.reflect(bind=engine)
    return metadata

def clear_data(conn, metadata):
    """
    Clears all data from the tables to ensure a fresh seed.
    """
    logger.info("Clearing existing data...")
    # Order matters for foreign keys
    tables = ['OrderItem', 'Order', 'MenuItem', 'VendorProfile', 'User']
    
    # Disable foreign key checks for SQLite to allow mass deletion might be needed, 
    # but strictly following order should work.
    # For SQLite specifically:
    conn.execute(text("PRAGMA foreign_keys = OFF"))
    
    for table_name in tables:
        if table_name in metadata.tables:
            conn.execute(metadata.tables[table_name].delete())
            logger.info(f"Cleared {table_name}")
            
    conn.execute(text("PRAGMA foreign_keys = ON"))

def generate_users(conn, user_table, role, count):
    """
    Generates users with a specific role.
    """
    logger.info(f"Generating {count} {role} users...")
    users = []
    
    # Lagos approximate center
    LAGOS_LAT = 6.5244
    LAGOS_LNG = 3.3792
    
    for _ in range(count):
        profile = fake.simple_profile()
        phone = f"+234{fake.msisdn()[4:]}"
        
        user_id = str(uuid.uuid4())
        
        user_data = {
            "id": user_id,
            "email": profile['mail'] if role != 'VENDOR' else f"vendor_{uuid.uuid4().hex[:6]}@example.com", # Ensure unique
            "phone": phone,
            "password": "hashed_password_placeholder", # In a real app, hash this!
            "fullName": fake.name(),
            "role": role,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
            "currentLat": None,
            "currentLng": None,
            "cashBalance": 0.0
        }
        
        if role == 'COURIER':
            # Random location within small radius of Lagos
            user_data["currentLat"] = LAGOS_LAT + random.uniform(-0.05, 0.05)
            user_data["currentLng"] = LAGOS_LNG + random.uniform(-0.05, 0.05)
            user_data["cashBalance"] = 0.0
            
        users.append(user_data)
        
    if conn and user_table is not None:
        conn.execute(insert(user_table), users)
        logger.info(f"Inserted {len(users)} {role} users")
    else:
        logger.info(f"Generated {len(users)} {role} users (Offline)")
    
    # Serialize dates for JSON export
    for u in users:
        u["createdAt"] = u["createdAt"].isoformat()
        u["updatedAt"] = u["updatedAt"].isoformat()
        
    return [u["id"] for u in users], users

def generate_vendors(conn, metadata, owner_ids):
    """
    Generates vendor profiles for the given owner IDs.
    """
    logger.info("Generating Vendor Profiles...")
    if metadata:
        vendor_table = metadata.tables['VendorProfile']
    vendor_ids = []
    
    lagos_areas = ["Ikeja", "Lekki", "Yaba", "Victoria Island", "Surulere", "Marylnad"]
    suffixes = ["Kitchen", "Grills", "Bistro", "Foods", "Lounge", "Place"]
    
    vendors_data = []
    
    for owner_id in owner_ids:
        vendor_id = str(uuid.uuid4())
        name = f"{fake.first_name()}'s {random.choice(suffixes)}"
        if random.random() > 0.7:
             name = f"Lagos {random.choice(['Island', 'Mainland'])} {random.choice(suffixes)}"

        
        data = {
            "id": vendor_id,
            "userId": owner_id,
            "name": name,
            "location": random.choice(lagos_areas),
            "address": fake.address(),
            "status": random.choice(["PENDING", "APPROVED", "APPROVED", "APPROVED"]), # Weighted towards APPROVED
            "rating": round(random.uniform(3.5, 5.0), 1),
            "category": "African" if "Kitchen" in name else "Continental",
            "isOpen": True,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        vendors_data.append(data)
        vendor_ids.append(vendor_id)
        
    if conn and metadata:
        vendor_table = metadata.tables['VendorProfile']
        conn.execute(insert(vendor_table), vendors_data)
        logger.info(f"Inserted {len(vendors_data)} vendors")
    else:
        logger.info(f"Generated {len(vendors_data)} vendors (Offline)")
    return vendors_data # Return full data to access status later if needed

def generate_menu_items(conn, metadata, vendor_ids):
    """
    Generates menu items for each vendor.
    """
    logger.info("Generating Menu Items...")
    if metadata:
        menu_table = metadata.tables['MenuItem']
    items_data = []
    all_item_ids = []

    categories = {
        "SWALLOW": ["Pounded Yam & Egusi", "Amala & Ewedu", "Eba & Okro", "Semovita & Ogbono"],
        "RICE": ["Jollof Rice", "Fried Rice", "Coconut Rice", "Ofada Rice"],
        "GRILLS": ["Suya Platter", "Grilled Fish", "Peppered Chicken", "Asun"],
        "SOUPS": ["Pepper Soup", "Goat Meat Pepper Soup"],
        "DRINKS": ["Chapman", "Zobo", "Fresh Juice", "Soda"],
    }
    
    for vid in vendor_ids:
        # Generate 5-10 items per vendor
        num_items = random.randint(5, 10)
        
        for _ in range(num_items):
            cat_key = random.choice(list(categories.keys()))
            item_name = random.choice(categories[cat_key])
            
            # Add some variety to names
            if random.random() > 0.5:
                item_name = f"{random.choice(['Spicy', 'Special', 'Hot'])} {item_name}"

            price = round(random.uniform(2500, 8000), -2) # Round to nearest 100
            
            item_id = str(uuid.uuid4())
            data = {
                "id": item_id,
                "vendorId": vid,
                "name": item_name,
                "description": f"Delicious {item_name} prepared with fresh ingredients.",
                "price": price,
                "category": cat_key,
                "customization": "Spicy, Extra Plantain" if "Rice" in item_name else None,
                "imageUrl": "https://placehold.co/400x300?text=Food", # Placeholder
                "isAvailable": True,
                "prepTimeMinutes": random.choice([15, 20, 30, 45]),
                "rating": round(random.uniform(4.0, 5.0), 1),
                "likes": random.randint(10, 500),
                "reviews": [],
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            }
            items_data.append(data)
            all_item_ids.append((item_id, vid, price)) # Keep track of price/vendor
            
    if conn and metadata:
        conn.execute(insert(menu_table), items_data)
        logger.info(f"Inserted {len(items_data)} menu items")
    else:
        logger.info(f"Generated {len(items_data)} menu items (Offline)")
    return all_item_ids, items_data

def generate_orders(conn, metadata, customer_ids, courier_ids, item_lookup):
    """
    Generates historical and active orders.
    """
    logger.info("Generating Orders...")
    if metadata:
        order_table = metadata.tables['Order']
        order_item_table = metadata.tables['OrderItem']
    
    orders_data = []
    order_items_data = []
    
    # Mix of statuses
    # 20+ Completed
    # 5 Active
    
    # Helper to create an order
    def create_order_entry(status, is_historical=False):
        cust_id = random.choice(customer_ids)
        
        # Pick a random item to determine vendor
        # (Simplified: order from one vendor)
        # item_lookup = [(id, vendorId, price), ...]
        
        # Pick 1-3 items from the SAME vendor
        first_item = random.choice(item_lookup)
        vendor_id = first_item[1]
        
        # Filter items for this vendor
        vendor_items = [i for i in item_lookup if i[1] == vendor_id]
        selected_items = random.sample(vendor_items, k=random.randint(1, 3))
        
        total_amount = sum(i[2] for i in selected_items)
        
        order_id = str(uuid.uuid4())
        
        courier_id = None
        if status in ['RIDER_ASSIGNED', 'PICKED_UP', 'DELIVERED']:
            courier_id = random.choice(courier_ids)
            
        time_offset = timedelta(days=random.randint(1, 30)) if is_historical else timedelta(minutes=random.randint(0, 60))
        created_at = datetime.now() - time_offset
        
        order_entry = {
            "id": order_id,
            "customerId": cust_id,
            "vendorId": vendor_id,
            "courierId": courier_id,
            "status": status,
            "totalAmount": total_amount,
            "deliveryAddress": fake.address(),
            "deliveryLat": 6.5244 + random.uniform(-0.05, 0.05),
            "deliveryLng": 3.3792 + random.uniform(-0.05, 0.05),
            "createdAt": created_at,
            "updatedAt": created_at 
        }
        
        if status == 'DELIVERED':
             order_entry['updatedAt'] = created_at + timedelta(minutes=45)

        orders_data.append(order_entry)
        
        for item in selected_items:
            order_items_data.append({
                "id": str(uuid.uuid4()),
                "orderId": order_id,
                "menuItemId": item[0],
                "quantity": 1,
                "price": item[2]
            })
            
    # 1. Generate 25 Historical (DELIVERED/CANCELLED)
    for _ in range(25):
        status = random.choice(['DELIVERED', 'DELIVERED', 'DELIVERED', 'CANCELLED'])
        create_order_entry(status, is_historical=True)
        
    # 2. Generate Active Orders as requested
    active_scenarios = [
        'PLACED',             # New Order
        'READY_FOR_PICKUP',   # For Courier
        'RIDER_ASSIGNED',     # Tracking
        'PICKED_UP',          # Tracking
        'PLACED'              # Pickup mode (logic handled in main app, here status is PLACED or CONFIRMED)
    ]
    
    for status in active_scenarios:
        create_order_entry(status, is_historical=False)
        
    if conn and metadata:
        conn.execute(insert(order_table), orders_data)
        conn.execute(insert(order_item_table), order_items_data)
        logger.info(f"Inserted {len(orders_data)} orders and {len(order_items_data)} items")
    else:
        logger.info(f"Generated {len(orders_data)} orders (Offline)")
    return orders_data


def main():
    logger.info("Starting Seed Script...")
    
    # Connect
    engine = create_engine(DATABASE_URL)
    
    # JSON Export Data
    export_data = {
        "users": [],
        "vendors": [],
        "orders": []
    }
    
    logger.info("Running in Offline JSON Generation Mode...")
    
    # 1. Users
    # Pass None for connection and table to skip DB insert
    customer_ids, customer_data = generate_users(None, None, 'CUSTOMER', 50)
    courier_ids, courier_data = generate_users(None, None, 'COURIER', 10)
    vendor_owner_ids, vendor_owner_data = generate_users(None, None, 'VENDOR', 15)
    
    export_data["users"] = customer_data + courier_data + vendor_owner_data
    
    # 2. Vendor Profiles
    # Mock metadata or pass None
    vendor_profiles = generate_vendors(None, None, vendor_owner_ids)
    vendor_ids = [v['id'] for v in vendor_profiles]
    
    # 3. Menu Items
    all_items_lookup, all_items_data = generate_menu_items(None, None, vendor_ids)
    
    # Nest items into vendors for easier frontend consumption
    for vendor in vendor_profiles:
        vendor["menuItems"] = [item for item in all_items_data if item["vendorId"] == vendor["id"]]
        # Serialize dates for JSON
        vendor["createdAt"] = vendor["createdAt"].isoformat()
        vendor["updatedAt"] = vendor["updatedAt"].isoformat()
        for item in vendor["menuItems"]:
                item["createdAt"] = item["createdAt"].isoformat()
                item["updatedAt"] = item["updatedAt"].isoformat()

    export_data["vendors"] = vendor_profiles
    
    # 4. Orders
    orders_data = generate_orders(None, None, customer_ids, courier_ids, all_items_lookup)
    
    for order in orders_data:
            order["createdAt"] = order["createdAt"].isoformat()
            order["updatedAt"] = order["updatedAt"].isoformat()

    export_data["orders"] = orders_data
        
    # Write JSON
    with open('mock_data.json', 'w') as f:
        json.dump(export_data, f, indent=2)
        
    logger.info("Offline Seeding Complete & mock_data.json exported!")

if __name__ == "__main__":
    main()
