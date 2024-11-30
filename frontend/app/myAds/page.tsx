'use client';
import {useState} from 'react';
import Image from 'next/image';
import vehicleData from './vehicleData'; // Adjust path if necessary

export default function SellerDashboard() {
    const [vehicles, setVehicles] = useState(vehicleData);  // No filtering for now
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');

    const mockOffers = [
        {buyerName: 'John Doe', price: 48000},
        {buyerName: 'Jane Smith', price: 49000}
    ];

    const openModal = (vehicle, type) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
        if (type === 'offers') {
            // Show offers in modal
            setIsModalOpen('offers');
        } else {
            // Show details in modal
            setIsModalOpen('details');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
        setOfferPrice('');
    };

    const handleOfferSubmit = (e) => {
        e.preventDefault();
        alert(`Offer of $${offerPrice} submitted for ${selectedVehicle.manufacturer} ${selectedVehicle.model}.`);
        closeModal();
    };

    const handleDeleteListing = (vehicleId) => {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <nav className="bg-white shadow-lg py-4 fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto flex justify-between items-center px-6">
                    <div className="text-3xl font-bold tracking-tight text-blue-600">
                        <span className="text-yellow-400">Car</span>Trade
                    </div>
                    <div className="space-x-6 text-lg font-medium">
                        <a href="/" className="hover:text-yellow-400">Home</a>
                        <a href="#contact" className="hover:text-yellow-400">Contact</a>
                    </div>
                </div>
            </nav>

            <section className="mt-20 bg-white py-6 shadow-md">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-semibold mb-4 text-blue-600">Your Vehicle Listings</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
                        {vehicles.length === 0 ? (
                            <p>No vehicles found.</p>
                        ) : (
                            vehicles.map((vehicle) => (
                                <div key={vehicle.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <Image
                                        src={vehicle.photo}
                                        alt={`${vehicle.manufacturer} ${vehicle.model}`}
                                        width={400}
                                        height={250}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold">{`${vehicle.manufacturer} ${vehicle.model}`}</h3>
                                        <p className="text-sm text-gray-500">{`${vehicle.city}, ${vehicle.state}`}</p>
                                        <p className="text-lg font-semibold text-blue-600">${vehicle.price.toLocaleString()}</p>

                                        <div className="flex space-x-4 mt-4">
                                            <button
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-200"
                                                onClick={() => openModal(vehicle, 'details')}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 focus:outline-none transition-all duration-200"
                                                onClick={() => openModal(vehicle, 'offers')}
                                            >
                                                View Offers
                                            </button>

                                        </div>

                                        <button
                                            className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none transition-all duration-200"
                                            onClick={() => handleDeleteListing(vehicle.id)}
                                        >
                                            Delete Listing
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {isModalOpen && selectedVehicle && isModalOpen === 'details' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div
                        className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105">
                        <div className="mb-6">
                            <img
                                src={selectedVehicle.photo}
                                alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
                                className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-md"
                            />
                        </div>
                        <div className="space-y-2 mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
                            <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Year: {selectedVehicle.year}</p>
                            <p className="text-sm text-gray-600">Condition: {selectedVehicle.condition}</p>
                            <p className="text-sm text-gray-600">Mileage: {selectedVehicle.mileage.toLocaleString()} miles</p>
                            <p className="text-sm text-gray-600">Location: {selectedVehicle.city}, {selectedVehicle.state}</p>
                        </div>
                        <button
                            onClick={closeModal}
                            className="mt-4 w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && selectedVehicle && isModalOpen === 'offers' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div
                        className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-2xl transform transition-all duration-300 ease-in-out scale-105">
                        <div className="mb-6">
                            <img
                                src={selectedVehicle.photo}
                                alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
                                className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="space-y-2 mb-4">
                            <h3 className="text-2xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
                            <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-lg font-semibold text-gray-800">Offers</h4>
                            <div className="space-y-4 mt-4">
                                {mockOffers.length > 0 ? (
                                    mockOffers.map((offer, index) => (
                                        <div key={index}
                                             className="bg-gray-100 p-5 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                                            <p className="text-sm text-gray-600">Offer Price:
                                                ${offer.price.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">From: {offer.buyerName}</p>

                                            <div className="mt-4 flex justify-between gap-3">
                                                <button
                                                    className="py-1.5 px-4 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-200"
                                                    onClick={() => {/* accept offer logic */
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="py-1.5 px-4 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                                                    onClick={() => {/* reject offer logic */
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    className="py-1.5 px-4 text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
                                                    onClick={() => {/* counter offer logic */
                                                    }}
                                                >
                                                    Counter Offer
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">No offers yet.</p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={closeModal}
                            className="mt-6 w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}


            <footer className="bg-gray-800 text-white py-6 mt-6">
                <div className="text-center">
                    <p>&copy; 2024 CarTrade. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
