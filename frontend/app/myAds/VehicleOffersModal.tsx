import React from 'react';

interface Offer {
    price: number;
    buyerName: string;
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
    onAcceptOffer: (offer: Offer) => void;
    onRejectOffer: (offer: Offer) => void;
    onCounterOffer: (offer: Offer) => void;
}

const VehicleOffersModal: React.FC<VehicleOffersModalProps> = ({
    isOpen,
    selectedVehicle,
    offers,
    closeModal,
    onAcceptOffer,
    onRejectOffer,
    onCounterOffer,
}) => {
    if (!isOpen || !selectedVehicle) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-hidden">
            <div className="bg-white rounded-lg w-full sm:w-80 md:w-96 lg:w-1/3 p-6 sm:p-8 shadow-2xl transform transition-all duration-300 ease-in-out scale-105 max-w-full overflow-hidden">
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
                    <div className="space-y-4 mt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {offers.length > 0 ? (
                            offers.map((offer, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-100 p-5 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105"
                                >
                                    <p className="text-sm text-gray-600">Offer Price: ${offer.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">From: {offer.buyerName}</p>

                                    <div className="mt-4 flex justify-between gap-3">
                                        <button
                                            className="py-1.5 px-4 text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-200"
                                            onClick={() => onAcceptOffer(offer)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="py-1.5 px-4 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200"
                                            onClick={() => onRejectOffer(offer)}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            className="py-1.5 px-4 text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
                                            onClick={() => onCounterOffer(offer)}
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
    );
};

export default VehicleOffersModal;
