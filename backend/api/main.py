from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import mysql.connector
from dotenv import load_dotenv
from typing import List
import ssl

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

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
        print(f"Error: {err}")
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
        cursor.execute("SELECT COUNT(*) FROM user;")  # Assuming there's a 'users' table
        user_count = cursor.fetchone()[0]  # Get the user count
        cursor.close()
        connection.close()
        return {"message": "Backend Works Successfully", "Users in Database": user_count}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
