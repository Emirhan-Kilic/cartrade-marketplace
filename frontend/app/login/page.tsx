'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  // State for email, password, loading state, and login status message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedInMessage, setLoggedInMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter(); // Next.js router to redirect after login

  // Check if a user is already logged in using localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');

    if (userId && userEmail) {
      // Set message and delay the redirect for user feedback
      setLoggedInMessage('You are already logged in. Redirecting...');
      setTimeout(() => {
        router.push('/browseAds'); // Redirect after message is shown
      }, 2000); // Delay to show the message for 2 seconds
    } else {
      // If user is not logged in, check localStorage for saved email/password
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPassword = localStorage.getItem('savedPassword');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = { email, password };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Parse the response body as JSON
        const responseData = await response.json();

        // Log the response data for debugging
        console.log('Response Data:', responseData);

        // Save the id, email, and role to localStorage
        localStorage.setItem('userId', responseData.id);
        localStorage.setItem('userEmail', responseData.email);
        localStorage.setItem('userRole', responseData.role); // Save role to localStorage

        // If rememberMe is checked, save email and password to localStorage
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          // Clear saved credentials if rememberMe is not checked
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        // Role-based routing
        const userRole = responseData.role;
        console.log('User Role:', userRole); // Log the role to check

        // Delay to ensure role is set before redirect
        setTimeout(() => {
          if (userRole === 'owner_seller') {
            router.push('/browseAds'); // Redirect to the browse ads page
          } else if (userRole === 'inspector') {
            router.push('/inspecProfile'); // Redirect to the inspector profile
          } else if (userRole === 'admin') {
            router.push('/adminProfile'); // Redirect to the admin profile
          } else {
            setError('Invalid role or access not allowed');
          }
        }, 500); // Small delay to ensure redirection works correctly

      } else {
        // Handle failed login (e.g., wrong credentials)
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Login Section */}
      <section className="flex-grow flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-8 w-full max-w-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight text-center">
            Login to Your Account
          </h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-center">
            Access your CarTrade marketplace and manage your car listings easily.
          </p>

          {/* Displaying login status message */}
          {loggedInMessage && (
            <div className="text-yellow-400 text-lg mb-6 text-center">
              {loggedInMessage}
            </div>
          )}

          {/* Login Form */}
          <div className="bg-white text-black p-6 sm:p-8 rounded-xl shadow-lg w-full">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-lg sm:text-xl font-semibold mb-2 text-left">
                  Email Address
                </label>
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
                <label htmlFor="password" className="block text-lg sm:text-xl font-semibold mb-2 text-left">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 rounded text-yellow-400 focus:ring-yellow-400 transition"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)} // Toggle rememberMe state
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm sm:text-base text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm sm:text-base text-yellow-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-yellow-400 hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8">
        <div className="container mx-auto flex gap-6 flex-wrap items-center justify-center">
          <a className="text-sm sm:text-base hover:underline" href="#about-us">
            About Us
          </a>
          <a className="text-sm sm:text-base hover:underline" href="#contact">
            Contact Us
          </a>
          <a className="text-sm sm:text-base hover:underline" href="#faq">
            FAQs
          </a>
        </div>
      </footer>
    </div>
  );
}
