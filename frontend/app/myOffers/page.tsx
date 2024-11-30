'use client';
import { useState } from 'react';
import vehicleData from './vehicleData'; // Import the vehicle data

const mockOffers = [
  { id: 1, vehicleId: 1, buyerName: 'John Doe', price: 48000, status: 'Pending' },
  { id: 2, vehicleId: 2, buyerName: 'Jane Smith', price: 49000, status: 'Accepted' },
  { id: 3, vehicleId: 3, buyerName: 'Alice Brown', price: 50000, status: 'Rejected' },
];

export default function MyOffersPage() {
  const [offers, setOffers] = useState(mockOffers);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const handleCancelOffer = (offerId) => {
    setOffers(offers.filter((offer) => offer.id !== offerId));
  };

  const openPaymentModal = (offer) => {
    setSelectedOffer(offer);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentMethod('');
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    alert(`Payment of $${selectedOffer.price} for offer from ${selectedOffer.buyerName} has been processed with ${paymentMethod}.`);
    setOffers(offers.filter((offer) => offer.id !== selectedOffer.id)); // Remove paid offer from list
    closePaymentModal();
  };

  // Find vehicle details by vehicleId
  const getVehicleDetails = (vehicleId) => {
    return vehicleData.find(vehicle => vehicle.id === vehicleId);
  };

  // Style the status text based on its value
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500 text-white font-semibold py-1 px-3 rounded-full';
      case 'Accepted':
        return 'bg-green-600 text-white font-semibold py-1 px-3 rounded-full';
      case 'Rejected':
        return 'bg-red-600 text-white font-semibold py-1 px-3 rounded-full';
      default:
        return 'bg-gray-400 text-white font-semibold py-1 px-3 rounded-full';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      <nav className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="text-3xl font-bold tracking-tight text-blue-600">
            <span className="text-yellow-400">Car</span>Trade
          </div>
          <div className="space-x-6 text-lg font-medium">
            <a href="/" className="hover:text-yellow-400">Home</a>
            <a href="#contact" className="hover:text-yellow-400">Contact</a>
            <a href="/my-offers" className="hover:text-yellow-400">My Offers</a>
          </div>
        </div>
      </nav>

      <section className="mt-20 bg-white py-6 shadow-md flex-grow">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6 text-blue-600">My Offers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.length === 0 ? (
              <p className="text-center text-xl text-gray-600">No offers made yet.</p>
            ) : (
              offers.map((offer) => {
                const vehicle = getVehicleDetails(offer.vehicleId);
                return (
                  <div key={offer.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between transition-all duration-200 hover:scale-105">
                    <img src={vehicle?.photo} alt={`${vehicle?.manufacturer} ${vehicle?.model}`} className="rounded-lg mb-4 w-full h-48 object-cover" />
                    <h3 className="text-xl font-semibold text-gray-800">{vehicle?.manufacturer} {vehicle?.model} ({vehicle?.year})</h3>
                    <p className="text-sm text-gray-500">Type: {vehicle?.type}</p>
                    <p className="text-lg font-semibold text-blue-600">${vehicle?.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Mileage: {vehicle?.mileage} miles</p>
                    <p className="text-sm text-gray-600">Condition: {vehicle?.condition}</p>
                    <p className="text-sm text-gray-600">Location: {vehicle?.city}, {vehicle?.state}</p>

                    {/* Status with style */}
                    <div className="mt-4">
                      <span className={getStatusStyle(offer.status)}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="mt-6 flex gap-4">
                      {offer.status === 'Pending' && (
                        <button
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none transition-all duration-200"
                          onClick={() => handleCancelOffer(offer.id)}
                        >
                          Cancel Offer
                        </button>
                      )}
                      {offer.status === 'Accepted' && (
                        <button
                          className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 focus:outline-none transition-all duration-200"
                          onClick={() => openPaymentModal(offer)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {isPaymentModalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105">
            <h3 className="text-2xl font-semibold text-gray-800">Payment for {selectedOffer.buyerName}</h3>
            <p className="text-xl font-bold text-blue-600">${selectedOffer.price.toLocaleString()}</p>

            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">Select Payment Method</h4>
              <select
                className="w-full py-2 px-4 mt-2 border rounded-lg"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Select Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="mt-6 flex justify-between gap-4">
              <button
                className="w-full py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none transition-all duration-200"
                onClick={handlePayment}
              >
                Pay Now
              </button>
              <button
                className="w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-all duration-200"
                onClick={closePaymentModal}
              >
                Close
              </button>
            </div>
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
