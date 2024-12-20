'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar component

export default function MyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [userId, setUserId] = useState<string | null>(null); // Define userId state

  // Retrieve userId from sessionStorage
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId); // Update userId state
    } else {
      console.error('User ID not found in sessionStorage');
    }
  }, []);

  // Fetch offers from the API on page load
  useEffect(() => {
    if (userId) {
      const fetchOffers = async () => {
        try {
          const response = await fetch(`http://localhost:8000/user/${userId}/offers`);
          const data = await response.json();

          if (data.message === 'Offers fetched successfully') {
            setOffers(data.offers);
          }
        } catch (error) {
          console.error('Error fetching offers:', error);
        }
      };

      fetchOffers();
    } else {
      console.error('User ID not found in sessionStorage');
    }
  }, [userId]);

  const handleCancelOffer = (offerId: number) => {
    setOffers(offers.filter((offer) => offer.offer_ID !== offerId));
  };

  const openPaymentModal = (offer: any) => {
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
    alert(`Payment of $${selectedOffer.offer_price} for offer from ${selectedOffer.buyerName} has been processed with ${paymentMethod}.`);
    setOffers(offers.filter((offer) => offer.offer_ID !== selectedOffer.offer_ID)); // Remove paid offer from list
    closePaymentModal();
  };

  // Style the status text based on its value
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white font-semibold py-1 px-3 rounded-full';
      case 'accepted':
        return 'bg-green-600 text-white font-semibold py-1 px-3 rounded-full';
      case 'rejected':
        return 'bg-red-600 text-white font-semibold py-1 px-3 rounded-full';
      default:
        return 'bg-gray-400 text-white font-semibold py-1 px-3 rounded-full';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      <Navbar /> {/* Use Navbar component */}

      <section className="mt-20 bg-white py-6 shadow-md flex-grow">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6 text-blue-600">My Offers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.length === 0 ? (
              <p className="text-center text-xl text-gray-600">No offers made yet.</p>
            ) : (
              offers.map((offer) => {
                return (
                  <div key={offer.offer_ID} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between transition-all duration-200 hover:scale-105">
                    <img
                      src={`https://picsum.photos/400/250`} // Assuming the URL for vehicle photos
                      alt={`${offer.manufacturer} ${offer.model}`}
                      className="rounded-lg mb-4 w-full h-48 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-gray-800">
                      {offer.manufacturer} {offer.model} ({offer.year})
                    </h3>
                    <p className="text-sm text-gray-500">Condition: {offer.condition}</p>
                    <p className="text-sm text-gray-500">Mileage: {offer.mileage.toLocaleString()} km</p>
                    <p className="text-sm text-gray-500">Location: {offer.city}, {offer.state}</p>
                    <p className="text-lg font-semibold text-blue-600">${offer.offer_price.toLocaleString()}</p>

                    {/* Status with style */}
                    <div className="mt-4">
                      <span className={getStatusStyle(offer.offer_status)}>
                        {offer.offer_status.charAt(0).toUpperCase() + offer.offer_status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-6 flex gap-4">
                      {offer.offer_status === 'pending' && (
                        <button
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none transition-all duration-200"
                          onClick={() => handleCancelOffer(offer.offer_ID)}
                        >
                          Cancel Offer
                        </button>
                      )}
                      {offer.offer_status === 'accepted' && (
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
            <p className="text-xl font-bold text-blue-600">${selectedOffer.offer_price.toLocaleString()}</p>

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
