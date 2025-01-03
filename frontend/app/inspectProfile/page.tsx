'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import {
  FaCar,
  FaCheckCircle,
  FaClipboardList,
  FaCertificate,
  FaHistory,
  FaSearch,
  FaFileAlt,
  FaUserCog,
} from "react-icons/fa";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  number_of_inspections: number;
  number_of_certificates: number;
  dateJoined: string;
  profile_picture: string;
  first_name: string;
  last_name: string;
}

interface Vehicle {
  vehicle_ID: number;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
}

interface InspectionFormData {
  findings: string;
  issues: string;
  recommendations: string;
  result: 'Pending' | 'Passed' | 'Failed';
}

// Certification Modal Component
interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (certificationData: {
    validityPeriod: number;
    certificationNumber: string;
  }) => void;
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [validityPeriod, setValidityPeriod] = useState(12); // Default 12 months
  const [certificationNumber, setCertificationNumber] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Issue Certification</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Number
            </label>
            <input
              type="text"
              value={certificationNumber}
              onChange={(e) => setCertificationNumber(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter certification number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validity Period (months)
            </label>
            <input
              type="number"
              value={validityPeriod}
              onChange={(e) => setValidityPeriod(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
              min={1}
              max={60}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ validityPeriod, certificationNumber })}
              disabled={!certificationNumber || validityPeriod < 1}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Issue Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function InspectorProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  
  const [inspectionForm, setInspectionForm] = useState<InspectionFormData>({
    findings: '',
    issues: '',
    recommendations: '',
    result: 'Pending'
  });

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    // Fetch inspector profile and pending inspections
    const fetchData = async () => {
      try {
        const [profileRes, vehiclesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/${userId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inspector/${userId}/pending-inspections`)
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileData({
            ...data,
            phone: data.phone_number || "",
            address: data.address || "",
            profile_picture: data.profile_picture || "https://picsum.photos/400/250",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            dateJoined: data.join_date || "",
          });
        }

        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          setPendingVehicles(data.vehicles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setLoading(true);
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/inspector/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.vehicle_ID,
          inspector_id: userId,
          ...inspectionForm
        }),
      });

      if (response.ok) {
        setMessage('Inspection report submitted successfully');
        setSelectedVehicle(null);
        setInspectionForm({
          findings: '',
          issues: '',
          recommendations: '',
          result: 'Pending'
        });
      }
    } catch (error) {
      setMessage('Failed to submit inspection report');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertification = async (certData: { validityPeriod: number; certificationNumber: string }) => {
    if (!selectedVehicle) return;

    try {
      const userId = sessionStorage.getItem("userId");
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/inspector/issue-certification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.vehicle_ID,
          inspector_id: userId,
          certification_number: certData.certificationNumber,
          validity_period: certData.validityPeriod
        }),
      });

      if (response.ok) {
        setMessage('Certification issued successfully');
        setIsCertModalOpen(false);
      }
    } catch (error) {
      setMessage('Failed to issue certification');
    }
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      <Navbar />

      <section className="mt-20">
        <div className="container mx-auto px-6 mt-4">
          {/* Profile Section */}
          <div className="bg-white shadow-2xl rounded-lg p-10 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
              <Image
                src={profileData.profile_picture}
                alt="Inspector Profile"
                width={150}
                height={150}
                className="rounded-full shadow-md"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-semibold text-blue-600">
                  Inspector {profileData.first_name} {profileData.last_name}
                </h2>
                <p className="text-sm text-gray-600">Email: {profileData.email}</p>
                <p className="text-sm text-gray-600">Phone: {profileData.phone || "Not provided"}</p>
                <p className="text-sm text-gray-600">Address: {profileData.address || "Not provided"}</p>
                <p className="text-sm text-gray-600">Date Joined: {profileData.dateJoined}</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-700">Inspections</p>
                  <p className="text-2xl text-blue-600">{profileData.number_of_inspections}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-700">Certifications</p>
                  <p className="text-2xl text-green-600">{profileData.number_of_certificates}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push("/pendingInspections")}
                className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                <FaCar className="mr-2" /> Pending Inspections
              </button>
              <button
                onClick={() => router.push("/completedInspections")}
                className="flex items-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                <FaCheckCircle className="mr-2" /> Completed Inspections
              </button>
              <button
                onClick={() => router.push("/issuedCertifications")}
                className="flex items-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
              >
                <FaCertificate className="mr-2" /> Issued Certifications
              </button>
            </div>
          </div>

          {/* Inspection Section */}
          {selectedVehicle ? (
            <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Inspection Form - {selectedVehicle.manufacturer} {selectedVehicle.model}</h2>
              
              <form onSubmit={handleSubmitInspection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea
                    value={inspectionForm.findings}
                    onChange={(e) => setInspectionForm(prev => ({ ...prev, findings: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issues Found</label>
                  <textarea
                    value={inspectionForm.issues}
                    onChange={(e) => setInspectionForm(prev => ({ ...prev, issues: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                  <textarea
                    value={inspectionForm.recommendations}
                    onChange={(e) => setInspectionForm(prev => ({ ...prev, recommendations: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  <select
                    value={inspectionForm.result}
                    onChange={(e) => setInspectionForm(prev => ({ ...prev, result: e.target.value as 'Pending' | 'Passed' | 'Failed' }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVehicle(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Pending Inspections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingVehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicle_ID}
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-500"
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <h3 className="font-semibold">{vehicle.manufacturer} {vehicle.model}</h3>
                    <p>Year: {vehicle.year}</p>
                    <p>Mileage: {vehicle.mileage}</p>
                    <p>Condition: {vehicle.condition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded ${
              message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Completed Inspections Section */}
          <div className="bg-white shadow-xl rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Recent Completed Inspections</h2>
            <div className="space-y-4">
              {inspectionForm.result === 'Passed' && (
                <button
                  onClick={() => setIsCertModalOpen(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  <FaCertificate className="inline-block mr-2" />
                  Issue Certification
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-xl rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Today's Inspections</h3>
                  <p className="text-3xl font-bold text-blue-600">5</p>
                </div>
                <FaClipboardList className="text-4xl text-blue-400" />
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Certifications Issued</h3>
                  <p className="text-3xl font-bold text-green-600">128</p>
                </div>
                <FaCertificate className="text-4xl text-green-400" />
              </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Pending Reviews</h3>
                  <p className="text-3xl font-bold text-orange-600">3</p>
                </div>
                <FaHistory className="text-4xl text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Modal */}
      <CertificationModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onSubmit={handleIssueCertification}
      />
    </div>
  );
}