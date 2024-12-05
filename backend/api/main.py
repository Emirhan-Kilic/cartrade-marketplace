from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import mysql.connector
from dotenv import load_dotenv
from api.models import UserCreateRequest, UserLoginRequest
from fastapi import HTTPException
from passlib.context import CryptContext
from fastapi.responses import JSONResponse

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

# SSL configuration - dynamically load ssl_ca path from environment
ssl_config = None
ssl_ca_path = os.getenv('MYSQL_SSL_CA_PATH')  # Get SSL certificate path from environment
if ssl_ca_path and os.getenv('MYSQL_SSL_MODE', 'REQUIRED') == 'REQUIRED':
    ssl_config = {
        'ssl_ca': ssl_ca_path,  # Path to the CA certificate
        'ssl_verify_cert': True,
        'ssl_disabled': False,
    }

# Check for missing required environment variables
required_env_vars = ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_DATABASE']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise HTTPException(status_code=500, detail=f"Missing environment variables: {', '.join(missing_vars)}")


# Create a function to get the database connection
def get_db_connection():
    try:
        print(f"Connecting to MySQL at {DB_CONFIG['host']}:{DB_CONFIG['port']}...")
        connection = mysql.connector.connect(
            **DB_CONFIG,
            ssl_ca=ssl_config.get('ssl_ca', None) if ssl_config else None,
            ssl_verify_cert=ssl_config.get('ssl_verify_cert', False) if ssl_config else False,
            ssl_disabled=ssl_config.get('ssl_disabled', False) if ssl_config else False
        )
        print("Connection successful.")
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        raise HTTPException(status_code=500, detail="Database connection failed")
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# Sample endpoint to check if backend and DB are working
@app.get("/dbCheck")
def db_check():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM user;")  # Assuming there's a 'user' table
        user_count = cursor.fetchone()[0]  # Get the user count
        cursor.close()
        connection.close()
        return {"message": "Backend Works Successfully", "Users in Database": user_count}
    except mysql.connector.Error as e:
        print(f"Query execution error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error executing database query")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# Hashing password before storing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Verify if password matches the hashed one
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


@app.post("/register")
async def register_user(user: UserCreateRequest):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check if email is already in use
    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before storing
    hashed_password = hash_password(user.password)

    # Insert user data into database
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


@app.post("/login")
async def login(user: UserLoginRequest):
    # Connect to the database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Check if the user exists by email
    cursor.execute("SELECT * FROM user WHERE email = %s", (user.email,))
    existing_user = cursor.fetchone()

    if not existing_user:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify the password
    if not verify_password(user.password, existing_user['password']):
        cursor.close()
        connection.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    cursor.close()
    connection.close()

    # Return the id and email on successful login
    return JSONResponse(content={"id": existing_user['user_ID'], "email": existing_user['email']})
