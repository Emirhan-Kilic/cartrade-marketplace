'use client';
import { useState } from 'react';
import Image from 'next/image';
import vehicleData from './vehicleData'; // Adjust path if necessary
import Navbar from '../components/Navbar';
import VehicleDetailsModal from "./VehicleDetailsModal";
import VehicleOffersModal from "./VehicleOffersModal";
import AddVehicleModal from "./AddVehicleModal";

export default function SellerDashboard() {
    const [vehicles, setVehicles] = useState(vehicleData);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null); // Track modal type (null means no modal is open)
    const [offerPrice, setOfferPrice] = useState('');
    const [newVehicle, setNewVehicle] = useState({
        manufacturer: '',
        model: '',
        price: '',
        year: '',
        mileage: '',
        photo: '',
        vehicleType: ''
    });

    const mockOffers = [
        { buyerName: 'John Doe', price: 48000 },
        { buyerName: 'Jane Smith', price: 49000 }
    ];

    const vehicleTypes = ['Car', 'Truck', 'Motorcycle'];

    // Function to open the modal
    const openModal = (vehicle: any, type: string) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(type);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(null);
        setSelectedVehicle(null);
        setOfferPrice('');
        setNewVehicle({
            manufacturer: '',
            model: '',
            price: '',
            year: '',
            mileage: '',
            photo: '',
            vehicleType: ''
        });
    };

    const handleOfferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Offer of $${offerPrice} submitted for ${selectedVehicle?.manufacturer} ${selectedVehicle?.model}.`);
        closeModal();
    };

    const handleDeleteListing = (vehicleId: number) => {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId));
    };

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        const newVehicleData = {
            id: vehicles.length + 1,
            ...newVehicle
        };
        setVehicles([...vehicles, newVehicleData]);
        closeModal();
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar />

            <section className="mt-20 bg-white py-6 shadow-md">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-semibold mb-4 text-blue-600">Your Vehicle Listings</h2>

                    {/* Add Vehicle Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition-all duration-200"
                            onClick={() => openModal(null, 'addVehicle')}
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
                                        <p className="text-sm text-gray-600">Type: {vehicle.vehicleType}</p>

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

            {/* Add Vehicle Modal */}
            {isModalOpen === 'addVehicle' && (
                <AddVehicleModal
                    isOpen={true}
                    onClose={closeModal}
                    onSubmit={handleAddVehicle}
                />
            )}

            {/* Vehicle Details Modal */}
            {isModalOpen === 'details' && selectedVehicle && (
                <VehicleDetailsModal
                    isOpen={true}
                    selectedVehicle={selectedVehicle}
                    closeModal={closeModal}
                />
            )}

            {/* Vehicle Offers Modal */}
            {isModalOpen === 'offers' && selectedVehicle && (
                <VehicleOffersModal
                    isOpen={true}
                    selectedVehicle={selectedVehicle}
                    offers={mockOffers}
                    closeModal={closeModal}
                    onAcceptOffer={() => {}}
                    onRejectOffer={() => {}}
                    onCounterOffer={() => {}}
                />
            )}
        </div>
    );
}
