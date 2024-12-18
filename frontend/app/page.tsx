'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
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
          <div className="flex gap-8 flex-wrap justify-center">
            {[...Array(5)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white shadow-xl rounded-xl w-72 p-6 transition transform hover:scale-105 hover:shadow-2xl hover:bg-gray-50"
              >
                <Image
                  src="https://picsum.photos/200/300"
                  alt={`Featured Car ${idx + 1}`}
                  width={200}
                  height={300}
                  className="rounded-xl mb-4"
                />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Car Title {idx + 1}</h3>
                <p className="text-gray-500 mb-2">Car details here</p>
                <p className="text-xl font-bold text-green-600">$Price</p>
                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            ))}
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
