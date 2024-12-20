'use client';
import {useState, useEffect} from 'react';
import Navbar from '../components/Navbar'; // Import Navbar component

export default function MyReviewsPage() {
    const [sentReviews, setSentReviews] = useState<any[]>([]);
    const [receivedReviews, setReceivedReviews] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Retrieve userId from sessionStorage
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else if (userId === null) {
            console.error('User ID not found in sessionStorage');
        }
    }, []);

    // Fetch sent and received reviews from the API
    useEffect(() => {
        if (!userId) return;

        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:8000/user_reviews/${userId}`);
                const data = await response.json();

                if (data.sent_reviews && data.received_reviews) {
                    setSentReviews(data.sent_reviews);
                    setReceivedReviews(data.received_reviews);
                } else {
                    console.error('No reviews found or invalid response structure');
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, [userId]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'positive':
                return 'bg-green-600 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'neutral':
                return 'bg-yellow-500 text-white font-medium py-1 px-3 rounded-full text-sm';
            case 'negative':
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
                    <h2 className="text-4xl font-bold mb-8 text-blue-700 text-center">My Reviews</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sent Reviews Column */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Sent Reviews</h3>
                            {sentReviews.length === 0 ? (
                                <p className="text-center text-xl text-gray-600">You haven't sent any reviews yet.</p>
                            ) : (
                                sentReviews.map((review) => (
                                    <div key={review.review_id} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="flex flex-col items-start">
                                            {/* Display rating with stars */}
                                            <div className="flex items-center mb-2">
                                                <span
                                                    className="text-xl font-bold text-blue-600">Rating: {review.rating}</span>
                                                {/* Optional: you can add star icons here to represent the rating */}
                                            </div>
                                            {/* Comment below the rating */}
                                            <div className="mb-2">
                                                <span className="font-semibold text-gray-800">Comment:</span>
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                            </div>
                                            <div className="mt-2">
                        <span className={getStatusStyle(review.status || 'neutral')}>
                          {review.status || 'Neutral'}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Received Reviews Column */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Received Reviews</h3>
                            {receivedReviews.length === 0 ? (
                                <p className="text-center text-xl text-gray-600">You haven't received any reviews
                                    yet.</p>
                            ) : (
                                receivedReviews.map((review) => (
                                    <div key={review.review_id} className="mb-6 p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="flex flex-col items-start">
                                            {/* Display rating with stars */}
                                            <div className="flex items-center mb-2">
                                                <span
                                                    className="text-xl font-bold text-blue-600">Rating: {review.rating}</span>
                                            </div>
                                            {/* Comment below the rating */}
                                            <div className="mb-2">
                                                <span className="font-semibold text-gray-800">Comment:</span>
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                            </div>
                                            <div className="mt-2">
                        <span className={getStatusStyle(review.status || 'neutral')}>
                          {review.status || 'Neutral'}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
