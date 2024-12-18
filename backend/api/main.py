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
    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
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

    cursor.execute("SELECT * FROM user WHERE user_ID = %s", (user_id,))
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
        cursor.execute("SELECT * FROM user WHERE email = %s AND user_ID != %s", (user.email, user_id))
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

@app.put("/user/{user_id}/balance")
async def update_user_balance(user_id: int, balance_update: BalanceUpdateRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Fetch the current balance of the user
    cursor.execute("SELECT balance FROM user WHERE user_ID = %s", (user_id,))
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
    cursor.execute("SELECT balance FROM user WHERE user_ID = %s", (user_id,))
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
    cursor.execute("SELECT balance FROM user WHERE user_ID = %s", (user_id,))
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

@app.post("/add_ad/")
async def add_ad(ad: AdCreate):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Debug print to confirm the received data
        print(f"Attempting to insert ad with vehicle ID={ad.associated_vehicle} and owner ID={ad.owner}")

        # Calculate expiry date based on premium status
        current_date = datetime.now()
        if ad.is_premium:
            expiry_date = current_date + timedelta(weeks=52)  # 12 months
        else:
            expiry_date = current_date + timedelta(weeks=12)  # 3 months

        # Insert the ad record
        cursor.execute(
            """
            INSERT INTO ads (expiry_date, is_premium, associated_vehicle, owner)
            VALUES (%s, %s, %s, %s)
            """,
            (
                expiry_date,
                ad.is_premium,
                ad.associated_vehicle,
                ad.owner
            )
        )
        connection.commit()

        # Fetch the ad ID of the newly inserted ad
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
