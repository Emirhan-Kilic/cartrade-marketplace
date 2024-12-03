from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from enum import Enum


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = 0.0
    join_date: Optional[date] = date.today()
    profile_picture: Optional[bytes] = None
    balance: Optional[float] = 0.0


class OwnerSeller(UserBase):
    number_of_ads: Optional[int] = 0
    number_of_done_deals: Optional[int] = 0


class Inspector(UserBase):
    number_of_inspections: Optional[int] = 0
    number_of_certificates: Optional[int] = 0


class Admin(UserBase):
    pass


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreateRequest(UserBase):
    pass


class OwnerSellerCreateRequest(OwnerSeller):
    pass


class InspectorCreateRequest(Inspector):
    pass


class AdminCreateRequest(Admin):
    pass


class VehicleBase(BaseModel):
    manufacturer: str
    model: str
    year: int
    price: float
    mileage: int
    condition: str
    city: Optional[str] = None
    state: Optional[str] = None
    description: Optional[str] = None
    listing_date: Optional[date] = date.today()


class VehicleCreateRequest(VehicleBase):
    pass


class Car(VehicleBase):
    number_of_doors: int
    seating_capacity: int
    transmission: str


class Motorcycle(VehicleBase):
    engine_capacity: float
    bike_type: str


class Truck(VehicleBase):
    cargo_capacity: float
    has_towing_package: bool


class VehiclePhoto(BaseModel):
    vehicle_ID: int
    photo_url: str


class Ad(BaseModel):
    ad_ID: int
    post_date: Optional[date] = date.today()
    expiry_date: date
    is_premium: bool = False
    views: int = 0
    status: str
    owner: int
    associated_vehicle: int


class Offer(BaseModel):
    offer_ID: int
    offer_date: Optional[date] = date.today()
    offer_price: float
    offer_status: str
    counter_offer_price: Optional[float] = None
    offer_owner: int
    sent_to: int


class Transaction(BaseModel):
    transaction_ID: int
    transaction_date: Optional[date] = date.today()
    price: float
    payment_method: str
    payment_status: str
    transaction_type: str
    review: Optional[int] = None
    belonged_ad: Optional[int] = None
    paid_by: Optional[int] = None
    approved_by: Optional[int] = None


class Review(BaseModel):
    review_ID: int
    rating: int
    comment: Optional[str] = None
    review_date: Optional[date] = date.today()
    reviewer: int
    evaluated_user: int


class Auction(BaseModel):
    auction_ID: int
    starting_price: float
    current_highest_bid: float
    end_date: date
    status: str
    belonged_ad: int


class Bid(BaseModel):
    auction_ID: int
    bid_ID: int
    bid_amount: float
    bid_time: Optional[date] = date.today()
    bidder: int


class Wishlist(BaseModel):
    wishlist_ID: int
    user_ID: int
    bookmarked_ad: int
    date_added: Optional[date] = date.today()


class Inspection(BaseModel):
    inspection_ID: int
    vehicle_ID: int
    inspection_date: date
    report: str
    result: str
    related_certification: Optional[int] = None
    done_by: int


class Certification(BaseModel):
    certification_ID: int
    certification_date: date
    expiry_date: date
