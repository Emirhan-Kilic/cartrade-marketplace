'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Adjust path if needed

interface UserData {
  user_ID: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  address: string | null;
  rating: number;
  active: boolean;
  join_date?: string;
}

export default function AdminPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'reports'>('users');

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Users
  const [users, setUsers] = useState<UserData[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Editing
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedUserData, setEditedUserData] = useState<UserData | null>(null);

  // 1. Fetch All Users
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        if (data && data.users) setUsers(data.users);
      })
      .catch((err) => console.error('Error fetching user list:', err));
  }, []);

  // 2. Filter by Search
  const filteredUsers = users.filter((u) => {
    const fullName = (u.first_name + ' ' + u.last_name).toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // 3. View (Open Modal)
  const handleViewUser = (userId: number) => {
    const foundUser = users.find((u) => u.user_ID === userId) || null;
    setSelectedUser(foundUser);
    setEditedUserData(foundUser);
    setEditMode(false);
    setIsModalOpen(true);
    setActiveTab('users'); // ensure the "Users" tab is active
  };

  // 4. Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setEditMode(false);
    setEditedUserData(null);
  };

  // 5. Edit / Save
  const handleEditUser = () => {
    if (!selectedUser) return;
    setEditMode(true);
    setEditedUserData({ ...selectedUser });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedUserData) return;
    const { name, value } = e.target;
    setEditedUserData((prev) => (prev ? { ...prev, [name]: value } : null));
  };
  const handleSave = async () => {
    if (!editedUserData || !selectedUser) return;

    // Build payload
    const payload: any = {};
    if (editedUserData.first_name !== selectedUser.first_name) {
      payload.first_name = editedUserData.first_name;
    }
    if (editedUserData.last_name !== selectedUser.last_name) {
      payload.last_name = editedUserData.last_name;
    }
    if (editedUserData.email !== selectedUser.email) {
      payload.email = editedUserData.email;
    }
    if (editedUserData.phone_number !== selectedUser.phone_number) {
      payload.phone_number = editedUserData.phone_number;
    }
    if (editedUserData.address !== selectedUser.address) {
      payload.address = editedUserData.address;
    }
    if (editedUserData.rating !== selectedUser.rating) {
      payload.rating = editedUserData.rating;
    }

    if (Object.keys(payload).length === 0) {
      console.log('No changes to save');
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.user_ID}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = { ...selectedUser, ...payload };
      setSelectedUser(updatedUser);
      setEditedUserData(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.user_ID === updatedUser.user_ID ? updatedUser : u))
      );
      setEditMode(false);
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  // 6. Deactivate
  const handleDeactivate = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.user_ID}/deactivate`,
        { method: 'PUT' }
      );
      if (!response.ok) throw new Error('Failed to deactivate user');

      const updated = { ...selectedUser, active: false };
      setSelectedUser(updated);
      setEditedUserData(updated);
      setUsers((prev) =>
        prev.map((u) => (u.user_ID === updated.user_ID ? updated : u))
      );
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  // 7. Reactivate
  const handleReactivate = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.user_ID}/reactivate`,
        { method: 'PUT' }
      );
      if (!response.ok) throw new Error('Failed to reactivate user');

      const updated = { ...selectedUser, active: true };
      setSelectedUser(updated);
      setEditedUserData(updated);
      setUsers((prev) =>
        prev.map((u) => (u.user_ID === updated.user_ID ? updated : u))
      );
    } catch (err) {
      console.error('Error reactivating user:', err);
    }
  };

  // 8. Reset Password
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${selectedUser.user_ID}/reset-password`,
        { method: 'PUT' }
      );
      if (!response.ok) throw new Error('Failed to reset password');
      const data = await response.json();
      alert(`New password for user ID ${selectedUser.user_ID}: ${data.new_password}`);
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
      <Navbar />

      <section className="pt-24 w-11/12 mx-auto"> {/* Adjusted padding-top */}
    <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
      Admin Dashboard
    </h1>

        {/* Centered Tab Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            Pending Ads
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-300'
            }`}
          >
            Reports
          </button>
        </div>

        {activeTab === 'users' && (
          <>
            {/* Centered Search Bar */}
            <div className="flex justify-center mb-4">
              <input
                type="text"
                placeholder="Search by name"
                className="w-full max-w-md p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-white shadow-md rounded p-4">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">First Name</th>
                    <th className="px-4 py-2">Last Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Join Date</th>
                    <th className="px-4 py-2">Active</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_ID} className="border-b">
                      <td className="px-4 py-2">{user.user_ID}</td>
                      <td className="px-4 py-2">{user.first_name}</td>
                      <td className="px-4 py-2">{user.last_name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.join_date || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {user.active ? (
                          <span className="text-green-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-red-600 font-bold">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleViewUser(user.user_ID)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">
              Pending Ads
            </h2>
            <p>TODO: Implement pending ads functionality</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">
              Reports
            </h2>
            <p>TODO: Implement reports functionality</p>
          </div>
        )}
      </section>

      {/* MODAL for User Details */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={(e) => {
            // Close if user clicks outside the modal content
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            {/* Close Button */}
            <button
              className="float-right text-gray-600 hover:text-gray-900"
              onClick={closeModal}
            >
              ✕
            </button>

            {!editMode ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                  User Details (ID: {selectedUser.user_ID})
                </h2>
                <p className="mb-2">
                  <span className="font-bold text-gray-700">Name: </span>
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
                <p className="mb-2">
                  <span className="font-bold text-gray-700">Email: </span>
                  {selectedUser.email}
                </p>
                <p className="mb-2">
                  <span className="font-bold text-gray-700">Phone: </span>
                  {selectedUser.phone_number || 'Not provided'}
                </p>
                <p className="mb-2">
                  <span className="font-bold text-gray-700">Address: </span>
                  {selectedUser.address || 'Not provided'}
                </p>
                <p className="mb-2">
                  <span className="font-bold text-gray-700">Rating: </span>
                  {selectedUser.rating}/5
                </p>
                {selectedUser.join_date && (
                  <p className="mb-2">
                    <span className="font-bold text-gray-700">Join Date: </span>
                    {selectedUser.join_date}
                  </p>
                )}
                <p className="mb-4">
                  <span className="font-bold text-gray-700">Active: </span>
                  {selectedUser.active ? 'Yes' : 'No'}
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleEditUser}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Update Info
                  </button>

                  {selectedUser.active ? (
                    <button
                      onClick={handleDeactivate}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivate}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Reactivate
                    </button>
                  )}

                  <button
                    onClick={handleResetPassword}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                  >
                    Reset Password
                  </button>
                </div>
              </>
            ) : (
              editedUserData && (
                <>
                  <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                    Editing User (ID: {editedUserData.user_ID})
                  </h2>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={editedUserData.first_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={editedUserData.last_name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editedUserData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        value={editedUserData.phone_number || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={editedUserData.address || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="rating"
                        value={editedUserData.rating}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditedUserData(selectedUser);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
