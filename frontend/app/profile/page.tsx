'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importing router for redirection
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { FaAd, FaHandshake, FaHeart, FaStar } from 'react-icons/fa';

export default function ProfilePage() {
    const router = useRouter(); // Initialize router for navigation
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [editedProfileData, setEditedProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        rating: 0,
        balance: '',
        dateJoined: '', // Ensure this is added
        profile_picture: '', // Add this field for picture URL
    });

    // Check if the user is logged in
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            // Redirect to login if user is not logged in
            router.push('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                console.log('Fetching profile data for userId:', userId); // Debug: show which user ID is being fetched
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${userId}`);
                
                console.log('API response:', response); // Debug: log the full response object
                
                if (!response.ok) {
                    console.error('Failed to fetch profile data: ', response.statusText); // Debug: log if fetch fails
                    return;
                }
                
                const data = await response.json();
                console.log('Fetched profile data:', data); // Debug: log the fetched data
                
                setProfileData({
                    ...data,
                    phone: data.phone_number || '', // Changed to phone_number
                    address: data.address || '',
                    profile_picture: data.profile_picture || 'https://picsum.photos/400/250', // Use a default image if not set
                    rating: data.rating || 0, // Handle if rating is missing
                    balance: data.balance || 0, // Handle if balance is missing
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    dateJoined: data.join_date || '', // Set join_date here
                });
    
                setEditedProfileData(data); // Initialize the edited data with the fetched data
                console.log('Profile data set successfully:', data); // Debug: confirm data was set
                
            } catch (error) {
                console.error('Error fetching profile data:', error); // Debug: log any error during fetch
            }
        };
    
        fetchProfileData();
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${profileData.user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedProfileData),
            });

            if (response.ok) {
                const updatedData = await response.json();
                setProfileData(updatedData); // Update profile data in the state
                setEditMode(false);
            } else {
                console.error('Failed to update profile data');
            }
        } catch (error) {
            console.error('Error updating profile data:', error);
        }
    };

    const handleCancel = () => {
        setEditedProfileData(profileData);
        setEditMode(false);
    };

    if (!profileData) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Profile Section */}
            <section className="mt-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
                            {/* Profile Image */}
                            <Image
                                src={profileData.profile_picture} // Use the dynamic profile picture
                                alt="Profile Picture"
                                width={150}
                                height={150}
                                className="rounded-full shadow-md"
                            />

                            {/* Profile Information */}
                            <div className="flex-1">
                                {!editMode ? (
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-semibold text-blue-600">
                                            {profileData.first_name} {profileData.last_name}
                                        </h2>
                                        <p className="text-sm text-gray-600">Email: {profileData.email}</p>
                                        <p className="text-sm text-gray-600">Phone: {profileData.phone || 'Not provided'}</p>
                                        <p className="text-sm text-gray-600">Address: {profileData.address || 'Not provided'}</p>
                                        <p className="text-sm text-gray-600">Date Joined: {profileData.dateJoined || 'Not provided'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedProfileData.name}
                                            onChange={handleInputChange}
                                            placeholder="Name"
                                            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedProfileData.email}
                                            onChange={handleInputChange}
                                            placeholder="Email"
                                            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editedProfileData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Phone"
                                            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            name="address"
                                            value={editedProfileData.address}
                                            onChange={handleInputChange}
                                            placeholder="Address"
                                            className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Rating and Balance Section */}
                            <div className="flex flex-col items-center space-y-4 sm:ml-6">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-700">Rating</p>
                                    <p className="text-2xl text-blue-600">{profileData.rating || 0}/5</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-700">Balance</p>
                                    <p className="text-2xl text-green-600">{profileData.balance || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation and Action Buttons */}
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center sm:space-x-4">
                            {/* Left-Side Button (Edit Profile) */}
                            <div className="flex justify-start">
                                {editMode ? (
                                    <>
                                        <button
                                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                            onClick={handleSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Right-Side Buttons (My Ads, My Offers, Wishlisted Ads, My Reviews) */}
                            <div className="flex flex-col sm:flex-row justify-center sm:space-x-4">
                                <button
                                    className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                                    onClick={() => window.location.href = '/my-ads'}
                                >
                                    <FaAd className="mr-2" /> My Ads
                                </button>
                                <button
                                    className="flex items-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                                    onClick={() => window.location.href = '/my-offers'}
                                >
                                    <FaHandshake className="mr-2" /> My Offers
                                </button>
                                <button
                                    className="flex items-center bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition"
                                    onClick={() => window.location.href = '/wishlisted-ads'}
                                >
                                    <FaHeart className="mr-2" /> Wishlisted Ads
                                </button>
                                <button
                                    className="flex items-center bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition"
                                    onClick={() => window.location.href = '/my-reviews'}
                                >
                                    <FaStar className="mr-2" /> My Reviews
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
