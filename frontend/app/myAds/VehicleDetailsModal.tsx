import React from 'react';

interface VehicleDetailsModalProps {
    isOpen: boolean;
    selectedVehicle: {
        photo: string;
        manufacturer: string;
        model: string;
        price: number;
        year: number;
        condition: string;
        mileage: number;
        city: string;
        state: string;
    } | null;
    closeModal: () => void;
}

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ isOpen, selectedVehicle, closeModal }) => {
    if (!isOpen || !selectedVehicle) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
                className="bg-white rounded-lg w-11/12 sm:w-96 p-6 sm:p-8 shadow-xl transform transition-all duration-300 ease-in-out scale-105">
                <div className="mb-6">
                    <img
                        src={selectedVehicle.photo}
                        alt={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}
                        className="w-full h-56 sm:h-72 object-cover rounded-lg shadow-md"
                    />
                </div>
                <div className="space-y-2 mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">{`${selectedVehicle.manufacturer} ${selectedVehicle.model}`}</h3>
                    <p className="text-xl font-bold text-blue-600">${selectedVehicle.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Year: {selectedVehicle.year}</p>
                    <p className="text-sm text-gray-600">Condition: {selectedVehicle.condition}</p>
                    <p className="text-sm text-gray-600">Mileage: {selectedVehicle.mileage.toLocaleString()} miles</p>
                    <p className="text-sm text-gray-600">Location: {selectedVehicle.city}, {selectedVehicle.state}</p>
                </div>
                <button
                    onClick={closeModal}
                    className="mt-4 w-full py-2 text-white bg-red-600 rounded-lg hover:bg-red-800 transition-all duration-300"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default VehicleDetailsModal;
