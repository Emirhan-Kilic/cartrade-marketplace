'use client';
import {useState} from 'react';
import Link from 'next/link';

export default function Register() {
  const [role, setRole] = useState('buyer-seller');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRoleChange = (value: string) => {
    setRole(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Split the name into first and last names
    const [first_name, last_name] = name.split(' ');

    const data = {
      first_name,
      last_name,
      email,
      password,
      role,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(data)

      if (response.ok) {
        window.location.href = '/login';
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <section
        className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-24">
        <div className="container mx-auto text-center px-4 sm:px-8 w-full max-w-lg">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">Create Your Account</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8">Join the CarTrade marketplace and manage your car listings with
            ease.</p>

          <div className="max-w-md mx-auto bg-white text-black p-6 sm:p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg sm:text-xl font-semibold mb-2 text-left">Full
                  Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-lg sm:text-xl font-semibold mb-2 text-left">Email
                  Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>

              <div>
                <label htmlFor="password"
                       className="block text-lg sm:text-xl font-semibold mb-2 text-left">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-lg sm:text-xl font-semibold mb-2 text-left">Confirm
                  Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="role" className="block text-lg sm:text-xl font-semibold mb-2 text-left">Select Your
                  Role</label>
                <div className="flex justify-center">
                  <div
                    className="relative inline-flex items-center justify-between w-64 h-14 p-1 bg-gray-300 rounded-full cursor-pointer shadow-md transition-all duration-300 ease-in-out">
                    <div
                      onClick={() => handleRoleChange('buyer-seller')}
                      className={`flex justify-center items-center w-1/2 h-full bg-${role === 'buyer-seller' ? 'yellow-500' : 'gray-300'} rounded-full transition-all duration-300 ease-in-out border-2 border-${role === 'buyer-seller' ? 'yellow-500' : 'gray-300'}`}
                    >
                      <span
                        className={`text-lg font-semibold text-${role === 'buyer-seller' ? 'black' : 'gray-600'} transition-all duration-300 ease-in-out`}>Buyer/Seller</span>
                    </div>
                    <div
                      onClick={() => handleRoleChange('inspector')}
                      className={`flex justify-center items-center w-1/2 h-full bg-${role === 'inspector' ? 'yellow-500' : 'gray-300'} rounded-full transition-all duration-300 ease-in-out border-2 border-${role === 'inspector' ? 'yellow-500' : 'gray-300'}`}
                    >
                      <span
                        className={`text-lg font-semibold text-${role === 'inspector' ? 'black' : 'gray-600'} transition-all duration-300 ease-in-out`}>Inspector</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded text-yellow-400 focus:ring-yellow-400 transition"
                />
                <label htmlFor="terms" className="ml-2 text-sm sm:text-base text-gray-600">I agree to the Terms and
                  Conditions</label>
              </div>

              <button type="submit"
                      className="w-full py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition">Register
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-yellow-400 hover:underline">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-6 sm:py-8">
        <div className="container mx-auto flex gap-6 flex-wrap items-center justify-center">
          <a className="text-sm sm:text-base hover:underline" href="#about-us">About Us</a>
          <a className="text-sm sm:text-base hover:underline" href="#contact">Contact Us</a>
          <a className="text-sm sm:text-base hover:underline" href="#faq">FAQs</a>
        </div>
      </footer>
    </div>
  );
}
