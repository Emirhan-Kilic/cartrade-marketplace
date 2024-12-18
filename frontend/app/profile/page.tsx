'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { FaAd, FaHandshake, FaHeart, FaStar } from 'react-icons/fa';
import AddBalanceModal from './AddBalanceModal'; // Import the modal

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    rating: number;
    balance: number;
    dateJoined: string;
    profile_picture: string;
    first_name: string;
    last_name: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [editedProfileData, setEditedProfileData] = useState<ProfileData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        rating: 0,
        balance: 0,
        dateJoined: '',
        profile_picture: '',
        first_name: '',
        last_name: '',
    });

    const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState<boolean>(false); // State for modal visibility

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            router.push('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${userId}`);
                if (!response.ok) return;

                const data = await response.json();

                setProfileData({
                    ...data,
                    phone: data.phone_number || '',
                    address: data.address || '',
                    profile_picture: data.profile_picture || 'https://picsum.photos/400/250',
                    rating: data.rating || 0,
                    balance: data.balance || 0,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    dateJoined: data.join_date || '',
                });

                setEditedProfileData({
                    ...data,
                    name: `${data.first_name} ${data.last_name}`, // Set full name
                    phone: data.phone_number || '',  // Ensure phone number is included
                    address: data.address || '',  // Ensure address is included
                });
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfileData();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const userId = sessionStorage.getItem('userId');
            let profileDataToUpdate: { [key: string]: string | number } = {};

            if (editedProfileData.name !== profileData?.name) {
                profileDataToUpdate.first_name = editedProfileData.name.split(' ')[0];
                profileDataToUpdate.last_name = editedProfileData.name.split(' ')[1] || '';
            }

            if (editedProfileData.email !== profileData?.email) {
                profileDataToUpdate.email = editedProfileData.email;
            }

            if (editedProfileData.phone !== profileData?.phone) {
                profileDataToUpdate.phone_number = editedProfileData.phone || '';
            }

            if (editedProfileData.address !== profileData?.address) {
                profileDataToUpdate.address = editedProfileData.address || '';
            }

            if (Object.keys(profileDataToUpdate).length === 0) {
                console.log('No changes detected');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileDataToUpdate),
            });

            if (response.ok) {
                setEditMode(false);
                window.location.reload();
            } else {
                console.error('Failed to update profile data');
            }
        } catch (error) {
            console.error('Error updating profile data:', error);
        }
    };

    const handleCancel = () => {
        setEditedProfileData(profileData as ProfileData);
        setEditMode(false);
    };

    const openAddBalanceModal = () => {
        setIsAddBalanceModalOpen(true);
    };

    const closeAddBalanceModal = () => {
        setIsAddBalanceModalOpen(false);
    };

    if (!profileData) return <div>Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
            <Navbar />

            <section className="mt-20">
                <div className="container mx-auto px-6 mt-4">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
                            <Image
                                src={profileData.profile_picture}
                                alt="Profile Picture"
                                width={150}
                                height={150}
                                className="rounded-full shadow-md"
                            />
                            <div className="flex-1">
                                {!editMode ? (
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-semibold text-blue-600">
                                            {profileData.first_name} {profileData.last_name}
                                        </h2>
                                        <p className="text-sm text-gray-600">Email: {profileData.email}</p>
                                        <p className="text-sm text-gray-600">Phone: {profileData.phone || 'Not provided'}</p>
                                        <p className="text-sm text-gray-600">Address: {profileData.address || 'Not provided'}</p>
                                        <p className="text-sm text-gray-600">Date
                                            Joined: {profileData.dateJoined || 'Not provided'}</p>
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

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center sm:space-x-4">
                            <div className="flex justify-start space-x-4">
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

                            <div className="flex flex-col sm:flex-row justify-center sm:space-x-4 mt-4 sm:mt-0">
                                <button
                                    className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                                    onClick={() => window.location.href = '/myAds'}
                                >
                                    <FaAd className="mr-2" /> My Ads
                                </button>
                                <button
                                    className="flex items-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
                                    onClick={() => window.location.href = '/myOffers'}
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

                                {/* Add Balance Button */}
                                <button
                                    className="flex items-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                                    onClick={openAddBalanceModal}
                                >
                                    <span className="mr-2">+</span> Add Balance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Balance Modal */}
            <AddBalanceModal
                isOpen={isAddBalanceModalOpen}
                closeModal={closeAddBalanceModal}
                userId={sessionStorage.getItem('userId')} // Pass userId here
            />
        </div>
    );
}
