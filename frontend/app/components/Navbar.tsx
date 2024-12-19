'use client';

import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        // Clear user session data
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('savedEmail');
        sessionStorage.removeItem('savedPassword');

        console.log('User logged out successfully.');

        // Redirect to the login page
        router.push('/login');
    };

    return (
        <nav className="bg-white shadow-lg py-4 fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto flex justify-between items-center px-6">
                {/* Logo */}
                <div className="text-3xl font-bold tracking-tight text-blue-600">
                    <span className="text-yellow-400">Car</span>Trade
                </div>

                {/* Navigation Links */}
                <div className="space-x-6 text-lg font-medium flex items-center">
                    <Link href="/browseAds" className="hover:text-yellow-400">
                        Browse Ads
                    </Link>
                    <Link href="/browseAuctions" className="hover:text-yellow-400">
                        Browse Auctions
                    </Link>
                    <Link href="/profile" className="hover:text-yellow-400">
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
