// filepath: /src/components/Navbar.tsx
import { auth } from '../lib/firebase';
import { LogOut, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setUser } from '../store/userSlice';

export default function Navbar() {
  const user = useSelector((state: RootState) => state.user.user);
  const [userName, setUserName] = useState<string | null>(null);
  const db = getFirestore(); // Initialize Firestore
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Replace 'users' with your collection name
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name); // Assuming 'name' is the field you stored
        } else {
          console.log('No such user document!');
        }
      }
    };

    fetchUserName();
  }, [user, db]);

  const handleLogout = () => {
    auth.signOut();
    dispatch(setUser(null));
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-10 top-0">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Share2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">UntitledWeb</span>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-gray-700">
              {userName ? `Welcome, ${userName}!` : 'Welcome!'}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}