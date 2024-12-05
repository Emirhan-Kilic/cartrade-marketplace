'use client';
import {useState} from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '(123) 456-7890',
        address: '123 Main St, Springfield, USA',
        rating: 4.8,
        balance: '$500.00',  // Assuming balance is part of the database columns
        dateJoined: 'January 1, 2023',  // Assuming a dateJoined column exists
    });

    const [editedProfileData, setEditedProfileData] = useState(profileData);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
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
            <Navbar/>

            {/* Profile Section */}
            <section className="mt-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
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
                                            Rating: {profileData.rating}/5
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Balance: {profileData.balance}
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
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
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
