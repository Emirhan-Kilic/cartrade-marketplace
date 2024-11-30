'use client';
import {useState} from 'react';
import Image from 'next/image';
import vehicleData from './vehicleData'; // Adjust the path if necessary

export default function BrowseVehicles() {
    const [vehicles, setVehicles] = useState(vehicleData);
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

    const handleFilterChange = (e) => {
        const {name, type, value, checked} = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        return (
            (filters.type ? vehicle.type === filters.type : true) &&
            (filters.manufacturer ? vehicle.manufacturer.includes(filters.manufacturer) : true) &&
            (filters.minPrice ? vehicle.price >= Number(filters.minPrice) : true) &&
            (filters.maxPrice ? vehicle.price <= Number(filters.maxPrice) : true) &&
            (filters.minYear ? vehicle.year >= Number(filters.minYear) : true) &&
            (filters.maxYear ? vehicle.year <= Number(filters.maxYear) : true) &&
            (filters.condition ? vehicle.condition === filters.condition : true) &&
            (filters.engineCapacity
                ? vehicle.engineCapacity && vehicle.engineCapacity >= Number(filters.engineCapacity)
                : true) &&
            (filters.bikeType ? vehicle.bikeType === filters.bikeType : true) &&
            (filters.cargoCapacity
                ? vehicle.cargoCapacity && vehicle.cargoCapacity >= Number(filters.cargoCapacity)
                : true) &&
            (filters.hasTowingPackage
                ? vehicle.hasTowingPackage === filters.hasTowingPackage
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
        // Handle offer submission logic here (e.g., send it to the backend or store it)
        alert(`Offer of $${offerPrice} submitted for ${selectedVehicle.manufacturer} ${selectedVehicle.model}.`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-lg py-4 fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto flex justify-between items-center px-6">
                    <div className="text-3xl font-bold tracking-tight text-blue-600">
                        <span className="text-yellow-400">Car</span>Trade
                    </div>
                    <div className="space-x-6 text-lg font-medium">
                        <a href="/" className="hover:text-yellow-400">
                            Home
                        </a>
                        <a href="#contact" className="hover:text-yellow-400">
                            Contact
                        </a>
                    </div>
                </div>
            </nav>

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
{isModalOpen && selectedVehicle && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105">

      {/* Vehicle Image */}
      <div className="mb-6">
        <img
          src={selectedVehicle.photo}
          alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
          className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Vehicle Basic Information */}
      <div className="space-y-2 mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
        <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>

        <p className="text-sm text-gray-600">Year: {selectedVehicle.year}</p>
        <p className="text-sm text-gray-600">Condition: {selectedVehicle.condition}</p>
        <p className="text-sm text-gray-600">Mileage: {selectedVehicle.mileage.toLocaleString()} miles</p>
        <p className="text-sm text-gray-600">Location: {selectedVehicle.city}, {selectedVehicle.state}</p>
      </div>

      {/* Vehicle Specific Info based on Type */}
      {selectedVehicle.type === 'motorcycle' && (
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">Engine Capacity: {selectedVehicle.engineCapacity} cc</p>
          <p className="text-sm text-gray-600">Bike Type: {selectedVehicle.bikeType}</p>
        </div>
      )}

      {selectedVehicle.type === 'truck' && (
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">Cargo Capacity: {selectedVehicle.cargoCapacity} lbs</p>
          {selectedVehicle.hasTowingPackage && (
            <p className="text-sm text-gray-600">Has Towing Package</p>
          )}
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
            <p className="text-sm font-medium text-gray-800">John Doe</p>
            <p className="text-xs text-gray-600">Rating: 4.8/5</p>
            <p className="text-xs text-gray-600">Email: johndoe@example.com</p>
            <p className="text-xs text-gray-600">Phone: (123) 456-7890</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-6">
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          className={`w-full py-2 text-white rounded-lg font-medium transition-all duration-300 ${bookmarked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {bookmarked ? 'Remove Bookmark' : 'Bookmark Vehicle'}
        </button>

        {/* Offer Form */}
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
        className="mt-4 w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
      >
        Close
      </button>
    </div>
  </div>
)}





            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 CarTrade. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
