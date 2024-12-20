'use client';
import {useState, useEffect} from 'react';
import Navbar from '../components/Navbar'; // Import Navbar component

export default function MyOffersPage() {
    const [offers, setOffers] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [userId, setUserId] = useState<string | null>(null); // Define userId state
    const [userBalance, setUserBalance] = useState(0); // State for user's balance

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

    // Fetch user's balance when payment modal is opened
    useEffect(() => {
        if (userId && isPaymentModalOpen && selectedOffer) {
            const fetchBalance = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/user/${userId}/balance`);
                    const data = await response.json();
                    setUserBalance(data.balance);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            };
            fetchBalance();
        }
    }, [userId, isPaymentModalOpen, selectedOffer]);

    // Handle canceling an offer by calling the delete_offer API
    const handleCancelOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/delete_offer/${offerId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.message === 'Offer deleted successfully') {
                // If the offer was successfully deleted, update the state to reflect the change
                setOffers(offers.filter((offer) => offer.offer_ID !== offerId));
                alert('Offer canceled successfully.');
            } else {
                alert('Error canceling offer: ' + data.detail);
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    // Open payment modal for a selected offer
    const openPaymentModal = (offer: any) => {
        setSelectedOffer(offer);
        setIsPaymentModalOpen(true);
    };

    // Close payment modal
    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setPaymentMethod('');
    };

    // Handle payment processing
    const handlePayment = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method.');
            return;
        }

        // Use the counter offer price if available, otherwise use the original offer price
        const paymentPrice = selectedOffer.counter_offer_price || selectedOffer.offer_price;

        if (userBalance < paymentPrice) {
            alert('Insufficient balance for this payment.');
            return;
        }
        alert(`Payment of $${paymentPrice} for offer from ${selectedOffer.buyerName} has been processed with ${paymentMethod}.`);

        console.log(selectedOffer)
        // Prepare the URL with query parameters for transaction data
        const transactionUrl = new URL('http://localhost:8000/create_transaction/');
        transactionUrl.searchParams.append('price', paymentPrice);
        transactionUrl.searchParams.append('payment_method', paymentMethod);
        transactionUrl.searchParams.append('transaction_type', 'purchase');
        transactionUrl.searchParams.append('paid_by', parseInt(userId, 10));
        transactionUrl.searchParams.append('belonged_ad', selectedOffer.ad_ID); // Add belonged_ad (ad_id)

        console.log(transactionUrl.toString()); // This will show the URL being sent

        // Send payment data using GET request with query parameters
        try {
            const response = await fetch(transactionUrl.toString(), {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                },
                body: '', // No body content as the data is sent in the URL
            });

            const data = await response.json();
            if (data.message === 'Transaction created successfully') {
                // Remove paid offer from the list
                setOffers(offers.filter((offer) => offer.offer_ID !== selectedOffer.offer_ID));
                closePaymentModal();
                alert('Transaction successful!');
            } else {
                alert('Error processing transaction: ' + data.detail);
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };


    // Accept a counter offer
    const handleAcceptCounterOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/accept_offer/${offerId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (data.message === 'Offer accepted successfully') {
                alert('Offer accepted successfully!');
                // Reload the page to fetch updated offers
                window.location.reload();
            }
        } catch (error) {
            console.error('Error accepting offer:', error);
        }
    };

    // Reject a counter offer
    const handleRejectCounterOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/reject_offer/${offerId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (data.message === 'Offer rejected successfully') {
                alert('Offer rejected!');
                // Reload the page to fetch updated offers
                window.location.reload();
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
        }
    };

    // Style the status text based on its value
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'accepted':
                return 'bg-green-600 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'rejected':
                return 'bg-red-600 text-white font-medium py-1 px-3 rounded-full text-sm';
            default:
                return 'bg-gray-400 text-white font-medium py-1 px-3 rounded-full text-sm';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar/> {/* Use Navbar component */}

            <section className="mt-20 bg-white py-6 shadow-xl flex-grow">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-8 text-blue-700 text-center">My Offers</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.length === 0 ? (
                            <p className="text-center text-xl text-gray-600">No offers made yet.</p>
                        ) : (
                            offers.map((offer) => {
                                return (
                                    <div
                                        key={offer.offer_ID}
                                        className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-200 hover:scale-105"
                                    >
                                        <img
                                            src={`https://picsum.photos/400/250`} // Assuming the URL for vehicle photos
                                            alt={`${offer.manufacturer} ${offer.model}`}
                                            className="rounded-xl mb-4 w-full h-48 object-cover"
                                        />
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {offer.manufacturer} {offer.model} ({offer.year})
                                        </h3>
                                        <p className="text-sm text-gray-600">Condition: {offer.condition}</p>
                                        <p className="text-sm text-gray-600">Mileage: {offer.mileage.toLocaleString()} km</p>
                                        <p className="text-sm text-gray-600">Location: {offer.city}, {offer.state}</p>
                                        <p className="text-lg font-semibold text-blue-700 mt-2">${offer.offer_price.toLocaleString()}</p>

                                        {/* Show counter offer if available */}
                                        {offer.counter_offer_price && (
                                            <div
                                                className="mt-4 bg-blue-100 p-4 rounded-lg border-2 border-blue-500 shadow-lg">
                                                <p className="text-lg font-semibold text-blue-700">Counter Offer
                                                    Made:</p>
                                                <p className="text-xl font-bold text-blue-800">${offer.counter_offer_price.toLocaleString()}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <button
                                                        className={`bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 ${
                                                            offer.offer_status === 'rejected' || offer.offer_status === 'accepted' ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                        onClick={() => handleAcceptCounterOffer(offer.offer_ID)} // Use offer_ID here
                                                        disabled={offer.offer_status === 'rejected' || offer.offer_status === 'accepted'}
                                                    >
                                                        Accept Counter Offer
                                                    </button>
                                                    <button
                                                        className={`bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200 ${
                                                            offer.offer_status === 'rejected' || offer.offer_status === 'accepted' ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                        onClick={() => handleRejectCounterOffer(offer.offer_ID)} // Use offer_ID here
                                                        disabled={offer.offer_status === 'rejected' || offer.offer_status === 'accepted'}
                                                    >
                                                        Reject Counter Offer
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status with style */}
                                        <div className="mt-4">
                      <span className={getStatusStyle(offer.offer_status)}>
                        {offer.offer_status.charAt(0).toUpperCase() + offer.offer_status.slice(1)}
                      </span>
                                        </div>

                                        <div className="mt-6 flex gap-4">
                                            {offer.offer_status === 'pending' && (
                                                <button
                                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200"
                                                    onClick={() => handleCancelOffer(offer.offer_ID)}
                                                >
                                                    Cancel Offer
                                                </button>
                                            )}

                                        </div>
                                        <div className="mt-6 flex gap-4">
                                            {offer.offer_status === 'accepted' && (
                                                <button
                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
                                                    onClick={() => openPaymentModal(offer)}
                                                >
                                                    Make Payment
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

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-2xl font-semibold text-center text-blue-700">Make Payment</h3>
                        <p className="mt-4 text-sm text-gray-700">Your balance: ${userBalance.toLocaleString()}</p>
                        <p className="mt-2 text-lg text-gray-700">Amount:
                            ${selectedOffer?.counter_offer_price || selectedOffer?.offer_price}</p>

                        <div className="mt-4">
                            <select
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="">Select Payment Method</option>
                                <option value="credit_card">Credit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="crypto">Crypto</option>
                            </select>
                        </div>


                        <div className="mt-6 flex justify-between">
                            <button
                                className="bg-gray-400 text-white py-2 px-4 rounded-lg"
                                onClick={closePaymentModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
                                onClick={handlePayment}
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
