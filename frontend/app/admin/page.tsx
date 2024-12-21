'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [pendingAds, setPendingAds] = useState([]); 
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, adsRes, reportsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/ads/pending'),
        fetch('/api/admin/reports')
      ]);

      setUsers((await usersRes.json()).users);
      setPendingAds((await adsRes.json()).pending_ads);
      setReports((await reportsRes.json()).reports);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: 'PUT'
      });
      fetchData();
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleAdAction = async (adId: number, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/admin/ads/${adId}/${action}`, {
        method: 'PUT'
      });
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tab.Group>
        <Tab.List className="flex space-x-4 mb-8">
          <Tab className={`px-4 py-2 ${activeTab === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Users
          </Tab>
          <Tab className={`px-4 py-2 ${activeTab === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Pending Ads
          </Tab>
          <Tab className={`px-4 py-2 ${activeTab === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Reports
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <UserManagement users={users} onDeactivate={handleDeactivateUser} />
          </Tab.Panel>
          <Tab.Panel>
            <PendingAds ads={pendingAds} onAction={handleAdAction} />
          </Tab.Panel>
          <Tab.Panel>
            <Reports reports={reports} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

function UserManagement({ users, onDeactivate }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <table className="min-w-full">
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
                  onClick={() => onDeactivate(user.user_ID)}
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

function PendingAds({ ads, onAction }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {ads.map(ad => (
        <div key={ad.ad_ID} className="border-b py-4">
          <div className="flex justify-between">
            <div>
              <h3>{ad.manufacturer} {ad.model} ({ad.year})</h3>
              <p>Posted by: {ad.first_name} {ad.last_name}</p>
              <p>Price: ${ad.price}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => onAction(ad.ad_ID, 'approve')}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => onAction(ad.ad_ID, 'reject')}
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
          <h3>Report against {report.first_name} {report.last_name}</h3>
          <p>{report.description}</p>
          <p className="text-sm text-gray-500">
            {new Date(report.report_date).toLocaleDateString()}
          </p>
          <p>Status: {report.status}</p>
        </div>
      ))}
    </div>
  );
}