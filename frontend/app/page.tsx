'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  // State to hold featured vehicles
  const [featuredVehicles, setFeaturedVehicles] = useState([]);

  // Fetch premium vehicles on component mount
  useEffect(() => {
    const fetchPremiumVehicles = async () => {
      try {
        const response = await fetch('http://localhost:8000/premium-vehicles');
        const data = await response.json();

        if (data.vehicles) {
          setFeaturedVehicles(data.vehicles);
        } else {
          console.error('No vehicles found');
        }
      } catch (error) {
        console.error('Error fetching premium vehicles:', error);
      }
    };

    fetchPremiumVehicles();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white py-4 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-8">
          {/* Brand */}
          <div className="text-3xl font-semibold tracking-wide">
            <span className="text-yellow-400">Car</span>Trade
          </div>

          {/* Navbar Links */}
          <div className="space-x-8 flex items-center text-lg font-medium">
            <Link
              href="/login"
              className="hover:text-yellow-400 transition duration-300 ease-in-out transform hover:scale-105 px-4 py-2 border border-transparent rounded-full hover:bg-yellow-400 hover:text-black"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-yellow-400 transition duration-300 ease-in-out transform hover:scale-105 px-4 py-2 border border-transparent rounded-full hover:bg-yellow-400 hover:text-black"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-32 mt-16">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
            Your Trusted Marketplace for Buying and Selling Cars
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Explore a wide selection of new and used cars from trusted sellers. Find your next car or sell your vehicle today.
          </p>
          <div className="flex justify-center gap-8">
            <a
              href="/register"
              className="rounded-full bg-yellow-400 text-black px-8 py-3 text-lg font-semibold hover:bg-yellow-500 transition"
            >
              Sell Your Car
            </a>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-semibold text-gray-800 mb-10">Featured Cars</h2>

          {/* Horizontal Scrollable Container for Smaller Screens */}
          <div className="overflow-x-auto flex gap-8 pb-8 px-4 sm:px-0">
            {/* Scrollable Grid for Larger Screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full">
              {featuredVehicles.map((vehicle, idx) => (
                <div
                  key={vehicle.vehicle_ID}
                  className="bg-white shadow-xl rounded-xl p-6 transition transform hover:scale-105 hover:shadow-2xl hover:bg-gray-50"
                >
                  <Image
                    src="https://picsum.photos/200/300"
                    alt={`Featured Car ${vehicle.vehicle_ID}`}
                    width={200}
                    height={300}
                    className="rounded-xl mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{`${vehicle.manufacturer} ${vehicle.model}`}</h3>
                  <p className="text-gray-500 mb-2">{vehicle.description}</p>
                  <p className="text-xl font-bold text-green-600">${vehicle.price}</p>

                  {/* Additional Info: City, State, Mileage, Condition */}
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Location:</strong> {vehicle.city}, {vehicle.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Condition:</strong> {vehicle.condition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto flex gap-6 flex-wrap items-center justify-center">
          <a className="text-sm hover:underline" href="#about-us">
            About Us
          </a>
          <a className="text-sm hover:underline" href="#contact">
            Contact Us
          </a>
          <a className="text-sm hover:underline" href="#faq">
            FAQs
          </a>
        </div>
      </footer>
    </div>
  );
}
