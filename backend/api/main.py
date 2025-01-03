from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import mysql.connector
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, date
from fastapi import HTTPException, APIRouter, Depends
from datetime import date
import mysql.connector
from pydantic import BaseModel, EmailStr
from typing import Optional
from fastapi import HTTPException
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel


# Load environment variables
load_dotenv()

app = FastAPI()

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get allowed origins from environment variable
origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')

# CORS middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL database configuration using environment variables
DB_CONFIG = {
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'host': os.getenv('MYSQL_HOST'),
    'database': os.getenv('MYSQL_DATABASE'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),  # Default MySQL port if not set
}

# SSL configuration
ssl_config = None
ssl_ca_path = os.getenv('MYSQL_SSL_CA_PATH')
if ssl_ca_path and os.getenv('MYSQL_SSL_MODE', 'REQUIRED') == 'REQUIRED':
    ssl_config = {
        'ssl_ca': ssl_ca_path,
        'ssl_verify_cert': True,
        'ssl_disabled': False,
    }

# Check for missing required environment variables
required_env_vars = ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_DATABASE']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise Exception(f"Missing environment variables: {', '.join(missing_vars)}")


# Create a function to get the database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            **DB_CONFIG,
            ssl_ca=ssl_config.get('ssl_ca', None) if ssl_config else None,
            ssl_verify_cert=ssl_config.get('ssl_verify_cert', False) if ssl_config else False,
            ssl_disabled=ssl_config.get('ssl_disabled', False) if ssl_config else False
        )
        return connection
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {err}")


# Models for User Registration and Login


class UserLoginRequest(BaseModel):
    email: str
    password: str


# Models for Ads, Offers, Wishlist, and Reviews
class Ad(BaseModel):
    ad_ID: int
    user_ID: int
    title: str
    description: str
    price: float
    created_at: str
    updated_at: str
    status: str


class Offer(BaseModel):
    offer_ID: int
    ad_ID: int
    user_ID: int
    offer_price: float
    offer_status: str
    offer_date: str


class WishlistItem(BaseModel):
    wishlist_ID: int
    user_ID: int
    ad_ID: int
    added_at: str


class Review(BaseModel):
    review_ID: int
    user_ID: int
    ad_ID: int
    rating: float
    review_text: str
    created_at: str


