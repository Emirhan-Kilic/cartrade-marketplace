import React from 'react';
import Image from 'next/image';

interface Vehicle {
    vehicle_ID: string;
    photo: string;
    manufacturer: string;
    model: string;
    price: number;
    year: number;
    condition: string;
    mileage: number;
    city: string;
    state: string;
    vehicle_type: string; // Updated property name
    engine_capacity?: number;
    bike_type?: string;
    cargo_capacity?: number;
    has_towing_package?: boolean;
    ad_owner: number;  // User ID of the ad owner
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    rating: number;
    join_date: string;
    number_of_doors?: number;
    seating_capacity?: number;
    transmission?: string;
    description?: string; // Added description field
}

interface Props {
    selectedVehicle: Vehicle | null;
    isModalOpen: boolean;
    closeModal: () => void;
    offerPrice: string;
    handleOfferChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleOfferSubmit: (e: React.FormEvent) => void;
    handleBookmark: () => void;
    bookmarked: boolean;
}

const VehicleDetailModal: React.FC<Props> = ({
                                                 selectedVehicle,
                                                 isModalOpen,
                                                 closeModal,
                                                 offerPrice,
                                                 handleOfferChange,
                                                 handleOfferSubmit,
                                                 handleBookmark,
                                                 bookmarked
                                             }) => {
    if (!selectedVehicle) return null;

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ${!isModalOpen ? 'hidden' : ''}`}
        >
            <div
                className="bg-white rounded-lg w-full sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {/* Vehicle Image */}
                <div className="mb-6">
                    <img
                        src={selectedVehicle.photo || 'https://picsum.photos/400/250'}
                        alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
                        className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-md"
                    />
                </div>

                {/* Vehicle Basic Information */}
                <div className="space-y-4 mb-6">
                    <h3 className="text-3xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
                    <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>

                    <p className="text-sm text-gray-600">Year: {selectedVehicle.year}</p>
                    <p className="text-sm text-gray-600">Condition: {selectedVehicle.condition}</p>
                    <p className="text-sm text-gray-600">Mileage: {selectedVehicle.mileage.toLocaleString()} miles</p>
                    <p className="text-sm text-gray-600">Location: {selectedVehicle.city}, {selectedVehicle.state}</p>
                </div>

                {/* Specific Details Based on Vehicle Type */}
                <div className="space-y-4 mb-6">
                    {selectedVehicle.vehicle_type === 'car' && (
                        <>
                            {selectedVehicle.number_of_doors && (
                                <p className="text-sm text-gray-600">Number of
                                    Doors: {selectedVehicle.number_of_doors}</p>
                            )}
                            {selectedVehicle.seating_capacity && (
                                <p className="text-sm text-gray-600">Seating
                                    Capacity: {selectedVehicle.seating_capacity}</p>
                            )}
                            {selectedVehicle.transmission && (
                                <p className="text-sm text-gray-600">Transmission: {selectedVehicle.transmission}</p>
                            )}
                        </>
                    )}

                    {selectedVehicle.vehicle_type === 'motorcycle' && (
                        <>
                            {selectedVehicle.engine_capacity && (
                                <p className="text-sm text-gray-600">Engine
                                    Capacity: {selectedVehicle.engine_capacity} cc</p>
                            )}
                            {selectedVehicle.bike_type && (
                                <p className="text-sm text-gray-600">Bike Type: {selectedVehicle.bike_type}</p>
                            )}
                        </>
                    )}

                    {selectedVehicle.vehicle_type === 'truck' && (
                        <>
                            {selectedVehicle.cargo_capacity && (
                                <p className="text-sm text-gray-600">Cargo
                                    Capacity: {selectedVehicle.cargo_capacity} lbs</p>
                            )}
                            {selectedVehicle.has_towing_package && (
                                <p className="text-sm text-gray-600">Has Towing Package</p>
                            )}
                        </>
                    )}
                </div>

                {/* Description */}
                {selectedVehicle.description && (
                    <div className="space-y-4 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800">Description</h4>
                        <p className="text-sm text-gray-600">{selectedVehicle.description}</p>
                    </div>
                )}

                {/* Seller Info */}
                <div className="space-y-4 mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-800">Seller Info</h4>
                    <div className="flex items-center space-x-4">
                        <img
                            src="https://picsum.photos/50" // Mock profile image URL
                            alt="Seller Profile"
                            className="w-12 h-12 object-cover rounded-full shadow-sm"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-800">{`${selectedVehicle.first_name} ${selectedVehicle.last_name}`}</p>
                            <p className="text-xs text-gray-600">Rating: {selectedVehicle.rating ? selectedVehicle.rating : 'Not Rated'}</p>
                            <p className="text-xs text-gray-600">Email: {selectedVehicle.email}</p>
                            <p className="text-xs text-gray-600">Phone: {selectedVehicle.phone_number}</p>
                            <p className="text-xs text-gray-600">Address: {selectedVehicle.address}</p>
                            <p className="text-xs text-gray-600">Joined: {new Date(selectedVehicle.join_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mt-6">
                    <button
                        onClick={handleBookmark}
                        className={`w-full py-2 text-white rounded-lg font-medium transition-all duration-300 ${bookmarked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {bookmarked ? 'Remove Bookmark' : 'Bookmark Vehicle'}
                    </button>

                    <form onSubmit={handleOfferSubmit} className="space-y-4">
                        <input
                            type="number"
                            value={offerPrice}
                            onChange={handleOfferChange}
                            placeholder="Enter your offer price"
                            className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300"
                        >
                            Submit Offer
                        </button>
                    </form>
                </div>

                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="mt-4 w-full py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default VehicleDetailModal;
