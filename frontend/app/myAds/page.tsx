"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import VehicleDetailsModal from './VehicleDetailsModal';
import VehicleOffersModal from './VehicleOffersModal';
import AddVehicleModal from './AddVehicleModal';

export default function SellerDashboard() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
    const [newVehicle, setNewVehicle] = useState({
        manufacturer: '',
        model: '',
        price: '',
        year: '',
        mileage: '',
        photo: '',
        vehicleType: '',
    });

    const [vehicleOffers, setVehicleOffers] = useState<any[]>([]);

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

    const openModal = (vehicle: any, type: string) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(type);
        if (type === 'offers' && vehicle.ad_ID) {
            fetchVehicleOffers(vehicle.ad_ID);
        }
    };

    const closeModal = () => {
        setIsModalOpen(null);
        setSelectedVehicle(null);
        setNewVehicle({
            manufacturer: '',
            model: '',
            price: '',
            year: '',
            mileage: '',
            photo: '',
            vehicleType: '',
        });
        setVehicleOffers([]);
    };

    const fetchVehicleOffers = async (adId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/ad/${adId}/offers`);
            const data = await response.json();
            if (response.ok && data.offers) {
                setVehicleOffers(data.offers);
            } else {
                console.error('Failed to fetch offers', data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    const handleAcceptOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/accept_offer/${offerId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (response.ok) {
                setVehicleOffers((prevOffers) =>
                    prevOffers.map((offer) =>
                        offer.offer_ID === offerId ? { ...offer, offer_status: 'accepted' } : offer
                    )
                );
                alert('Offer accepted successfully!');
            } else {
                alert(`Failed to accept offer: ${data.detail}`);
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
            alert('Error accepting offer');
        }
    };

    const handleRejectOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/reject_offer/${offerId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (response.ok) {
                setVehicleOffers((prevOffers) =>
                    prevOffers.map((offer) =>
                        offer.offer_ID === offerId ? { ...offer, offer_status: 'rejected' } : offer
                    )
                );
                alert('Offer rejected successfully!');
            } else {
                alert(`Failed to reject offer: ${data.detail}`);
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            alert('Error rejecting offer');
        }
    };

    const handleDeleteListing = async (vehicleId: number, adId: number, status: string) => {
        if (status === 'Sold') {
            alert('This vehicle cannot be deleted because it is marked as Sold.');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this ad and vehicle?');

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete_ad/${adId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
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
            ...newVehicle,
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
                                        src={vehicle.photo || 'https://picsum.photos/400/250'}
                                        alt={`${vehicle.manufacturer} ${vehicle.model}`}
                                        width={400}
                                        height={250}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{`${vehicle.manufacturer} ${vehicle.model}`}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{`${vehicle.city}, ${vehicle.state}`}</p>
                                        <p className="text-lg font-semibold text-blue-600 mb-4">${vehicle.price.toLocaleString()}</p>

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
                                            onClick={() =>
                                                handleDeleteListing(vehicle.vehicle_ID, vehicle.ad_ID, vehicle.status)
                                            }
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

            {/* Modals for adding vehicle, vehicle details, and vehicle offers */}
            {isModalOpen === 'addVehicle' && (
                <AddVehicleModal isOpen={true} onClose={closeModal} onSubmit={handleAddVehicle}/>
            )}

            {isModalOpen === 'details' && selectedVehicle && (
                <VehicleDetailsModal
                    isOpen={true}
                    selectedVehicle={selectedVehicle}
                    closeModal={closeModal}
                />
            )}

            {isModalOpen === 'offers' && selectedVehicle && (
                <VehicleOffersModal
                    isOpen={true}
                    selectedVehicle={selectedVehicle}
                    offers={vehicleOffers}
                    closeModal={closeModal}
                    onAcceptOffer={handleAcceptOffer}
                    onRejectOffer={handleRejectOffer}
                />
            )}
        </div>
    );
}
