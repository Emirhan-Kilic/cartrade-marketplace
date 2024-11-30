from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/checkBackend")
def read_root():
    return {"Backend Works Successfully"}
