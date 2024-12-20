import React, {useState} from 'react';

interface Offer {
    offer_ID: number;
    offer_date: string;
    offer_price: number;
    offer_status: 'pending' | 'accepted' | 'rejected';
    counter_offer_price: number | null;
    offer_owner: number;
    first_name: string;
    last_name: string;
    offer_owner_email: string;
    ad_ID: number;
    vehicle_ID: number;
    manufacturer: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    condition: string;
    city: string;
    state: string;
    description: string;
    photo: string;
}

interface VehicleOffersModalProps {
    isOpen: boolean;
    selectedVehicle: {
        photo: string;
        manufacturer: string;
        model: string;
        price: number;
    } | null;
    offers: Offer[];
    closeModal: () => void;
}

const VehicleOffersModal: React.FC<VehicleOffersModalProps> = ({
                                                                   isOpen,
                                                                   selectedVehicle,
                                                                   offers,
                                                                   closeModal,
                                                               }) => {
    const [counterOfferPrice, setCounterOfferPrice] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});

    if (!isOpen || !selectedVehicle) return null;

    const isAnyOfferAccepted = offers.some((offer) => offer.offer_status === 'accepted');

    const handleCounterOfferChange = (offerId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        setCounterOfferPrice({
            ...counterOfferPrice,
            [offerId]: e.target.value,
        });
    };

    const handleSubmitCounterOffer = async (offerId: number) => {
        const price = parseFloat(counterOfferPrice[offerId]);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid counter offer price');
            return;
        }

        setLoading({...loading, [offerId]: true});

        try {
            const response = await fetch(`http://localhost:8000/counter_offer/${offerId}/${price}`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to update counter offer');
            }

            setCounterOfferPrice({
                ...counterOfferPrice,
                [offerId]: '',
            });

            closeModal(); // Close modal after counter offer submission
        } catch (error) {
            alert('Error updating counter offer: ' + error.message);
        } finally {
            setLoading({...loading, [offerId]: false});
        }
    };

    const handleAcceptOffer = async (offerId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/accept_offer/${offerId}`, {
                method: 'PUT',
            });
            const data = await response.json();
            if (response.ok) {
                alert('Offer accepted successfully!');
                closeModal(); // Close modal after successful acceptance
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
                alert('Offer rejected successfully!');
                closeModal(); // Close modal after successful rejection
            } else {
                alert(`Failed to reject offer: ${data.detail}`);
            }
        } catch (error) {
            console.error('Error rejecting offer:', error);
            alert('Error rejecting offer');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-hidden">
            <div
                className="bg-white rounded-lg w-full sm:w-80 md:w-96 lg:w-1/3 p-6 sm:p-8 shadow-2xl transform transition-all duration-300 ease-in-out scale-105 max-w-full overflow-hidden flex flex-col py-8 px-4 space-y-4">
                <div className="mb-6">
                    <img
                        src={selectedVehicle.photo || 'https://picsum.photos/400/250'}
                        alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
                        className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-lg"
                    />
                </div>
                <div className="space-y-2 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
                    <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>
                </div>

                <div className="mt-4 flex-grow overflow-y-auto max-h-80 space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Offers</h4>
                    {offers.length > 0 ? (
                        offers.map((offer) => {
                            const isOfferRejected = offer.offer_status === 'rejected';
                            const isOfferAccepted = offer.offer_status === 'accepted';
                            const isCounterOfferPending = offer.counter_offer_price !== null && offer.offer_status === 'pending';

                            const isDisabled = isAnyOfferAccepted || isOfferAccepted || isOfferRejected || isCounterOfferPending;

                            return (
                                <div
                                    key={offer.offer_ID}
                                    className="bg-gray-100 p-5 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105"
                                >
                                    <p className="text-lg font-semibold text-gray-800">
                                        Offer Price:
                                        <span className="text-xl text-blue-600">
                                            ${offer.offer_price.toLocaleString()}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        From: <strong>{offer.first_name} {offer.last_name}</strong>
                                    </p>
                                    <p className="text-xs text-gray-500">Email: {offer.offer_owner_email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Offer Date: {new Date(offer.offer_date).toLocaleString()}
                                    </p>

                                    <p className="text-sm font-medium text-green-600 mt-2">
                                        Status: {offer.offer_status}
                                    </p>

                                    {offer.counter_offer_price && (
                                        <p className="text-sm text-yellow-600 mt-2">
                                            Counter Offer: ${offer.counter_offer_price.toLocaleString()}
                                        </p>
                                    )}

                                    {!offer.counter_offer_price && !isOfferAccepted && !isOfferRejected && (
                                        <div className="mt-4">
                                            <label className="text-sm text-gray-700"
                                                   htmlFor={`counterOffer-${offer.offer_ID}`}>
                                                Enter Counter Offer Price:
                                            </label>
                                            <input
                                                type="number"
                                                id={`counterOffer-${offer.offer_ID}`}
                                                value={counterOfferPrice[offer.offer_ID] || ''}
                                                onChange={(e) => handleCounterOfferChange(offer.offer_ID, e)}
                                                className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter a new price"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-between gap-3">
                                        <button
                                            className={`py-2 px-5 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300'}`}
                                            disabled={isDisabled}
                                            onClick={() => handleAcceptOffer(offer.offer_ID)}
                                        >
                                            Accept
                                        </button>

                                        <button
                                            className={`py-2 px-5 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300'}`}
                                            disabled={isDisabled}
                                            onClick={() => handleRejectOffer(offer.offer_ID)}
                                        >
                                            Reject
                                        </button>

                                        <button
                                            className={`py-2 px-5 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300'}`}
                                            onClick={() => handleSubmitCounterOffer(offer.offer_ID)}
                                            disabled={isDisabled || !counterOfferPrice[offer.offer_ID] || loading[offer.offer_ID]}
                                        >
                                            {loading[offer.offer_ID] ? 'Updating...' : 'Counter Offer'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No offers yet.</p>
                    )}
                </div>

                <button
                    onClick={closeModal}
                    className="mt-4 w-full py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default VehicleOffersModal;
