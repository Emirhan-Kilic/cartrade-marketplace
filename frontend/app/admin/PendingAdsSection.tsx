import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Vehicle {
  vehicle_ID: number;
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: 'new' | 'used' | 'certified pre-owned';
  city: string;
  state: string;
  description: string;
  // Car specific
  number_of_doors?: number;
  seating_capacity?: number;
  transmission?: 'manual' | 'automatic' | 'semi-automatic' | 'CVT';
  vehicle_type: 'car' | 'motorcycle' | 'truck';
  photos?: { photo_ID: number; photo_url: string; }[];
}

interface Ad {
  ad_ID: number;
  post_date: string;
  owner: number;
  owner_name: string;
  status: 'Pending' | 'Active' | 'Inactive' | 'Expired' | 'Sold' | 'Rejected';
  photos: { photo_ID: number; photo_url: string; }[];
  vehicle: Vehicle;
}

const VehicleDetailsModal = ({ isOpen, vehicle, onClose }: { isOpen: boolean; vehicle: Vehicle; onClose: () => void }) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        {vehicle.photos && vehicle.photos.length > 0 && (
          <div className="mb-4">
            <Image
              src={vehicle.photos[0].photo_url}
              alt={`${vehicle.manufacturer} ${vehicle.model}`}
              width={400}
              height={250}
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">
          {vehicle.manufacturer || 'Unknown'} {vehicle.model || ''}
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold">Price</p>
            <p className="text-blue-600">
              ${vehicle.price ? vehicle.price.toLocaleString() : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold">Year</p>
            <p>{vehicle.year || 'N/A'}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Condition</p>
            <p className="capitalize">{vehicle.condition || 'N/A'}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Mileage</p>
            <p>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'N/A'}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Location</p>
            <p>{vehicle.city && vehicle.state ? `${vehicle.city}, ${vehicle.state}` : 'N/A'}</p>
          </div>

          {vehicle.vehicle_type === 'car' && (
            <>
              <div>
                <p className="text-lg font-semibold">Number of Doors</p>
                <p>{vehicle.number_of_doors || 'N/A'}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Seating Capacity</p>
                <p>{vehicle.seating_capacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Transmission</p>
                <p className="capitalize">{vehicle.transmission || 'N/A'}</p>
              </div>
            </>
          )}

          <div>
            <p className="text-lg font-semibold">Description</p>
            <p className="whitespace-pre-wrap">{vehicle.description || 'No description available'}</p>
          </div>
        </div>

        <button
          className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const PendingAdsSection = () => {
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const openModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const fetchPendingAds = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-ads`);
      if (!response.ok) throw new Error('Failed to fetch pending ads');
      const data = await response.json();

      // Transform the data to match our expected format
      const processedAds = data.ads?.map((ad: any) => ({
        ad_ID: ad.ad_ID,
        post_date: ad.post_date,
        owner: ad.owner_id,
        owner_name: `${ad.owner_first_name} ${ad.owner_last_name}`,
        status: ad.status,
        photos: ad.photo_urls ? ad.photo_urls.split(',').map((url: string, index: number) => ({
          photo_ID: index,
          photo_url: url
        })) : [],
        vehicle: {
          vehicle_ID: ad.vehicle_ID,
          manufacturer: ad.manufacturer,
          model: ad.model,
          year: ad.year,
          price: ad.price,
          mileage: ad.mileage,
          condition: ad.condition,
          city: ad.city,
          state: ad.state,
          description: ad.description,
          vehicle_type: ad.vehicle_type,
          // Car specific fields
          number_of_doors: ad.number_of_doors,
          seating_capacity: ad.seating_capacity,
          transmission: ad.transmission,
          // Motorcycle specific fields
          engine_capacity: ad.engine_capacity,
          bike_type: ad.bike_type,
          // Truck specific fields
          cargo_capacity: ad.cargo_capacity,
          has_towing_package: ad.has_towing_package,
          // Photos
          photos: ad.photo_urls ? ad.photo_urls.split(',').map((url: string, index: number) => ({
            photo_ID: index,
            photo_url: url
          })) : []
        }
      })) || [];

      setPendingAds(processedAds);
    } catch (error) {
      console.error('Error fetching pending ads:', error);
      setMessage('Error loading pending ads');
    }
  };

  const handleAdAction = async (adId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/ads/${adId}/${action}`,
        { method: 'PUT' }
      );
      
      if (!response.ok) throw new Error(`Failed to ${action} ad`);
      
      setMessage(`Ad ${action}ed successfully`);
      await fetchPendingAds();
      setSelectedVehicle(null);
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error);
      setMessage(`Error ${action}ing ad`);
    }
  };

  return (
    <div className="container mx-auto px-6">
      <h2 className="text-3xl font-semibold text-blue-600 mb-6">
        Pending Ads Review ({pendingAds.length})
      </h2>

      {message && (
        <div className={`p-4 mb-6 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {pendingAds.map((ad) => (
          <div
            key={ad.ad_ID}
            className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-200"
          >
            <Image
                src={ad.photos?.[0]?.photo_url || 'https://picsum.photos/400/250'}
                alt={`${ad.vehicle.manufacturer} ${ad.vehicle.model}`}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">
                {ad.vehicle.manufacturer} {ad.vehicle.model}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {ad.vehicle.city}, {ad.vehicle.state}
              </p>
              <p className="text-lg font-semibold text-blue-600 mb-4">
                ${ad.vehicle.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Status: {ad.status}
              </p>

              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-200"
                  onClick={() => openModal(ad.vehicle)}
                >
                  View Details
                </button>
                <button
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none transition-all duration-200"
                  onClick={() => handleAdAction(ad.ad_ID, 'approve')}
                >
                  Approve
                </button>
              </div>

              <button
                className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none transition-all duration-200"
                onClick={() => handleAdAction(ad.ad_ID, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {pendingAds.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No pending ads to review
          </div>
        )}
      </div>

      {selectedVehicle && (
        <VehicleDetailsModal
          isOpen={true}
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  );
};

export default PendingAdsSection;