# Password hashing and verification functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Check backend and database connectivity
@app.get("/dbCheck")
def db_check():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM user;")
        user_count = cursor.fetchone()[0]
        cursor.close()
        connection.close()
        return {"message": "Backend Works Successfully", "Users in Database": user_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")


""" ************************************** User Backend ************************************************ """


class UserCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str


# Register user endpoint
@app.post("/register")
async def register_user(user: UserCreateRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if email already exists
    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
    if cursor.fetchone():
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(user.password)

    # Insert user into the `user` table, relying on DB defaults for optional fields
    cursor.execute(
        """
        INSERT INTO user (first_name, last_name, email, password)
        VALUES (%s, %s, %s, %s)
        """,
        (
            user.first_name,
            user.last_name,
            user.email,
            hashed_password,
        )
    )
    connection.commit()

    # Handle role-specific logic
    if user.role == "inspector":
        cursor.execute(
            """
            INSERT INTO inspector (user_id)
            VALUES (LAST_INSERT_ID())
            """
        )
    elif user.role == "buyer-seller":
        cursor.execute(
            """
            INSERT INTO owner_seller (user_id)
            VALUES (LAST_INSERT_ID())
            """
        )
    elif user.role == "owner-seller":  # Optionally, handle logic for "buyer-seller"
        pass
    else:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Invalid role provided")

    # Commit the changes and close the connection
    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "User successfully registered"}


# Login user endpoint
@app.post("/login")
async def login(user: UserLoginRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Query to check if the user exists in the user table
    cursor.execute("SELECT * FROM active_user WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    if not existing_user or not verify_password(user.password, existing_user['password']):
        cursor.close()
        connection.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check for role in the inspector, owner_seller, or admin tables
    role = None
    cursor.execute("SELECT 1 FROM inspector WHERE user_id = %s", (existing_user['user_ID'],))
    if cursor.fetchone():
        role = "inspector"

    if not role:
        cursor.execute("SELECT 1 FROM owner_seller WHERE user_id = %s", (existing_user['user_ID'],))
        if cursor.fetchone():
            role = "owner_seller"

    if not role:
        cursor.execute("SELECT 1 FROM admin WHERE user_id = %s", (existing_user['user_ID'],))
        if cursor.fetchone():
            role = "admin"

    cursor.close()
    connection.close()

    # If no role was found, assume 'buyer-seller' as the default role
    if not role:
        role = "buyer-seller"

    return {
        "id": existing_user['user_ID'],
        "email": existing_user['email'],
        "role": role  # Include the role in the response
    }


# View user profile endpoint
class UserProfileUpdateRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str = ""
    address: str = ""
    rating: float
    profile_picture: str = ""
    balance: float
    join_date: str = ""


@app.get("/user/profile/{user_id}", response_model=UserProfileUpdateRequest)
async def view_user_profile(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM active_user WHERE user_ID = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.pop('password', None)
    user['phone_number'] = user.get('phone_number', '') or ''
    user['address'] = user.get('address', '') or ''
    user['profile_picture'] = user.get('profile_picture', '') or ''
    user['join_date'] = user.get('join_date', '') or ''

    if user['join_date']:
        if isinstance(user['join_date'], (datetime, date)):
            user['join_date'] = user['join_date'].strftime('%Y-%m-%d')
        else:
            user['join_date'] = str(user['join_date'])

    return user


class UserProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

    class Config:
        orm_mode = True


@app.put("/user/profile/{user_id}")
async def update_user_profile(user_id: int, user: UserProfileUpdateRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Check if the provided email already exists for a different user
    if user.email:
        cursor.execute("SELECT * FROM active_user WHERE email = %s AND user_ID != %s", (user.email, user_id))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            raise HTTPException(status_code=400, detail="Email is already in use by another user")

    # Build the update query dynamically based on the fields that are provided
    update_fields = []
    values = []

    # Add fields to the update query if they are provided
    if user.first_name is not None:
        update_fields.append("first_name = %s")
        values.append(user.first_name)

    if user.last_name is not None:
        update_fields.append("last_name = %s")
        values.append(user.last_name)

    if user.email is not None:
        update_fields.append("email = %s")
        values.append(user.email)

    if user.phone_number is not None:
        update_fields.append("phone_number = %s")
        values.append(user.phone_number)

    if user.address is not None:
        update_fields.append("address = %s")
        values.append(user.address)

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Add the user_id to the end of the values list for the WHERE clause
    values.append(user_id)

    # Construct the dynamic query
    query = f"""
        UPDATE user
        SET {', '.join(update_fields)}
        WHERE user_ID = %s
    """

    # Execute the query
    cursor.execute(query, tuple(values))
    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "User profile successfully updated"}


class BalanceUpdateRequest(BaseModel):
    amount: float


""" ************************************** Balance Backend ************************************************ """


@app.put("/user/{user_id}/balance")
async def update_user_balance(user_id: int, balance_update: BalanceUpdateRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Fetch the current balance of the user
    cursor.execute("SELECT balance FROM active_user WHERE user_ID = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate the new balance
    current_balance = float(user["balance"])
    new_balance = current_balance + balance_update.amount

    if new_balance < 0:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Balance cannot be negative")

    # Update the user's balance
    cursor.execute("UPDATE user SET balance = %s WHERE user_ID = %s", (new_balance, user_id))
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "Balance updated successfully", "new_balance": new_balance}














@app.put("/user/{user_id}/deduct_balance_for_premium")
async def deduct_balance_for_premium(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Fetch the current balance of the user
    cursor.execute("SELECT balance FROM active_user WHERE user_ID = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="User not found")

    # Calculate the new balance after deduction
    current_balance = float(user["balance"])
    new_balance = current_balance - 150  # Deduct 150 for premium ad

    if new_balance < 0:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Balance cannot be negative")

    # Update the user's balance
    cursor.execute("UPDATE user SET balance = %s WHERE user_ID = %s", (new_balance, user_id))
    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "150 TL has been deducted for the premium ad", "new_balance": new_balance}


@app.get("/user/{user_id}/balance")
async def get_user_balance(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Fetch the current balance of the user
    cursor.execute("SELECT balance FROM active_user WHERE user_ID = %s", (user_id,))
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the balance
    return {"user_id": user_id, "balance": float(user["balance"])}


class VehicleCreate(BaseModel):
    manufacturer: str
    model: str
    year: int
    price: float
    mileage: float
    condition: str
    city: str
    state: str
    description: str


class CarCreate(BaseModel):
    number_of_doors: int
    seating_capacity: int
    transmission: str


class MotorcycleCreate(BaseModel):
    engine_capacity: int
    bike_type: str


class TruckCreate(BaseModel):
    cargo_capacity: int
    has_towing_package: bool


""" ************************************** Ads Backend ************************************************ """


@app.post("/add_vehicle/")
async def add_vehicle(
        vehicle: VehicleCreate,
        car: Optional[CarCreate] = None,
        motorcycle: Optional[MotorcycleCreate] = None,
        truck: Optional[TruckCreate] = None,
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        print(f"Attempting to insert vehicle: {vehicle}")  # Debug print to check vehicle data

        # Insert the vehicle record
        cursor.execute(
            """
            INSERT INTO vehicles (manufacturer, model, year, price, mileage, `condition`, city, state, description, listing_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                vehicle.manufacturer,
                vehicle.model,
                vehicle.year,
                vehicle.price,
                vehicle.mileage,
                vehicle.condition,
                vehicle.city,
                vehicle.state,
                vehicle.description,
                date.today()
            )
        )

        connection.commit()
        print("Vehicle record inserted successfully.")

        # Fetch the vehicle ID of the newly inserted vehicle
        cursor.execute("SELECT LAST_INSERT_ID()")
        vehicle_id = cursor.fetchone()[0]
        print(f"Fetched vehicle ID: {vehicle_id}")

        # Insert the specific vehicle type (Car, Motorcycle, Truck) if applicable
        if car:
            print(f"Attempting to insert car data: {car}")  # Debug print for car data
            cursor.execute(
                """
                INSERT INTO car (vehicle_ID, number_of_doors, seating_capacity, transmission)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    vehicle_id,
                    car.number_of_doors,
                    car.seating_capacity,
                    car.transmission
                )
            )
            connection.commit()
            print("Car data inserted successfully.")

        if motorcycle:
            print(f"Attempting to insert motorcycle data: {motorcycle}")  # Debug print for motorcycle data
            cursor.execute(
                """
                INSERT INTO motorcycle (vehicle_ID, engine_capacity, bike_type)
                VALUES (%s, %s, %s)
                """,
                (
                    vehicle_id,
                    motorcycle.engine_capacity,
                    motorcycle.bike_type
                )
            )
            connection.commit()
            print("Motorcycle data inserted successfully.")

        if truck:
            print(f"Attempting to insert truck data: {truck}")  # Debug print for truck data
            cursor.execute(
                """
                INSERT INTO truck (vehicle_ID, cargo_capacity, has_towing_package)
                VALUES (%s, %s, %s)
                """,
                (
                    vehicle_id,
                    truck.cargo_capacity,
                    truck.has_towing_package
                )
            )
            connection.commit()
            print("Truck data inserted successfully.")

        return {"message": "Vehicle added successfully", "vehicle_id": vehicle_id}

    except mysql.connector.Error as err:
        print(f"Database error: {err}")  # Debug print for database error
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error: {e}")  # Debug print for other errors
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    finally:
        cursor.close()
        connection.close()
        print("Connection closed.")  # Debug print to confirm connection close


class AdCreate(BaseModel):
    is_premium: Optional[bool] = False
    associated_vehicle: int
    owner: int
    status: str = "Pending"


@app.post("/add_ad/")
async def add_ad(ad: AdCreate):
    print(f"Received ad status: {ad.status}") 
    # Validate the status field to ensure it matches the ENUM values in the database
    valid_statuses = ['Pending', 'Active', 'Inactive', 'Expired', 'Sold', 'Rejected']
    if ad.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: {ad.status}. Allowed values are: {', '.join(valid_statuses)}"
        )

    # Set a default status if not provided
    if not ad.status:
        ad.status = "Pending"

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Calculate expiry date based on premium status
        current_date = datetime.now()
        expiry_date = (
            current_date + timedelta(weeks=52) if ad.is_premium else current_date + timedelta(weeks=12)
        )

        # Insert the ad record into the database
        cursor.execute(
            """
            INSERT INTO ads (expiry_date, is_premium, associated_vehicle, owner, status)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (expiry_date, ad.is_premium, ad.associated_vehicle, ad.owner, ad.status)
        )
        connection.commit()

        # Fetch the newly created ad ID
        cursor.execute("SELECT LAST_INSERT_ID()")
        ad_id = cursor.fetchone()[0]

        return {"message": "Ad created successfully", "ad_id": ad_id}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")

    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/ads")
async def get_user_ads(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch all ads for the given user
        cursor.execute("SELECT * FROM ads WHERE owner = %s", (user_id,))
        ads = cursor.fetchall()

        if not ads:
            raise HTTPException(status_code=404, detail="No ads found for this user")

        return {"message": "Ads fetched successfully", "ads": ads}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/vehicles")
async def get_user_vehicles(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch vehicle and ad details along with car, motorcycle, or truck specific information
        cursor.execute("""
            SELECT v.*, 
                   c.number_of_doors, c.seating_capacity, c.transmission,
                   m.engine_capacity, m.bike_type,
                   t.cargo_capacity, t.has_towing_package,
                   CASE
                       WHEN c.vehicle_ID IS NOT NULL THEN 'car'
                       WHEN m.vehicle_ID IS NOT NULL THEN 'motorcycle'
                       WHEN t.vehicle_ID IS NOT NULL THEN 'truck'
                       ELSE 'unknown'
                   END AS vehicle_type,
                   a.ad_ID, a.post_date, a.expiry_date, a.is_premium, 
                   a.views, a.status, a.owner AS ad_owner, a.associated_vehicle
            FROM vehicles v
            LEFT JOIN car c ON v.vehicle_ID = c.vehicle_ID
            LEFT JOIN motorcycle m ON v.vehicle_ID = m.vehicle_ID
            LEFT JOIN truck t ON v.vehicle_ID = t.vehicle_ID
            JOIN ads a ON v.vehicle_ID = a.associated_vehicle
            WHERE a.owner = %s
        """, (user_id,))

        vehicles = cursor.fetchall()

        if not vehicles:
            raise HTTPException(status_code=404, detail="No vehicles found for this user")

        return {"message": "Vehicles fetched successfully", "vehicles": vehicles}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/premium-vehicles")
async def get_premium_vehicles():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch general vehicle and ad details for only premium ads
        cursor.execute("""
            SELECT v.*, 
                   a.ad_ID, a.post_date, a.expiry_date, a.is_premium, 
                   a.views, a.status, a.owner AS ad_owner, a.associated_vehicle
            FROM vehicles v
            JOIN ads a ON v.vehicle_ID = a.associated_vehicle
            WHERE a.is_premium = TRUE
        """)

        vehicles = cursor.fetchall()

        if not vehicles:
            raise HTTPException(status_code=404, detail="No premium vehicles found.")

        return {"message": "Premium vehicles fetched successfully", "vehicles": vehicles}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.delete("/delete_ad/{ad_id}")
async def delete_ad(ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if the ad exists
        cursor.execute("SELECT associated_vehicle FROM ads WHERE ad_ID = %s", (ad_id,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Ad not found")

        associated_vehicle = result[0]

        # Delete the ad
        print(f"Deleting ad with ID={ad_id}")
        cursor.execute("DELETE FROM ads WHERE ad_ID = %s", (ad_id,))

        # Delete the vehicle associated with the ad
        print(f"Deleting vehicle with ID={associated_vehicle}")
        cursor.execute("DELETE FROM vehicles WHERE vehicle_ID = %s", (associated_vehicle,))

        connection.commit()

        return {"message": "Ad, associated vehicle, and related data deleted successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/other-ads")
async def get_other_user_ads(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch vehicle, ad, and owner details excluding the user's own ads
        cursor.execute("""
            SELECT v.*, 
                   c.number_of_doors, c.seating_capacity, c.transmission,
                   m.engine_capacity, m.bike_type,
                   t.cargo_capacity, t.has_towing_package,
                   CASE
                       WHEN c.vehicle_ID IS NOT NULL THEN 'car'
                       WHEN m.vehicle_ID IS NOT NULL THEN 'motorcycle'
                       WHEN t.vehicle_ID IS NOT NULL THEN 'truck'
                       ELSE 'unknown'
                   END AS vehicle_type,
                   a.ad_ID, a.post_date, a.expiry_date, a.is_premium, 
                   a.views, a.status, a.owner AS ad_owner, a.associated_vehicle,
                   u.user_ID, u.first_name, u.last_name, u.email, 
                   u.phone_number, u.address, u.rating, u.join_date
            FROM vehicles v
            LEFT JOIN car c ON v.vehicle_ID = c.vehicle_ID
            LEFT JOIN motorcycle m ON v.vehicle_ID = m.vehicle_ID
            LEFT JOIN truck t ON v.vehicle_ID = t.vehicle_ID
            JOIN ads a ON v.vehicle_ID = a.associated_vehicle
            JOIN active_user u ON a.owner = u.user_ID
            WHERE a.owner != %s
        """, (user_id,))

        other_ads = cursor.fetchall()

        if not other_ads:
            raise HTTPException(status_code=404, detail="No ads found for other users")

        return {"message": "Ads from other users fetched successfully", "ads": other_ads}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()




@app.get("/ad/{ad_id}/owner")
async def get_ad_owner(ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to get the owner ID of the ad
        cursor.execute("SELECT owner FROM ads WHERE ad_ID = %s", (ad_id,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Ad not found")

        owner_id = result["owner"]

        return {"message": "Owner ID fetched successfully", "owner_id": owner_id}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()



@app.put("/ad/{ad_id}/mark-sold")
async def mark_ad_as_sold(ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to check if the ad exists and fetch its current status
        cursor.execute("SELECT status FROM ads WHERE ad_ID = %s", (ad_id,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Ad not found")

        current_status = result["status"]

        # Ensure the ad is not already sold
        if current_status == "Sold":
            raise HTTPException(status_code=400, detail="Ad is already marked as sold")

        # Update the status of the ad to 'Sold'
        cursor.execute("UPDATE ads SET status = 'Sold' WHERE ad_ID = %s", (ad_id,))
        connection.commit()

        return {"message": "Ad status updated to 'Sold' successfully"}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()




""" ************************************** Wishlist Backend ************************************************ """


@app.post("/user/{user_id}/wishlist/{bookmarked_ad}")
async def add_to_wishlist(user_id: int, bookmarked_ad: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if the ad exists
        cursor.execute("SELECT * FROM ads WHERE ad_ID = %s", (bookmarked_ad,))
        ad = cursor.fetchone()

        if not ad:
            raise HTTPException(status_code=404, detail="Ad not found")

        # Insert into wishlist table
        cursor.execute("""
            INSERT INTO wishlist (user_ID, bookmarked_ad)
            VALUES (%s, %s)
        """, (user_id, bookmarked_ad))

        connection.commit()

        return {"message": "Ad successfully added to wishlist"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.delete("/user/{user_id}/wishlist/{bookmarked_ad}")
async def remove_from_wishlist(user_id: int, bookmarked_ad: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if the ad exists in the wishlist for the given user
        cursor.execute("SELECT * FROM wishlist WHERE user_ID = %s AND bookmarked_ad = %s", (user_id, bookmarked_ad))
        wishlist_item = cursor.fetchone()

        if not wishlist_item:
            raise HTTPException(status_code=404, detail="Ad not found in wishlist")

        # Delete from wishlist table
        cursor.execute("DELETE FROM wishlist WHERE user_ID = %s AND bookmarked_ad = %s", (user_id, bookmarked_ad))

        connection.commit()

        return {"message": "Ad successfully removed from wishlist"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/wishlist/{bookmarked_ad}")
async def check_if_bookmarked(user_id: int, bookmarked_ad: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if the ad exists in the wishlist for the given user
        cursor.execute("SELECT * FROM wishlist WHERE user_ID = %s AND bookmarked_ad = %s", (user_id, bookmarked_ad))
        wishlist_item = cursor.fetchone()

        if wishlist_item:
            return {"message": "Ad is in the wishlist", "isBookmarked": True}
        else:
            return {"message": "Ad is not in the wishlist", "isBookmarked": False}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/wishlist")
async def get_user_wishlist(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch detailed information for all wishlist items of the user
        cursor.execute("""
            SELECT v.*, 
                   c.number_of_doors, c.seating_capacity, c.transmission,
                   m.engine_capacity, m.bike_type,
                   t.cargo_capacity, t.has_towing_package,
                   CASE
                       WHEN c.vehicle_ID IS NOT NULL THEN 'car'
                       WHEN m.vehicle_ID IS NOT NULL THEN 'motorcycle'
                       WHEN t.vehicle_ID IS NOT NULL THEN 'truck'
                       ELSE 'unknown'
                   END AS vehicle_type,
                   a.ad_ID, a.post_date, a.expiry_date, a.is_premium, 
                   a.views, a.status, a.owner AS ad_owner, a.associated_vehicle,
                   u.user_ID, u.first_name, u.last_name, u.email, 
                   u.phone_number, u.address, u.rating, u.join_date
            FROM wishlist w
            JOIN ads a ON w.bookmarked_ad = a.ad_ID
            JOIN vehicles v ON a.associated_vehicle = v.vehicle_ID
            LEFT JOIN car c ON v.vehicle_ID = c.vehicle_ID
            LEFT JOIN motorcycle m ON v.vehicle_ID = m.vehicle_ID
            LEFT JOIN truck t ON v.vehicle_ID = t.vehicle_ID
            JOIN active_user u ON a.owner = u.user_ID
            WHERE w.user_ID = %s
        """, (user_id,))

        wishlist_items = cursor.fetchall()

        if not wishlist_items:
            return {"message": "No items in wishlist"}

        return {"message": "Wishlist items fetched successfully", "wishlist": wishlist_items}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


""" ************************************** Offer Backend ************************************************ """


@app.post("/create_offer/{offer_owner}/{sent_to}/{offer_price}")
async def create_offer(offer_owner: int, sent_to: int, offer_price: float):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Insert the new offer into the offer table
        cursor.execute("""
            INSERT INTO offer (offer_price, offer_owner, sent_to)
            VALUES (%s, %s, %s)
        """, (offer_price, offer_owner, sent_to))

        connection.commit()

        return {"message": "Offer created successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/check_offer/{user_id}/{ad_id}")
async def check_user_offer(user_id: int, ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to check if the user has made an offer on the specific ad
        cursor.execute("""
            SELECT offer_ID, offer_price, offer_status
            FROM offer
            WHERE offer_owner = %s AND sent_to = %s
        """, (user_id, ad_id))

        offer = cursor.fetchone()

        if not offer:
            raise HTTPException(status_code=404, detail="No offer found for this user on the specified ad")

        return {"message": "Offer found", "offer": offer}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user/{user_id}/offers")
async def get_user_offers(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch all offers made by the user along with vehicle details
        cursor.execute("""
            SELECT 
                o.offer_ID, o.offer_date, o.offer_price, o.offer_status, o.counter_offer_price, 
                o.sent_to, a.ad_ID, a.status AS ad_status, a.post_date, a.expiry_date, 
                v.vehicle_ID, v.manufacturer, v.model, v.year, v.price, v.mileage, v.condition,
                v.city, v.state, v.description
            FROM 
                offer o
            JOIN 
                ads a ON o.sent_to = a.ad_ID
            JOIN 
                vehicles v ON a.associated_vehicle = v.vehicle_ID
            WHERE 
                o.offer_owner = %s
            ORDER BY 
                o.offer_date DESC
        """, (user_id,))

        offers = cursor.fetchall()

        if not offers:
            raise HTTPException(status_code=404, detail="No offers found for this user")

        return {"message": "Offers fetched successfully", "offers": offers}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/ad/{ad_id}/offers")
async def get_offers_for_ad(ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Query to fetch all offers made to the specific ad
        cursor.execute("""
            SELECT 
                o.offer_ID, o.offer_date, o.offer_price, o.offer_status, o.counter_offer_price, 
                o.offer_owner, u.first_name, u.last_name, u.email AS offer_owner_email,
                a.ad_ID, a.status AS ad_status, a.post_date, a.expiry_date, 
                v.vehicle_ID, v.manufacturer, v.model, v.year, v.price, v.mileage, v.condition,
                v.city, v.state, v.description
            FROM 
                offer o
            JOIN 
                ads a ON o.sent_to = a.ad_ID
            JOIN 
                vehicles v ON a.associated_vehicle = v.vehicle_ID
            JOIN 
                active_user u ON o.offer_owner = u.user_ID
            WHERE 
                o.sent_to = %s
            ORDER BY 
                o.offer_date DESC
        """, (ad_id,))

        offers = cursor.fetchall()

        if not offers:
            raise HTTPException(status_code=404, detail="No offers found for this ad")

        return {"message": "Offers fetched successfully", "offers": offers}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.put("/accept_offer/{offer_id}")
async def accept_offer(offer_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Update the offer status to 'accepted'
        cursor.execute("""
            UPDATE offer
            SET offer_status = 'accepted'
            WHERE offer_ID = %s
        """, (offer_id,))

        # Check if any rows were affected
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Commit the transaction
        connection.commit()

        return {"message": "Offer accepted successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.put("/reject_offer/{offer_id}")
async def reject_offer(offer_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Update the offer status to 'rejected'
        cursor.execute("""
            UPDATE offer
            SET offer_status = 'rejected'
            WHERE offer_ID = %s
        """, (offer_id,))

        # Check if any rows were affected
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Commit the transaction
        connection.commit()

        return {"message": "Offer rejected successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.put("/counter_offer/{offer_id}/{counter_offer_price}")
async def counter_offer(offer_id: int, counter_offer_price: float):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Update the counter offer price for the given offer
        cursor.execute("""
            UPDATE offer
            SET counter_offer_price = %s
            WHERE offer_ID = %s
        """, (counter_offer_price, offer_id))

        # Check if any rows were affected
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Commit the transaction
        connection.commit()

        return {"message": f"Counter offer updated to ${counter_offer_price:.2f} successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.delete("/delete_offer/{offer_id}")
async def delete_offer(offer_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete the offer
        cursor.execute("""
            DELETE FROM offer
            WHERE offer_ID = %s
        """, (offer_id,))

        # Check if any rows were affected (i.e., the offer was deleted)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Commit the transaction
        connection.commit()

        return {"message": "Offer deleted successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


""" ************************************** Transaction Backend ************************************************ """


@app.post("/create_transaction/")
async def create_transaction(
        price: float,
        payment_method: str,
        transaction_type: str,
        paid_by: int,
        review: Optional[int] = None,  # Optional, defaults to None
        belonged_ad: Optional[int] = None,  # Optional, defaults to None
        approved_by: Optional[int] = None  # Optional, defaults to None
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if price is valid
        if price <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")

        # Check if valid payment method
        valid_payment_methods = ['credit_card', 'paypal', 'bank_transfer', 'crypto']
        if payment_method not in valid_payment_methods:
            raise HTTPException(status_code=400, detail="Invalid payment method")

        # Check if valid transaction type
        valid_transaction_types = ['purchase', 'refund', 'deposit', 'withdrawal']
        if transaction_type not in valid_transaction_types:
            raise HTTPException(status_code=400, detail="Invalid transaction type")

        # Insert a new transaction into the transactions table
        cursor.execute("""
            INSERT INTO transactions (
                price, payment_method, transaction_type, review, belonged_ad, paid_by, approved_by
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (price, payment_method, transaction_type, review, belonged_ad, paid_by, approved_by))

        # Commit the transaction
        connection.commit()

        return {"message": "Transaction created successfully"}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/check_existing_transaction/{ad_id}")
async def check_existing_transaction(ad_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if there is any transaction for the given ad_id
        cursor.execute("""
            SELECT 1
            FROM transactions
            WHERE belonged_ad = %s
            LIMIT 1
        """, (ad_id,))

        # If a row is found, it means a transaction exists
        transaction_exists = cursor.fetchone() is not None

        return {"transaction_exists": transaction_exists}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user_transactions/{user_id}")
async def get_user_transactions(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Fetch transactions involving the user
        cursor.execute("""
            SELECT 
                t.transaction_ID, t.transaction_date, t.price, t.payment_method, 
                t.payment_status, t.transaction_type, t.review, t.belonged_ad, 
                t.paid_by, pb.first_name AS payer_first_name, pb.last_name AS payer_last_name, 
                pb.phone_number AS payer_phone, pb.email AS payer_email, 
                t.approved_by, ab.first_name AS approver_first_name, ab.last_name AS approver_last_name,
                ab.phone_number AS approver_phone, ab.email AS approver_email,
                a.owner, os.first_name AS owner_first_name, os.last_name AS owner_last_name, 
                os.phone_number AS owner_phone, os.email AS owner_email, 
                a.associated_vehicle, a.status AS ad_status, 
                v.manufacturer, v.model, v.year
            FROM transactions t
            LEFT JOIN ads a ON t.belonged_ad = a.ad_ID
            LEFT JOIN active_user pb ON t.paid_by = pb.user_ID
            LEFT JOIN active_user ab ON t.approved_by = ab.user_ID
            LEFT JOIN active_user os ON a.owner = os.user_ID
            LEFT JOIN vehicles v ON a.associated_vehicle = v.vehicle_ID
            WHERE t.paid_by = %s OR a.owner = %s
        """, (user_id, user_id))
        transactions = cursor.fetchall()

        # Structure the results to return
        transactions_data = []
        for transaction in transactions:
            transactions_data.append({
                "transaction_ID": transaction[0],
                "transaction_date": transaction[1],
                "price": transaction[2],
                "payment_method": transaction[3],
                "payment_status": transaction[4],
                "transaction_type": transaction[5],
                "review": transaction[6],
                "belonged_ad": transaction[7],
                "payer_details": {
                    "user_ID": transaction[8],
                    "first_name": transaction[9],
                    "last_name": transaction[10],
                    "phone_number": transaction[11],
                    "email": transaction[12]
                },
                "approver_details": {
                    "user_ID": transaction[13],
                    "first_name": transaction[14],
                    "last_name": transaction[15],
                    "phone_number": transaction[16],
                    "email": transaction[17]
                } if transaction[13] else None,
                "owner_details": {
                    "user_ID": transaction[18],
                    "first_name": transaction[19],
                    "last_name": transaction[20],
                    "phone_number": transaction[21],
                    "email": transaction[22]
                },
                "ad_details": {
                    "associated_vehicle": transaction[23],
                    "ad_status": transaction[24],
                    "vehicle_details": {
                        "manufacturer": transaction[25],
                        "model": transaction[26],
                        "year": transaction[27]
                    }
                }
            })

        return {"transactions": transactions_data}

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


""" ************************************** Review Backend ************************************************ """

class ReviewCreateRequest(BaseModel):
    rating: int
    comment: str
    reviewer: int
    evaluated_user: int
    transaction_id: int  # Added the transaction_id field

@app.post("/create_review/")
async def create_review(review: ReviewCreateRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if rating is within the valid range (0-5)
        if review.rating < 0 or review.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")

        # Insert the review into the reviews table
        cursor.execute("""
            INSERT INTO reviews (rating, comment, reviewer, evaluated_user)
            VALUES (%s, %s, %s, %s)
        """, (review.rating, review.comment, review.reviewer, review.evaluated_user))

        # Get the ID of the newly inserted review
        review_id = cursor.lastrowid

        # Update the transaction table to associate the new review with the transaction
        cursor.execute("""
            UPDATE transactions
            SET review = %s
            WHERE transaction_ID = %s
        """, (review_id, review.transaction_id))

        # Commit the transaction
        connection.commit()

        return {"message": "Review created successfully", "review_id": review_id}

    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


@app.get("/user_reviews/{user_id}")
async def get_user_reviews(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)  # Use dictionary for easier column name access

    try:
        # Fetch sent reviews (reviews where user is the reviewer)
        cursor.execute("""
            SELECT review_ID AS review_id, rating, comment, review_date, reviewer, evaluated_user
            FROM reviews
            WHERE reviewer = %s
        """, (user_id,))
        sent_reviews = cursor.fetchall()

        # Fetch received reviews (reviews where user is the evaluated_user)
        cursor.execute("""
            SELECT review_ID AS review_id, rating, comment, review_date, reviewer, evaluated_user
            FROM reviews
            WHERE evaluated_user = %s
        """, (user_id,))
        received_reviews = cursor.fetchall()

        # Combine the results
        all_reviews = {
            "sent_reviews": sent_reviews,
            "received_reviews": received_reviews
        }

        # If no reviews found
        if not sent_reviews and not received_reviews:
            raise HTTPException(status_code=404, detail="No reviews found for the user.")

        return all_reviews

    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


""" ************************************** Admin Page v.0.1 ************************************************ """
# A model for Admin updates
class AdminUserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    active: Optional[bool] = None

# 1. GET ALL USERS
@app.get("/admin/users")
def get_all_users():
    """
    Retrieves all users with basic info.
    NOTE: We are NOT restricting this endpoint to admin only, for your testing purposes.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                user_ID, first_name, last_name, email,
                phone_number, address, rating, active, join_date
            FROM user
        """)
        users = cursor.fetchall()
        return {"users": users}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 2. (Optional) GET USER DETAILS
@app.get("/admin/users/{user_id}")
def get_user_details(user_id: int):
    """
    Retrieves detailed info for a specific user by ID.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                user_ID, first_name, last_name, email,
                phone_number, address, rating, active, join_date
            FROM user
            WHERE user_ID = %s
        """, (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user": user}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 3. UPDATE USER FIELDS
@app.put("/admin/users/{user_id}")
def admin_update_user(user_id: int, user_update: AdminUserUpdateRequest):
    """
    Allows Admin to update user info: name, email, phone, address, rating, etc.
    We do NOT check roles so anyone can call it for your testing scenario.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        fields = []
        values = []

        if user_update.first_name is not None:
            fields.append("first_name = %s")
            values.append(user_update.first_name)
        if user_update.last_name is not None:
            fields.append("last_name = %s")
            values.append(user_update.last_name)
        if user_update.email is not None:
            # Optionally, check uniqueness or validity
            fields.append("email = %s")
            values.append(user_update.email)
        if user_update.phone_number is not None:
            fields.append("phone_number = %s")
            values.append(user_update.phone_number)
        if user_update.address is not None:
            fields.append("address = %s")
            values.append(user_update.address)
        if user_update.rating is not None:
            fields.append("rating = %s")
            values.append(user_update.rating)
        if user_update.active is not None:
            fields.append("active = %s")
            values.append(user_update.active)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Add user_id to the end for the WHERE clause
        values.append(user_id)
        query = f"""
            UPDATE user
            SET {', '.join(fields)}
            WHERE user_ID = %s
        """
        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or no changes made")

        return {"message": "User updated successfully"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 4. DEACTIVATE USER
@app.put("/admin/users/{user_id}/deactivate")
def deactivate_user(user_id: int):
    """
    Sets a user's 'active' field to False.
    No role check here for your dev/testing convenience.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            UPDATE user
            SET active = FALSE
            WHERE user_ID = %s
        """, (user_id,))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or already inactive")

        return {"message": "User account deactivated"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 5. DEACTIVATE USER
@app.put("/admin/users/{user_id}/reactivate")
def reactivate_user(user_id: int):
    """
    Sets a user's 'active' field to True.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            UPDATE user
            SET active = TRUE
            WHERE user_ID = %s
        """, (user_id,))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or already active")

        return {"message": "User account reactivated"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 6. RESET USER PASSWORD
@app.put("/admin/users/{user_id}/reset-password")
def reset_user_password(user_id: int):
    """
    Resets a user's password to a placeholder or random string.
    We do NOT restrict access here, for your dev/testing purposes.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        new_password = "NewP@ss123"  # For demonstration only
        hashed_password = hash_password(new_password)  

        cursor.execute("""
            UPDATE user
            SET password = %s
            WHERE user_ID = %s
        """, (hashed_password, user_id))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "message": "Password reset successfully",
            "new_password": new_password
        }
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()


""" ************************************** Admin Page v.0.1 ************************************************ """
# A model for Admin updates
class AdminUserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    active: Optional[bool] = None

# 1. GET ALL USERS
@app.get("/admin/users")
def get_all_users():
    """
    Retrieves all users with basic info.
    NOTE: We are NOT restricting this endpoint to admin only, for your testing purposes.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                user_ID, first_name, last_name, email,
                phone_number, address, rating, active, join_date
            FROM user
        """)
        users = cursor.fetchall()
        return {"users": users}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 2. (Optional) GET USER DETAILS
@app.get("/admin/users/{user_id}")
def get_user_details(user_id: int):
    """
    Retrieves detailed info for a specific user by ID.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                user_ID, first_name, last_name, email,
                phone_number, address, rating, active, join_date
            FROM user
            WHERE user_ID = %s
        """, (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user": user}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 3. UPDATE USER FIELDS
@app.put("/admin/users/{user_id}")
def admin_update_user(user_id: int, user_update: AdminUserUpdateRequest):
    """
    Allows Admin to update user info: name, email, phone, address, rating, etc.
    We do NOT check roles so anyone can call it for your testing scenario.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        fields = []
        values = []

        if user_update.first_name is not None:
            fields.append("first_name = %s")
            values.append(user_update.first_name)
        if user_update.last_name is not None:
            fields.append("last_name = %s")
            values.append(user_update.last_name)
        if user_update.email is not None:
            # Optionally, check uniqueness or validity
            fields.append("email = %s")
            values.append(user_update.email)
        if user_update.phone_number is not None:
            fields.append("phone_number = %s")
            values.append(user_update.phone_number)
        if user_update.address is not None:
            fields.append("address = %s")
            values.append(user_update.address)
        if user_update.rating is not None:
            fields.append("rating = %s")
            values.append(user_update.rating)
        if user_update.active is not None:
            fields.append("active = %s")
            values.append(user_update.active)

        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Add user_id to the end for the WHERE clause
        values.append(user_id)
        query = f"""
            UPDATE user
            SET {', '.join(fields)}
            WHERE user_ID = %s
        """
        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or no changes made")

        return {"message": "User updated successfully"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 4. DEACTIVATE USER
@app.put("/admin/users/{user_id}/deactivate")
def deactivate_user(user_id: int):
    """
    Sets a user's 'active' field to False.
    No role check here for your dev/testing convenience.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            UPDATE user
            SET active = FALSE
            WHERE user_ID = %s
        """, (user_id,))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or already inactive")

        return {"message": "User account deactivated"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 5. DEACTIVATE USER
@app.put("/admin/users/{user_id}/reactivate")
def reactivate_user(user_id: int):
    """
    Sets a user's 'active' field to True.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            UPDATE user
            SET active = TRUE
            WHERE user_ID = %s
        """, (user_id,))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found or already active")

        return {"message": "User account reactivated"}
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# 6. RESET USER PASSWORD
@app.put("/admin/users/{user_id}/reset-password")
def reset_user_password(user_id: int):
    """
    Resets a user's password to a placeholder or random string.
    We do NOT restrict access here, for your dev/testing purposes.
    """
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        new_password = "NewP@ss123"  # For demonstration only
        hashed_password = hash_password(new_password)  

        cursor.execute("""
            UPDATE user
            SET password = %s
            WHERE user_ID = %s
        """, (hashed_password, user_id))
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "message": "Password reset successfully",
            "new_password": new_password
        }
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# Admin Reports +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# Reports and Complaints Handling
class ReportUpdateRequest(BaseModel):
    status: Optional[str] = None
    action_taken: Optional[str] = None

# Fetch all reports
@app.get("/admin/reports")
def get_all_reports():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # Modified query to only include existing columns
        query = """
            SELECT r.report_ID,
                   r.description,
                   r.report_date,
                   r.status,
                   r.reported_user,
                   r.reported_by,
                   CONCAT(u.first_name, ' ', u.last_name) as reported_user_name
            FROM reports r
            JOIN user u ON r.reported_user = u.user_ID
            ORDER BY r.report_date DESC
        """
        cursor.execute(query)
        reports = cursor.fetchall()
        
        # Convert datetime objects to strings
        for report in reports:
            if report.get('report_date'):
                report['report_date'] = report['report_date'].isoformat()
        
        return {"reports": reports}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {str(err)}")
    finally:
        cursor.close()
        connection.close()

# Fetch a specific report by ID
@app.get("/admin/reports/{report_id}")
async def get_report_details(report_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM reports WHERE report_id = %s", (report_id,))
        report = cursor.fetchone()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"report": report}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

# Update report status and take action
@app.put("/admin/reports/{report_id}")
async def update_report(report_id: int, update_request: ReportUpdateRequest):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # Update the report status
        update_fields = []
        values = []
        if update_request.status is not None:
            update_fields.append("status = %s")
            values.append(update_request.status)
        if update_request.action_taken is not None:
            update_fields.append("action_taken = %s")
            values.append(update_request.action_taken)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        values.append(report_id)
        query = f"UPDATE reports SET {', '.join(update_fields)} WHERE report_id = %s"
        cursor.execute(query, tuple(values))
        connection.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report updated successfully"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

# Delete a report
@app.delete("/admin/reports/{report_id}")
async def delete_report(report_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM reports WHERE report_id = %s", (report_id,))
        connection.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report deleted successfully"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

class ReportCreateRequest(BaseModel):
    reported_user: int
    reported_by: int
    description: str

@app.post("/create_report")
def create_report(report_data: ReportCreateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO reports (reported_user, reported_by, description, status)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (report_data.reported_user, report_data.reported_by, report_data.description, 'Pending'))
        conn.commit()
        return {"message": "Report created successfully"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        conn.close()

# Admin Pending Ads Section
@app.get("/admin/pending-ads")
def get_pending_ads():
    """
    Get all pending ads with complete vehicle, owner, and photo information.
    Used by admins to review new ads.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                -- Ad details
                a.ad_ID, a.post_date, a.expiry_date, a.is_premium, a.status,
                
                -- Vehicle basic info
                v.vehicle_ID, v.manufacturer, v.model, v.year, v.price, 
                v.mileage, v.condition, v.city, v.state, v.description,
                
                -- Vehicle type-specific details
                c.number_of_doors, c.seating_capacity, c.transmission,
                m.engine_capacity, m.bike_type,
                t.cargo_capacity, t.has_towing_package,
                
                -- Owner information
                a.owner as owner_id,
                u.first_name as owner_first_name, 
                u.last_name as owner_last_name,
                u.email as owner_email,
                
                -- Vehicle type determination
                CASE
                    WHEN c.vehicle_ID IS NOT NULL THEN 'car'
                    WHEN m.vehicle_ID IS NOT NULL THEN 'motorcycle'
                    WHEN t.vehicle_ID IS NOT NULL THEN 'truck'
                    ELSE 'unknown'
                END AS vehicle_type,
                
                -- Photo URLs as comma-separated list
                GROUP_CONCAT(DISTINCT vp.photo_url) as photo_urls
                
            FROM ads a
            -- Join with vehicles table
            JOIN vehicles v ON a.associated_vehicle = v.vehicle_ID
            
            -- Join with owner information
            JOIN active_user u ON a.owner = u.user_ID
            
            -- Left joins with vehicle type tables
            LEFT JOIN car c ON v.vehicle_ID = c.vehicle_ID
            LEFT JOIN motorcycle m ON v.vehicle_ID = m.vehicle_ID
            LEFT JOIN truck t ON v.vehicle_ID = t.vehicle_ID
            
            -- Left join with photos
            LEFT JOIN vehicle_photos vp ON v.vehicle_ID = vp.vehicle_ID
            
            -- Only get pending ads
            WHERE a.status = 'Pending'
            
            -- Group by ad to handle multiple photos
            GROUP BY a.ad_ID, v.vehicle_ID, c.vehicle_ID, m.vehicle_ID, t.vehicle_ID
            
            -- Sort by newest first
            ORDER BY a.post_date DESC
        """)
        
        ads = cursor.fetchall()
        
        # Process photo URLs from comma-separated string to array
        for ad in ads:
            if ad.get('photo_urls'):
                ad['photos'] = ad['photo_urls'].split(',')
                del ad['photo_urls']
            else:
                ad['photos'] = []
                
        return {"ads": ads}
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

@app.put("/admin/ads/{ad_id}/{action}")
def update_ad_status(ad_id: int, action: str):
    """
    Update ad status based on admin review.
    
    Parameters:
    - ad_id: ID of the ad to update
    - action: Either 'approve' or 'reject'
    
    Returns:
    - Success message if status updated
    """
    if action not in ['approve', 'reject']:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")
    
    status = 'Active' if action == 'approve' else 'Rejected'
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        # First check if ad exists and is in pending state
        cursor.execute("""
            SELECT status 
            FROM ads 
            WHERE ad_ID = %s
        """, (ad_id,))
        
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Ad not found")
            
        if result[0] != 'Pending':
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot {action} ad. Current status is {result[0]}"
            )
        
        # Update the ad status
        cursor.execute("""
            UPDATE ads
            SET status = %s
            WHERE ad_ID = %s
        """, (status, ad_id))
        
        connection.commit()
        
        return {
            "message": f"Ad {action}d successfully",
            "ad_id": ad_id,
            "new_status": status
        }
        
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        connection.close()

# Inspector Profile ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++4
# Models for Inspector functionalities""

# Models for Inspector functionalities
class InspectionCreate(BaseModel):
    vehicle_id: int
    inspection_date: date
    report: str
    result: str = "Pending"
    related_certification: Optional[int] = None

# Get inspector's pending inspections
@app.get("/api/inspector/{inspector_id}/pending-inspections")
async def get_pending_inspections(inspector_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        # Get vehicles that need inspection
        cursor.execute("""
            SELECT v.*, a.ad_ID, a.status as ad_status 
            FROM vehicles v
            JOIN ads a ON v.vehicle_ID = a.associated_vehicle
            WHERE a.status = 'Pending'
            ORDER BY v.listing_date DESC
        """)
        
        vehicles = cursor.fetchall()
        return {"vehicles": vehicles}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

# Submit inspection report
@app.post("/api/inspector/submit-report")
async def submit_inspection_report(
    vehicle_id: int = Form(...),
    report: str = Form(...),
    result: str = Form(...),
    inspector_id: int = Form(...),
    report_file: Optional[UploadFile] = File(None)
):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # Get next inspection ID
        cursor.execute("SELECT MAX(inspection_ID) FROM inspections")
        next_id = (cursor.fetchone()[0] or 0) + 1

        # Insert inspection record
        cursor.execute("""
            INSERT INTO inspections (
                inspection_ID, vehicle_ID, inspection_date,
                report, result, done_by
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            next_id,
            vehicle_id,
            date.today(),
            report,
            result,
            inspector_id
        ))

        # Update vehicle ad status based on inspection result
        new_status = "Active" if result == "Passed" else "Rejected"
        cursor.execute("""
            UPDATE ads
            SET status = %s
            WHERE associated_vehicle = %s
        """, (new_status, vehicle_id))

        # Update inspector's inspection count
        cursor.execute("""
            UPDATE inspector
            SET number_of_inspections = number_of_inspections + 1
            WHERE user_id = %s
        """, (inspector_id,))

        connection.commit()
        return {"message": "Inspection report submitted successfully", "inspection_id": next_id}
        
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

# Get inspector's completed inspections
@app.get("/api/inspector/{inspector_id}/inspections")
async def get_inspector_inspections(inspector_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT i.*, v.manufacturer, v.model, v.year,
                   v.price, v.mileage, v.condition
            FROM inspections i
            JOIN vehicles v ON i.vehicle_ID = v.vehicle_ID
            WHERE i.done_by = %s
            ORDER BY i.inspection_date DESC
        """, (inspector_id,))
        
        inspections = cursor.fetchall()
        return {"inspections": inspections}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()

# Issue certification for a vehicle
@app.post("/api/inspector/issue-certification")
async def issue_certification(
    inspection_id: int,
    vehicle_id: int,
    expiry_date: date
):
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        # First check if inspection passed
        cursor.execute("""
            SELECT result FROM inspections
            WHERE inspection_ID = %s AND vehicle_ID = %s
        """, (inspection_id, vehicle_id))
        
        result = cursor.fetchone()
        if not result or result[0] != "Passed":
            raise HTTPException(
                status_code=400,
                detail="Vehicle must pass inspection before certification"
            )

        # Create certification
        cursor.execute("""
            INSERT INTO certification (
                certification_date,
                expiry_date
            ) VALUES (%s, %s)
        """, (date.today(), expiry_date))
        
        certification_id = cursor.lastrowid

        # Link certification to inspection
        cursor.execute("""
            UPDATE inspections
            SET related_certification = %s
            WHERE inspection_ID = %s AND vehicle_ID = %s
        """, (certification_id, inspection_id, vehicle_id))

        # Update inspector's certification count
        cursor.execute("""
            UPDATE inspector
            SET number_of_certificates = number_of_certificates + 1
            WHERE user_id = (
                SELECT done_by FROM inspections 
                WHERE inspection_ID = %s AND vehicle_ID = %s
            )
        """, (inspection_id, vehicle_id))

        connection.commit()
        return {"message": "Certification issued successfully", "certification_id": certification_id}
        
    except mysql.connector.Error as err:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        cursor.close()
        connection.close()