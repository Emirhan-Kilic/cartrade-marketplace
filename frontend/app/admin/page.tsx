'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface User {
  user_ID: number;
  first_name: string;
  last_name: string;
  email: string;
  join_date: string;
}

interface Ad {
  ad_ID: number;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  first_name: string;
  last_name: string;
}

interface Report {
  report_ID: number;
  first_name: string;
  last_name: string;
  description: string;
  report_date: string;
  status: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleAdAction = async (adId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://localhost:8000/admin/ads/${adId}/${action}`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchData(); // Refresh the data
      }
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error);
    }
  };

  const handleDeactivate = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/deactivate`, {
        method: 'PUT'
      });
      if (response.ok) {
        fetchData(); // Refresh the data
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      <Navbar />
      <div className="container mx-auto px-6 mt-20">
        <section className="bg-white py-6 shadow-md mb-8">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-4 text-red-600">Admin Dashboard</h2>
          </div>
        </section>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(0)}
          >
            Users
          </button>
          <button  
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(1)}
          >
            Pending Ads
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 2 ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(2)}
          >
            Reports
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 0 && (
              <div>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4 p-2 border rounded-lg w-full"
                />
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left align-middle">ID</th>
                      <th className="py-2 px-4 text-left align-middle">First Name</th>
                      <th className="py-2 px-4 text-left align-middle">Last Name</th>
                      <th className="py-2 px-4 text-left align-middle">Email</th>
                      <th className="py-2 px-4 text-left align-middle">Join Date</th>
                      <th className="py-2 px-4 text-left align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.user_ID} className="border-t">
                        <td className="py-2 px-4 align-middle">{user.user_ID}</td>
                        <td className="py-2 px-4 align-middle">{user.first_name}</td>
                        <td className="py-2 px-4 align-middle">{user.last_name}</td>
                        <td className="py-2 px-4 align-middle">{user.email}</td>
                        <td className="py-2 px-4 align-middle">{new Date(user.join_date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 align-middle">
                          <button
                            onClick={() => handleDeactivate(user.user_ID)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-4">
                {pendingAds.map(ad => (
                  <div key={ad.ad_ID} className="border-b border-gray-200 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{ad.manufacturer} {ad.model} ({ad.year})</h3>
                        <p className="text-gray-600">Posted by: {ad.first_name} {ad.last_name}</p>
                        <p className="text-lg font-semibold text-blue-600">${ad.price.toLocaleString()}</p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleAdAction(ad.ad_ID, 'approve')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAdAction(ad.ad_ID, 'reject')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.report_ID} className="border-b border-gray-200 py-4">
                    <h3 className="text-lg font-semibold">Report against {report.first_name} {report.last_name}</h3>
                    <p className="text-gray-600 mt-2">{report.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {new Date(report.report_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}