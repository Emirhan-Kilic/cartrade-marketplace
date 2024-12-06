'use client';
import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { FaAd, FaHandshake, FaHeart, FaStar } from 'react-icons/fa';

export default function ProfilePage() {
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '(123) 456-7890',
        address: '123 Main St, Springfield, USA',
        rating: 4.8,
        balance: '$500.00', // Assuming balance is part of the database columns
        dateJoined: 'January 1, 2023', // Assuming a dateJoined column exists
    });

    const [editedProfileData, setEditedProfileData] = useState(profileData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setProfileData(editedProfileData);
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditedProfileData(profileData);
        setEditMode(false);
    };

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
                                src="https://picsum.photos/200"
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
                                            {profileData.name}
                                        </h2>
                                        <p className="text-sm text-gray-600">Email: {profileData.email}</p>
                                        <p className="text-sm text-gray-600">Phone: {profileData.phone}</p>
                                        <p className="text-sm text-gray-600">
                                            Address: {profileData.address}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Date Joined: {profileData.dateJoined}
                                        </p>
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
                                    <p className="text-2xl text-blue-600">{profileData.rating}/5</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-700">Balance</p>
                                    <p className="text-2xl text-green-600">{profileData.balance}</p>
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

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6 mt-auto">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 CarTrade. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
