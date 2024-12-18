import React, { useState, useEffect } from 'react';

interface VehicleAddedModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    vehicleId: number;
}

const VehicleAddedModal: React.FC<VehicleAddedModalProps> = ({ isOpen, onClose, userId, vehicleId }) => {
    const [isPremium, setIsPremium] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state

    // Fetch the user's balance from the backend
    const fetchBalance = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/balance`);
            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }
            const data = await response.json();
            setBalance(data.balance);
            setIsLoading(false);
        } catch (error: any) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    // Deduct 150 from the balance if premium is selected
    const deductBalanceForPremium = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/deduct_balance_for_premium`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to deduct balance');
            }
            const data = await response.json();
            setBalance(data.new_balance); // Update balance with the new deducted value
            setIsPremium(false); // Reset premium selection
            setSuccessMessage('Ad created!'); // Set success message

            // After balance deduction, create the ad
            createAd();
        } catch (error: any) {
            setError(error.message);
        }
    };

    // Create the ad by calling the /add_ad endpoint
    const createAd = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add_ad/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_premium: isPremium,
                    associated_vehicle: vehicleId,
                    owner: userId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create ad');
            }

            const data = await response.json();
            console.log(data); // Log response or handle further logic if needed

            // Display success message before refreshing the page
            setTimeout(() => {
                window.location.reload(); // Refresh the page after showing the success message
            }, 1500); // Delay to show the success message
        } catch (error: any) {
            setError(error.message);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetchBalance();
        }
    }, [isOpen]);

    const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsPremium(e.target.checked);
    };

    const canAffordPremium = balance !== null && balance >= 150; // Updated cost for premium

    const handleClose = () => {
        onClose();
    };

    const handleSend = () => {
        if (isPremium) {
            deductBalanceForPremium();
        } else {
            // If not premium, create the ad directly without deduction
            createAd();
            setSuccessMessage('Ad created!'); // Set success message
            handleClose(); // Close the modal
            window.location.reload(); // Refresh the page
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-full sm:w-96 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all">
                <div className="text-center mb-6">
                    <h4 className="text-2xl font-semibold text-blue-600">Choose Ad Type</h4>
                    <p className="text-sm text-gray-600 mt-2">
                        Premium ads will appear on the front page and have 12 months of activity instead of 3.
                    </p>
                </div>

                {/* Flex Container for Current Balance and Premium Ad Cost */}
                <div className="flex justify-between mt-4">
                    {/* Current Balance */}
                    <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">Current Balance:</p>
                        <p className="text-sm text-gray-600">{balance !== null ? `${balance} TL` : 'Loading...'}</p>
                    </div>

                    {/* Premium Ad Cost */}
                    <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">Premium Ad Cost:</p>
                        <p className="text-sm text-gray-600">150 TL</p>
                    </div>
                </div>

                {/* Loading and error handling */}
                {isLoading ? (
                    <div className="flex justify-center items-center mt-6">
                        <div className="w-5 h-5 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-500 ml-2">Loading your balance...</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center mt-4">{error}</p>
                ) : (
                    <div className="mt-6">
                        <div className="flex items-center justify-center">
                            <input
                                type="checkbox"
                                id="premiumAd"
                                disabled={!canAffordPremium} // Disable if balance is insufficient
                                checked={isPremium}
                                onChange={handlePremiumChange}
                                className="h-6 w-6 border-gray-400 rounded-lg"
                            />
                            <label htmlFor="premiumAd" className="ml-3 text-lg font-medium text-gray-700">
                                Premium Ad
                            </label>
                        </div>

                        {!canAffordPremium && balance !== null && (
                            <p className="text-red-500 text-sm mt-4 text-center">
                                You need at least 150 TL to select a premium ad.
                            </p>
                        )}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="text-green-500 text-center mt-4">
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleSend}
                        className="bg-green-600 text-white py-3 px-8 rounded-full shadow-md hover:bg-green-700 transition-all duration-300 ease-in-out"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehicleAddedModal;
