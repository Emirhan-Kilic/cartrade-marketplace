from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import os
import mysql.connector
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, date

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
class UserCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone_number: str
    address: str
    rating: float
    join_date: str
    profile_picture: str
    balance: float

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

# Register user endpoint
@app.post("/register")
async def register_user(user: UserCreateRequest):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
    if cursor.fetchone():
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    cursor.execute(
        """
        INSERT INTO user (first_name, last_name, email, password, phone_number, address, rating, join_date, profile_picture, balance)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (user.first_name, user.last_name, user.email, hashed_password, user.phone_number, user.address, user.rating,
         user.join_date, user.profile_picture, user.balance)
    )
    connection.commit()
    cursor.close()
    connection.close()
    return {"message": "User successfully registered"}

# Login user endpoint
@app.post("/login")
async def login(user: UserLoginRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    if not existing_user or not verify_password(user.password, existing_user['password']):
        cursor.close()
        connection.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    cursor.close()
    connection.close()
    return {"id": existing_user['user_ID'], "email": existing_user['email']}

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
