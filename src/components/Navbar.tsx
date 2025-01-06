import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { LogOut, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [userName, setUserName] = useState<string | null>(null);
  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    const fetchUserName = async () => {
      const userDocRef = doc(db, 'users', user.uid); // Replace 'users' with your collection name
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name); // Assuming 'name' is the field you stored
      } else {
        console.log('No such user document!');
      }
    };

    if (user) {
      fetchUserName();
    }
  }, [user, db]);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Share2 className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">UntitledWeb</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userName || user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
