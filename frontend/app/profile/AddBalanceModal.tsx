import {useState} from 'react';

interface AddBalanceModalProps {
    isOpen: boolean;
    closeModal: () => void;
    userId: string | null;
}

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({isOpen, closeModal, userId}) => {
    const [amount, setAmount] = useState<number | string>(''); // Amount to add to the balance
    const [errorMessage, setErrorMessage] = useState<string>(''); // Error message
    const [successMessage, setSuccessMessage] = useState<string>(''); // Success message

    // Handle changes in the input field
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setErrorMessage('User ID is missing.');
            return;
        }

        const parsedAmount = parseFloat(amount.toString());
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorMessage('Please enter a valid positive amount.');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({amount: parsedAmount}),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.detail || 'Failed to update balance.');
            } else {
                const responseData = await response.json();
                setSuccessMessage(responseData.message || 'Balance updated successfully!');
                setAmount('');
                setErrorMessage('');
                setTimeout(() => {
                    window.location.reload(); // Reload the page to show updated balance
                }, 1000);
            }
        } catch (error) {
            setErrorMessage('An error occurred while updating balance.');
        }
    };


    // If the modal is not open, return null to avoid rendering it
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold text-center mb-4">Add Balance</h2>
                {errorMessage && <div className="text-red-500 mb-2">{errorMessage}</div>}
                {successMessage && <div className="text-green-500 mb-2">{successMessage}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm text-gray-600">Enter Amount</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            className="w-full p-3 mt-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                        >
                            Add Balance
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBalanceModal;
