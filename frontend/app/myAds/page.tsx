'use client';
import {useState, useEffect} from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import VehicleDetailsModal from "./VehicleDetailsModal";
import VehicleOffersModal from "./VehicleOffersModal";
import AddVehicleModal from "./AddVehicleModal";

export default function SellerDashboard() {
    const [vehicles, setVehicles] = useState<any[]>([]); // Use 'any[]' to avoid strict typing
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null); // Track modal type
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

    // Fetch vehicles data from the API on component mount
    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            const fetchVehicles = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/user/${userId}/vehicles`);
                    const data = await response.json();
                    if (response.ok && data.vehicles) {
                        setVehicles(data.vehicles);
                    } else {
                        console.error('Failed to fetch vehicles', data);
                    }
                } catch (error) {
                    console.error('Error fetching vehicles:', error);
                }
            };

            fetchVehicles();
        } else {
            console.error('User ID not found in session storage');
        }
    }, []);

    const mockOffers = [
        {buyerName: 'John Doe', price: 48000},
        {buyerName: 'Jane Smith', price: 49000}
    ];

    const openModal = (vehicle: any, type: string) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(type);
    };

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

    const handleDeleteListing = async (vehicleId: number, adId: number, status: string) => {
        if (status === 'Sold') {
            alert('This vehicle cannot be deleted because it is marked as Sold.');
            return; // Prevent deletion if status is "Sold"
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this ad and vehicle?');

        if (!confirmDelete) {
            return; // If the user cancels, do nothing
        }

        try {
            // Make a DELETE request to the backend
            const response = await fetch(`http://localhost:8000/delete_ad/${adId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // If deletion was successful, update the vehicles state
                setVehicles((prevVehicles) =>
                    prevVehicles.filter((vehicle) => vehicle.vehicle_ID !== vehicleId)
                );
                alert('Ad and vehicle deleted successfully');
            } else {
                const data = await response.json();
                alert(`Failed to delete: ${data.detail}`);
            }
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('Error deleting ad');
        }
    };


    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        const newVehicleData = {
            vehicle_ID: vehicles.length + 1,
            ...newVehicle
        };
        setVehicles([...vehicles, newVehicleData]);
        closeModal();
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar/>

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
                                <div
                                    key={vehicle.vehicle_ID}
                                    className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200"
                                >
                                    <Image
                                        src={vehicle.photo || 'https://picsum.photos/400/250'} // Fallback to default image if no photo
                                        alt={`${vehicle.manufacturer} ${vehicle.model}`}
                                        width={400}
                                        height={250}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{`${vehicle.manufacturer} ${vehicle.model}`}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{`${vehicle.city}, ${vehicle.state}`}</p>
                                        <p className="text-lg font-semibold text-blue-600 mb-4">${vehicle.price.toLocaleString()}</p>

                                        {/* Vehicle Details Section */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                vehicle.status === 'Active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >
                            Status: {vehicle.status}
                        </span>
                                            <div className="flex items-center text-gray-500 text-xs">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 mr-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 10l4.5-4.5m-9 9l-4.5 4.5M19.5 5.5l-9 9m0-9l9 9"
                                                    />
                                                </svg>
                                                {vehicle.views} Views
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    vehicle.is_premium
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                            {vehicle.is_premium ? 'Premium' : 'Not Premium'}
                        </span>
                                        </div>

                                        <div className="flex space-x-4">
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
                                            onClick={() => handleDeleteListing(vehicle.vehicle_ID, vehicle.ad_ID, vehicle.status)}
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
                    onAcceptOffer={() => {
                    }}
                    onRejectOffer={() => {
                    }}
                    onCounterOffer={() => {
                    }}
                />
            )}
        </div>
    );
}
