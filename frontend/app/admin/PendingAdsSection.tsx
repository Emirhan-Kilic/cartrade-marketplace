import React, { useState, useEffect } from 'react';

interface Vehicle {
  manufacturer: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  city: string;
  state: string;
  description: string;
  vehicle_type: 'car' | 'motorcycle' | 'truck';
  number_of_doors?: number;
  seating_capacity?: number;
  transmission?: string;
  engine_capacity?: number;
  bike_type?: string;
  cargo_capacity?: number;
  has_towing_package?: boolean;
}

interface Photo {
  photo_ID: number;
  photo_url: string;
}

interface Ad {
  ad_ID: number;
  post_date: string;
  owner: number;
  owner_name: string;
  status: string;
  photos: Photo[];
  vehicle: Vehicle;
}

const PendingAdsSection = () => {
  const [pendingAds, setPendingAds] = useState<Ad[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const fetchPendingAds = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-ads`);
      const data = await response.json();
      setPendingAds(data.ads || []);
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
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} ad`);
      }
      
      setMessage(`Ad ${action}ed successfully`);
      await fetchPendingAds();
      setSelectedAd(null);
    } catch (error) {
      console.error(`Error ${action}ing ad:`, error);
      setMessage(`Error ${action}ing ad`);
    }
  };

  const renderVehicleDetails = (ad: Ad) => {
    const commonDetails = (
      <>
        <p><span className="font-medium">Posted by:</span> {ad.owner_name}</p>
        <p><span className="font-medium">Vehicle:</span> {ad.vehicle.manufacturer} {ad.vehicle.model}</p>
        <p><span className="font-medium">Year:</span> {ad.vehicle.year}</p>
        <p><span className="font-medium">Price:</span> ${ad.vehicle.price.toLocaleString()}</p>
        <p><span className="font-medium">Mileage:</span> {ad.vehicle.mileage.toLocaleString()}</p>
        <p><span className="font-medium">Condition:</span> {ad.vehicle.condition}</p>
        <p><span className="font-medium">Location:</span> {ad.vehicle.city}, {ad.vehicle.state}</p>
      </>
    );

    const specificDetails = {
      car: (vehicle: Vehicle) => (
        <>
          <p><span className="font-medium">Doors:</span> {vehicle.number_of_doors}</p>
          <p><span className="font-medium">Seats:</span> {vehicle.seating_capacity}</p>
          <p><span className="font-medium">Transmission:</span> {vehicle.transmission}</p>
        </>
      ),
      motorcycle: (vehicle: Vehicle) => (
        <>
          <p><span className="font-medium">Engine:</span> {vehicle.engine_capacity}cc</p>
          <p><span className="font-medium">Type:</span> {vehicle.bike_type}</p>
        </>
      ),
      truck: (vehicle: Vehicle) => (
        <>
          <p><span className="font-medium">Cargo Capacity:</span> {vehicle.cargo_capacity}</p>
          <p><span className="font-medium">Towing Package:</span> {vehicle.has_towing_package ? 'Yes' : 'No'}</p>
        </>
      )
    };

    const photoSection = ad.photos?.length > 0 ? (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Photos</h4>
        <div className="grid grid-cols-2 gap-2">
          {ad.photos.map((photo) => (
            <img 
              key={photo.photo_ID}
              src={photo.photo_url} 
              alt={`${ad.vehicle.manufacturer} ${ad.vehicle.model}`}
              className="w-full h-48 object-cover rounded"
            />
          ))}
        </div>
      </div>
    ) : (
      <p className="text-gray-500 mt-2">No photos provided</p>
    );

    return (
      <div className="space-y-2">
        {commonDetails}
        {ad.vehicle.vehicle_type && specificDetails[ad.vehicle.vehicle_type](ad.vehicle)}
        <p><span className="font-medium">Description:</span> {ad.vehicle.description}</p>
        {photoSection}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Pending Ads</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('Error') ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {message}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-3">Pending Review ({pendingAds.length})</h3>
          {pendingAds.length === 0 ? (
            <p className="text-gray-500">No pending ads to review</p>
          ) : (
            pendingAds.map(ad => (
              <div 
                key={ad.ad_ID}
                className={`border-b p-2 cursor-pointer hover:bg-gray-50 ${
                  selectedAd?.ad_ID === ad.ad_ID ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedAd(ad)}
              >
                <p className="font-medium">{ad.vehicle.manufacturer} {ad.vehicle.model}</p>
                <p className="text-sm text-gray-600">
                  Posted: {new Date(ad.post_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">By: {ad.owner_name}</p>
              </div>
            ))
          )}
        </div>

        {selectedAd && (
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Ad Details</h3>
            {renderVehicleDetails(selectedAd)}
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => handleAdAction(selectedAd.ad_ID, 'approve')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAdAction(selectedAd.ad_ID, 'reject')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAdsSection;