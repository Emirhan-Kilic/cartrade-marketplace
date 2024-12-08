'use client';
import { useState } from 'react';
import Image from 'next/image';
import vehicleData from './vehicleData'; // Adjust path if necessary
import Navbar from '../components/Navbar';

export default function SellerDashboard() {
    const [vehicles, setVehicles] = useState(vehicleData);  // No filtering for now
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [newVehicle, setNewVehicle] = useState({
        manufacturer: '',
        model: '',
        price: '',
        year: '',
        mileage: '',
        photo: '',
        vehicleType: ''  // Added vehicleType field
    });

    const mockOffers = [
        { buyerName: 'John Doe', price: 48000 },
        { buyerName: 'Jane Smith', price: 49000 }
    ];

    const vehicleTypes = ['Car', 'Truck', 'Motorcycle'];  // Define vehicle types

    const openModal = (vehicle, type) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
        if (type === 'offers') {
            setIsModalOpen('offers');
        } else {
            setIsModalOpen('details');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
        setOfferPrice('');
        setNewVehicle({
            manufacturer: '',
            model: '',
            price: '',
            year: '',
            mileage: '',
            photo: '',
            vehicleType: ''  // Reset vehicleType field
        });
    };

    const handleOfferSubmit = (e) => {
        e.preventDefault();
        alert(`Offer of $${offerPrice} submitted for ${selectedVehicle.manufacturer} ${selectedVehicle.model}.`);
        closeModal();
    };

    const handleDeleteListing = (vehicleId) => {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId));
    };

    const handleAddVehicle = (e) => {
        e.preventDefault();
        setVehicles([...vehicles, {
            id: vehicles.length + 1, // Generate a unique ID (you may want to improve this logic)
            ...newVehicle
        }]);
        closeModal(); // Close the modal after submitting
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            {/* Navbar */}
            <Navbar />

            <section className="mt-20 bg-white py-6 shadow-md">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-semibold mb-4 text-blue-600">Your Vehicle Listings</h2>

                    {/* Add Vehicle Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition-all duration-200"
                            onClick={() => setIsModalOpen('addVehicle')}
                        >
                            Add Vehicle Listing
                        </button>
                    </div>

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
                                        <p className="text-sm text-gray-600">Type: {vehicle.vehicleType}</p> {/* Display vehicle type */}

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


            {isModalOpen === 'addVehicle' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add New Vehicle</h3>

                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            <div>
                                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-600">Manufacturer</label>
                                <input
                                    type="text"
                                    id="manufacturer"
                                    value={newVehicle.manufacturer}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, manufacturer: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-600">Model</label>
                                <input
                                    type="text"
                                    id="model"
                                    value={newVehicle.model}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-600">Price</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={newVehicle.price}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, price: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-600">Year</label>
                                <input
                                    type="number"
                                    id="year"
                                    value={newVehicle.year}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="mileage" className="block text-sm font-medium text-gray-600">Mileage (miles)</label>
                                <input
                                    type="number"
                                    id="mileage"
                                    value={newVehicle.mileage}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-600">Vehicle Type</label>
                                <select
                                    id="vehicleType"
                                    value={newVehicle.vehicleType}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {vehicleTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dynamic fields based on vehicle type */}
                            {newVehicle.vehicleType === 'Car' && (
                                <>
                                    <div>
                                        <label htmlFor="number_of_doors" className="block text-sm font-medium text-gray-600">Number of Doors</label>
                                        <input
                                            type="number"
                                            id="number_of_doors"
                                            value={newVehicle.number_of_doors}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, number_of_doors: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="seating_capacity" className="block text-sm font-medium text-gray-600">Seating Capacity</label>
                                        <input
                                            type="number"
                                            id="seating_capacity"
                                            value={newVehicle.seating_capacity}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, seating_capacity: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="transmission" className="block text-sm font-medium text-gray-600">Transmission</label>
                                        <select
                                            id="transmission"
                                            value={newVehicle.transmission}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="automatic">Automatic</option>
                                            <option value="semi-automatic">Semi-Automatic</option>
                                            <option value="CVT">CVT</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {newVehicle.vehicleType === 'Motorcycle' && (
                                <>
                                    <div>
                                        <label htmlFor="engine_capacity" className="block text-sm font-medium text-gray-600">Engine Capacity (cc)</label>
                                        <input
                                            type="number"
                                            id="engine_capacity"
                                            value={newVehicle.engine_capacity}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, engine_capacity: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="bike_type" className="block text-sm font-medium text-gray-600">Bike Type</label>
                                        <select
                                            id="bike_type"
                                            value={newVehicle.bike_type}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, bike_type: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        >
                                            <option value="Cruiser">Cruiser</option>
                                            <option value="Sport">Sport</option>
                                            <option value="Touring">Touring</option>
                                            <option value="Naked">Naked</option>
                                            <option value="Adventure">Adventure</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {newVehicle.vehicleType === 'Truck' && (
                                <>
                                    <div>
                                        <label htmlFor="cargo_capacity" className="block text-sm font-medium text-gray-600">Cargo Capacity (kg)</label>
                                        <input
                                            type="number"
                                            id="cargo_capacity"
                                            value={newVehicle.cargo_capacity}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, cargo_capacity: e.target.value })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="has_towing_package" className="block text-sm font-medium text-gray-600">Has Towing Package</label>
                                        <input
                                            type="checkbox"
                                            id="has_towing_package"
                                            checked={newVehicle.has_towing_package}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, has_towing_package: e.target.checked })}
                                            className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label htmlFor="photo" className="block text-sm font-medium text-gray-600">Vehicle Photo URL</label>
                                <input
                                    type="text"
                                    id="photo"
                                    value={newVehicle.photo}
                                    onChange={(e) => setNewVehicle({ ...newVehicle, photo: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-yellow-400 transition"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-200"
                            >
                                Add Vehicle
                            </button>
                        </form>

                        <button
                            onClick={closeModal}
                            className="mt-4 w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}



            {/* Other modals (Details, Offers) remain unchanged */}


            {/* Details Modal */}
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

            {/* Offers Modal */}
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
                                    <p>No offers yet.</p>
                                )}
                            </div>
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
        </div>
    );
}
