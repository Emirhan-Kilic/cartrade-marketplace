'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [pendingAds, setPendingAds] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, adsRes, reportsRes] = await Promise.all([
        fetch('http://localhost:8000/admin/users'),
        fetch('http://localhost:8000/admin/pending-ads'),
        fetch('http://localhost:8000/admin/reports')
      ]);

      if (!usersRes.ok || !adsRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, adsData, reportsData] = await Promise.all([
        usersRes.json(),
        adsRes.json(),
        reportsRes.json()
      ]);

      setUsers(usersData.users);
      setPendingAds(adsData.pending_ads);
      setReports(reportsData.reports);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to fetch admin data. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      <Navbar />
      <div className="container mx-auto px-6 mt-20">
        <div className="border-b border-gray-300 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-blue-600">Admin Dashboard</h1>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded ${activeTab === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(0)}
          >
            Users
          </button>
          <button  
            className={`px-4 py-2 rounded ${activeTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(1)}
          >
            Pending Ads
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(2)}
          >
            Reports 
          </button>
        </div>

        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div>
            {activeTab === 0 && <UserManagement users={users} />}
            {activeTab === 1 && <PendingAds ads={pendingAds} />}
            {activeTab === 2 && <Reports reports={reports} />}
          </div>
        )}
      </div>
    </div>
  );
}

function UserManagement({ users }) {
  const handleDeactivate = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/deactivate`, {
        method: 'PUT'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <table className="min-w-full text-black">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_ID}>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{new Date(user.join_date).toLocaleDateString()}</td>
              <td>{user.rating}</td>
              <td>
                <button 
                  onClick={() => handleDeactivate(user.user_ID)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingAds({ ads }) {
  const handleAdAction = async (adId, action) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/ads/${adId}/${action}`, {
        method: 'PUT'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {ads.map(ad => (
        <div key={ad.ad_ID} className="border-b py-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-black">{ad.manufacturer} {ad.model} ({ad.year})</h3>
              <p className="text-black">Posted by: {ad.first_name} {ad.last_name}</p>
              <p className="text-black">Price: ${ad.price}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleAdAction(ad.ad_ID, 'approve')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleAdAction(ad.ad_ID, 'reject')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Reports({ reports }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {reports.map(report => (
        <div key={report.report_ID} className="border-b py-4">
          <h3 className="text-black">Report against {report.first_name} {report.last_name}</h3>
          <p className="text-black">{report.description}</p>
          <p className="text-sm text-gray-500">
            {new Date(report.report_date).toLocaleDateString()}
          </p>
          <p className="text-black">Status: {report.status}</p>
        </div>
      ))}
    </div>
  );
}