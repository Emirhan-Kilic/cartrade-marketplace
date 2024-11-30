'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import vehicleData from './vehicleData'; // Adjust path if necessary

// Sample auction and vehicle data
const auctionData = [
  {
    id: 1,
    manufacturer: 'Tesla',
    model: 'Model S',
    year: 2020,
    price: 80000,
    photo: 'https://picsum.photos/400/250',
    auctionEnd: new Date('2024-11-30T23:59:59'),
    bids: [
      { user: 'John Doe', price: 82000, timestamp: new Date('2024-11-10T10:00:00') },
      { user: 'Jane Smith', price: 85000, timestamp: new Date('2024-11-11T12:30:00') },
    ],
  },
];

export default function AuctionPage() {
  const [auction, setAuction] = useState(auctionData[0]);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState(auction.bids);
  const [timeLeft, setTimeLeft] = useState('');

  const vehicle = vehicleData.find(
    (v) =>
      v.manufacturer === auction.manufacturer &&
      v.model === auction.model &&
      v.year === auction.year
  );

  useEffect(() => {
    const calculateTimeLeft = (endTime) => {
      const now = new Date();
      const timeRemaining = endTime - now;

      if (timeRemaining <= 0) {
        setTimeLeft('Auction Ended');
      } else {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    if (auction) {
      calculateTimeLeft(auction.auctionEnd);
      const interval = setInterval(() => calculateTimeLeft(auction.auctionEnd), 1000);
      return () => clearInterval(interval);
    }
  }, [auction]);

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= auction.price) {
      alert('Invalid bid. Please enter a valid bid higher than the current price.');
      return;
    }

    const newBid = {
      user: 'Emirhan Kılıç',
      price: Number(bidAmount),
      timestamp: new Date(),
    };

    setBids([...bids, newBid]);
    setBidAmount('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl font-bold text-blue-700">
            {auction.manufacturer} {auction.model} Auction
          </h1>
          <div className="bg-blue-700 text-white text-lg font-semibold px-4 py-2 rounded-lg">
            {timeLeft}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow mt-20">
        {/* Auction Details Section */}
        <section className="py-10 bg-white shadow-lg rounded-lg overflow-hidden mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Image
                src={auction.photo}
                alt={`${auction.manufacturer} ${auction.model}`}
                width={400}
                height={250}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {`${auction.manufacturer} ${auction.model} (${auction.year})`}
              </h3>
              <p className="text-lg font-semibold text-blue-600 mb-4">${auction.price.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Auction Ends: {auction.auctionEnd.toLocaleString()}</p>
              {vehicle && (
                <div className="mt-4 text-sm text-gray-700">
                  <p>Mileage: {vehicle.mileage.toLocaleString()} miles</p>
                  <p>Condition: {vehicle.condition}</p>
                  <p>Location: {vehicle.city}, {vehicle.state}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Place Bid Section */}
        <section className="py-10 bg-white shadow-md mt-10">
          <div className="container mx-auto px-6 max-w-xl">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Place Your Bid</h2>
            <form onSubmit={handleBidSubmit} className="flex space-x-4">
              <input
                type="number"
                name="bidAmount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter your bid"
                className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300 flex-1"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                Place Bid
              </button>
            </form>
          </div>
        </section>

        {/* Bid History Section */}
        <section className="py-10">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Bid History</h2>
            <ul className="space-y-4">
              {bids.length === 0 ? (
                <li>No bids placed yet.</li>
              ) : (
                bids.map((bid, index) => (
                  <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <p className="font-semibold text-gray-800">{bid.user}</p>
                    <p className="text-sm text-gray-600">Bid Amount: ${bid.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Placed at: {bid.timestamp.toLocaleString()}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="text-center">
          <p>&copy; 2024 CarTrade. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

