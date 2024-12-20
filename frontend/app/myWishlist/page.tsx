"use client";
import {useState, useEffect} from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import VehicleDetailModal from './VehicleDetailModal';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [isWishlistEmpty, setIsWishlistEmpty] = useState<boolean>(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [offerPrice, setOfferPrice] = useState<string>('');
    const [bookmarked, setBookmarked] = useState(false);

    // Fetch wishlist data
    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            const fetchWishlist = async () => {
                try {
                    const response = await fetch(`http://localhost:8000/user/${userId}/wishlist`);
                    const data = await response.json();
                    if (response.ok && data.wishlist) {
                        setWishlist(data.wishlist);
                        setIsWishlistEmpty(false);
                    } else {
                        setIsWishlistEmpty(true);
                    }
                } catch (error) {
                    console.error('Error fetching wishlist:', error);
                }
            };

            fetchWishlist();
        } else {
            console.error('User ID not found in session storage');
        }
    }, []);

    // Open modal and fetch bookmark status
    const openModal = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);

        const userId = sessionStorage.getItem('userId');
        if (!userId || !vehicle) return;

        const bookmarkedAd = vehicle.ad_ID;
        const url = `http://localhost:8000/user/${userId}/wishlist/${bookmarkedAd}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setBookmarked(data.isBookmarked);
            } else {
                console.error('Failed to check wishlist status');
            }
        } catch (error) {
            console.error('Error fetching wishlist status:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOfferPrice(e.target.value);
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();

        const userId = sessionStorage.getItem('userId');
        if (!userId || !selectedVehicle) {
            alert("No user or vehicle selected.");
            return;
        }

        const adId = selectedVehicle.ad_ID; // Assuming `selectedVehicle` contains the `ad_ID`

        try {
            // Check if the user has already made an offer
            const checkResponse = await fetch(`http://localhost:8000/check_offer/${userId}/${adId}`);

            if (checkResponse.ok) {
                const offerData = await checkResponse.json();
                alert(`You have already made an offer of $${offerData.offer.offer_price} on this vehicle.`);
                return;
            }

            // If no offer exists, proceed to create a new offer
            const createResponse = await fetch(
                `http://localhost:8000/create_offer/${userId}/${adId}/${offerPrice}`,
                {method: "POST"}
            );

            const createData = await createResponse.json(); // Parse the response
            console.log("Create offer response:", createData);

            if (createResponse.ok) {
                alert(`Offer of $${offerPrice} successfully submitted for ${selectedVehicle.manufacturer} ${selectedVehicle.model}.`);
                handleCloseModal(); // Close the modal on successful submission
            } else {
                alert(`Failed to create offer: ${createData.detail || createData.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error submitting offer:", error);
            alert("An error occurred while submitting the offer. Please try again later.");
        }
    };


    const handleBookmark = async () => {
        const userId = sessionStorage.getItem('userId');
        if (!userId || !selectedVehicle) return;

        const bookmarkedAd = selectedVehicle.ad_ID; // Assuming selectedVehicle has ad_ID
        const url = `http://localhost:8000/user/${userId}/wishlist/${bookmarkedAd}`;

        try {
            // First, check if the ad is already in the wishlist
            const checkResponse = await fetch(url);
            const data = await checkResponse.json();

            if (checkResponse.ok) {
                if (data.isBookmarked) {
                    // If it's already bookmarked, perform the delete operation
                    const deleteResponse = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (deleteResponse.ok) {
                        setBookmarked(false); // Update the bookmark state
                        alert('Removed from wishlist');
                    } else {
                        console.error('Failed to remove from wishlist');
                        alert('Error removing from wishlist');
                    }
                } else {
                    // If it's not bookmarked, perform the add operation
                    const postResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (postResponse.ok) {
                        setBookmarked(true); // Update the bookmark state
                        alert('Added to wishlist');
                    } else {
                        console.error('Failed to add to wishlist');
                        alert('Error adding to wishlist');
                    }
                }
            } else {
                console.error('Failed to check wishlist status');
                alert('Error checking wishlist status');
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            alert('Error updating wishlist');
        }
    };


    const handleRemoveFromWishlist = async (bookmarkedAd: number) => {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in session storage');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/user/${userId}/wishlist/${bookmarkedAd}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setWishlist((prevWishlist) => prevWishlist.filter((item) => item.ad_ID !== bookmarkedAd));
                alert('Ad removed from wishlist');
            } else {
                const data = await response.json();
                alert(`Failed to remove from wishlist: ${data.detail}`);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            alert('Error removing from wishlist');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar/>

            <section className="mt-20 bg-white py-6 shadow-md">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-semibold mb-4 text-blue-600">Your Wishlist</h2>

                    {isWishlistEmpty ? (
                        <p>No items in your wishlist.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
                            {wishlist.map((item) => (
                                <div
                                    key={item.ad_ID}
                                    className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200"
                                >
                                    <Image
                                        src={item.photo || 'https://picsum.photos/400/250'}
                                        alt={`${item.manufacturer} ${item.model}`}
                                        width={400}
                                        height={250}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{`${item.manufacturer} ${item.model}`}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{`${item.city}, ${item.state}`}</p>
                                        <p className="text-lg font-semibold text-blue-600 mb-4">${item.price.toLocaleString()}</p>

                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                      >
                        Status: {item.status}
                      </span>
                                            <div className="flex items-center text-gray-500 text-xs">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 mr-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 10l4.5-4.5m-9 9l-4.5 4.5M19.5 5.5l-9 9m0-9l9 9"
                                                    />
                                                </svg>
                                                {item.views} Views
                                            </div>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                                    item.is_premium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                        {item.is_premium ? 'Premium' : 'Not Premium'}
                      </span>
                                        </div>

                                        <button
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-200"
                                            onClick={() => openModal(item)} // Open modal on click
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none transition-all duration-200 mt-2"
                                            onClick={() => handleRemoveFromWishlist(item.ad_ID)}
                                        >
                                            Remove from Wishlist
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Vehicle Detail Modal */}
            {selectedVehicle && (
                <VehicleDetailModal
                    selectedVehicle={selectedVehicle}
                    isModalOpen={isModalOpen}
                    closeModal={handleCloseModal}
                    offerPrice={offerPrice}
                    handleOfferChange={handleOfferChange}
                    handleOfferSubmit={handleOfferSubmit}
                    handleBookmark={handleBookmark}
                    bookmarked={bookmarked}
                />
            )}
        </div>
    );
}
