'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Login() {
  // State for email, password, and loading state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter(); // Next.js router to redirect after login

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = {email, password};

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

        // Save the id and email to localStorage
        localStorage.setItem('userId', responseData.id);
        localStorage.setItem('userEmail', responseData.email);

        // If login is successful, redirect to a protected route
        router.push('/dashboard'); // Or wherever you want to redirect
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
      <section
        className="flex-grow flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-8 w-full max-w-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight text-center">
            Login to Your Account
          </h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-center">
            Access your CarTrade marketplace and manage your car listings easily.
          </p>

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
