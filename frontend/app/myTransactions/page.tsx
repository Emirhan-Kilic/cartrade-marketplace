'use client';
import {useState, useEffect} from 'react';
import Navbar from '../components/Navbar'; // Import Navbar component
import ReviewModal from './ReviewModal'; // Import the ReviewModal component

export default function MyTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null); // Store selected transaction ID
    const [adOwnerId, setAdOwnerId] = useState<number | null>(null); // Store the ad owner ID for the review modal
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Retrieve userId from sessionStorage
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else if (userId === null) {
            console.error('User ID not found in sessionStorage');
        }
    }, []);

    // Fetch transactions from the API
    useEffect(() => {
        if (!userId) {
            return; // Exit early if userId is not set
        }

        const fetchTransactions = async () => {
            try {
                const response = await fetch(`http://localhost:8000/user_transactions/${userId}`);
                const data = await response.json();

                if (data.transactions) {
                    setTransactions(data.transactions);
                } else {
                    console.error('No transactions found or invalid response structure');
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [userId]);

    const handleReviewModalOpen = (transactionId: number, adOwner: number) => {
        setSelectedTransaction(transactionId);
        setAdOwnerId(adOwner);
        setIsModalOpen(true);
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!selectedTransaction) return;

        const reviewData = {
            rating,
            comment,
            reviewer: Number(userId),
            evaluated_user: adOwnerId, // Ad owner to be evaluated
            transaction_id: selectedTransaction, // Associated transaction ID
        };

        try {
            const response = await fetch('http://localhost:8000/create_review/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData),
            });

            if (response.ok) {
                console.log('Review submitted successfully');
                setIsModalOpen(false);

                // Optionally, you could update the transaction state here
                setTransactions((prevTransactions) => {
                    return prevTransactions.map((transaction) => {
                        if (transaction.transaction_ID === selectedTransaction) {
                            return {
                                ...transaction,
                                review: {rating, comment}, // Add the review to the transaction
                            };
                        }
                        return transaction;
                    });
                });
            } else {
                console.error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };


    // Style the status text based on its value
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-600 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'pending':
                return 'bg-yellow-500 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'failed':
                return 'bg-red-600 text-white font-medium py-1 px-3 rounded-full text-sm';
            default:
                return 'bg-gray-400 text-white font-medium py-1 px-3 rounded-full text-sm';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar/> {/* Navbar component */}

            <section className="mt-20 bg-white py-8 shadow-xl flex-grow rounded-xl">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-8 text-blue-700 text-center">My Transactions</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {transactions.length === 0 ? (
                            <p className="text-center text-xl text-gray-600">No transactions made yet.</p>
                        ) : (
                            transactions.map((transaction) => {
                                // Determine if the current user is the payer or the owner
                                const isPayer = transaction.payer_details.user_ID === Number(userId);
                                const oppositeParty = isPayer ? transaction.owner_details : transaction.payer_details;

                                // Calculate balance change
                                const balanceChange = isPayer ? -transaction.price : transaction.price;

                                return (
                                    <div
                                        key={transaction.transaction_ID}
                                        className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-200 transform hover:scale-105"
                                    >
                                        {/* Transaction Type and Date */}
                                        <h3 className="text-2xl font-semibold text-gray-800">
                                            {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Transaction Date: {new Date(transaction.transaction_date).toLocaleString()}
                                        </p>
                                        <p className="text-lg font-semibold text-blue-700 mt-2">
                                            ${transaction.price.toLocaleString()}
                                        </p>

                                        {/* Display Opposite Party Details */}
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800">Opposite Party:</h4>
                                            <p className="text-sm text-gray-600">Name: {oppositeParty.first_name} {oppositeParty.last_name}</p>
                                            <p className="text-sm text-gray-600">Phone: {oppositeParty.phone_number}</p>
                                            <p className="text-sm text-gray-600">Email: {oppositeParty.email}</p>
                                        </div>

                                        {/* Balance Change */}
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800">Balance Change:</h4>
                                            <p className={`text-sm ${balanceChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {balanceChange < 0 ? '-' : '+'}${Math.abs(balanceChange).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Ad Details */}
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-gray-800">Ad Details:</h4>
                                            <p className="text-sm text-gray-600">
                                                Vehicle: {transaction.ad_details.vehicle_details.manufacturer} {transaction.ad_details.vehicle_details.model} ({transaction.ad_details.vehicle_details.year})
                                            </p>
                                            <p className="text-sm text-gray-600">Ad
                                                Status: {transaction.ad_details.ad_status}</p>
                                        </div>

                                        {/* Status with Style */}
                                        <div className="mt-4">
                                            <span className={getStatusStyle(transaction.payment_status)}>
                                                {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                                            </span>
                                        </div>

                                        {/* Send Review Button */}
                                        {isPayer && !transaction.review && (
                                            <div className="mt-4">
                                                <button
                                                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-all"
                                                    onClick={() => handleReviewModalOpen(transaction.transaction_ID, oppositeParty.user_ID)}
                                                >
                                                    Send Review
                                                </button>
                                            </div>
                                        )}

                                        {/* Review Sent Button */}
                                        {isPayer && transaction.review && (
                                            <div className="mt-4">
                                                <button
                                                    disabled
                                                    className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md"
                                                >
                                                    Review Sent
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* Review Modal */}
            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transactionId={selectedTransaction ?? 0}
                adOwnerId={adOwnerId ?? 0}
                currentUserId={Number(userId)}
                onSubmitReview={handleReviewSubmit}
            />
        </div>
    );
}
