'use client';
import {useState, useEffect} from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import VehicleDetailModal from './VehicleDetailModal';

export default function BrowseVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        manufacturer: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        condition: '',
        engineCapacity: '',
        bikeType: '',
        cargoCapacity: '',
        hasTowingPackage: false,
    });

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [bookmarked, setBookmarked] = useState(false);

    const fetchAds = async () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:8000/user/${userId}/other-ads`);
            if (response.ok) {
                const data = await response.json();
                setVehicles(data.ads || []);
            } else {
                console.error('Failed to fetch ads');
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleFilterChange = (e) => {
        const {name, type, value, checked} = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        return (
            (filters.type ? vehicle.vehicle_type === filters.type : true) &&
            (filters.manufacturer ? vehicle.manufacturer.includes(filters.manufacturer) : true) &&
            (filters.minPrice ? vehicle.price >= Number(filters.minPrice) : true) &&
            (filters.maxPrice ? vehicle.price <= Number(filters.maxPrice) : true) &&
            (filters.minYear ? vehicle.year >= Number(filters.minYear) : true) &&
            (filters.maxYear ? vehicle.year <= Number(filters.maxYear) : true) &&
            (filters.condition ? vehicle.condition === filters.condition : true) &&
            (filters.engineCapacity
                ? vehicle.engine_capacity && vehicle.engine_capacity >= Number(filters.engineCapacity)
                : true) &&
            (filters.bikeType ? vehicle.bike_type === filters.bikeType : true) &&
            (filters.cargoCapacity
                ? vehicle.cargo_capacity && vehicle.cargo_capacity >= Number(filters.cargoCapacity)
                : true) &&
            (filters.hasTowingPackage
                ? vehicle.has_towing_package === filters.hasTowingPackage
                : true)
        );
    });

    const openModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
        setOfferPrice('');
        setBookmarked(false);
    };

    const handleOfferChange = (e) => {
        setOfferPrice(e.target.value);
    };

    const handleBookmark = () => {
        setBookmarked(!bookmarked);
    };

    const handleOfferSubmit = (e) => {
        e.preventDefault();
        alert(`Offer of $${offerPrice} submitted for ${selectedVehicle.manufacturer} ${selectedVehicle.model}.`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar/>

            {/* Filter Menu */}
            <section className="mt-20 bg-white py-6 shadow-md">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-semibold mb-4 text-blue-600">Filter Vehicles</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <select
                            name="type"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">Vehicle Type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="truck">Truck</option>
                        </select>
                        <input
                            type="text"
                            name="manufacturer"
                            placeholder="Manufacturer"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.manufacturer}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min Price"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Price"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="minYear"
                            placeholder="Min Year"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.minYear}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxYear"
                            placeholder="Max Year"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.maxYear}
                            onChange={handleFilterChange}
                        />
                        <select
                            name="condition"
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                            value={filters.condition}
                            onChange={handleFilterChange}
                        >
                            <option value="">Condition</option>
                            <option value="new">New</option>
                            <option value="used">Used</option>
                            <option value="certified pre-owned">Certified Pre-Owned</option>
                        </select>

                        {/* Motorcycle-specific filters */}
                        {filters.type === 'motorcycle' && (
                            <>
                                <input
                                    type="number"
                                    name="engineCapacity"
                                    placeholder="Min Engine Capacity (cc)"
                                    className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                                    value={filters.engineCapacity}
                                    onChange={handleFilterChange}
                                />
                                <select
                                    name="bikeType"
                                    className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                                    value={filters.bikeType}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Bike Type</option>
                                    <option value="Cruiser">Cruiser</option>
                                    <option value="Sport">Sport</option>
                                    <option value="Touring">Touring</option>
                                    <option value="Naked">Naked</option>
                                    <option value="Adventure">Adventure</option>
                                </select>
                            </>
                        )}

                        {/* Truck-specific filters */}
                        {filters.type === 'truck' && (
                            <>
                                <input
                                    type="number"
                                    name="cargoCapacity"
                                    placeholder="Min Cargo Capacity (lbs)"
                                    className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                                    value={filters.cargoCapacity}
                                    onChange={handleFilterChange}
                                />
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="hasTowingPackage"
                                        checked={filters.hasTowingPackage}
                                        onChange={handleFilterChange}
                                        className="form-checkbox rounded text-blue-600"
                                    />
                                    <span>Has Towing Package</span>
                                </label>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Vehicle Listings */}
            <section className="py-10">
                <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
                    {filteredVehicles.map((vehicle) => (
                        <div key={vehicle.vehicle_ID} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <Image
                                src={vehicle.photo || 'https://picsum.photos/400/250'}
                                alt={`${vehicle.manufacturer} ${vehicle.model}`}
                                width={400}
                                height={250}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-bold">{`${vehicle.manufacturer} ${vehicle.model}`}</h3>
                                <p className="text-sm text-gray-500">{`${vehicle.city}, ${vehicle.state}`}</p>
                                <p className="text-lg font-semibold text-blue-600">${vehicle.price.toLocaleString()}</p>
                                <button
                                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                    onClick={() => openModal(vehicle)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vehicle Detail Modal */}
            <VehicleDetailModal
                selectedVehicle={selectedVehicle}
                isModalOpen={isModalOpen}
                closeModal={closeModal}
                offerPrice={offerPrice}
                handleOfferChange={handleOfferChange}
                handleOfferSubmit={handleOfferSubmit}
                handleBookmark={handleBookmark}
                bookmarked={bookmarked}
            />

            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 Vehicle Marketplace. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
