// filepath: /src/App.tsx
import { useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/userSlice';
import { RootState } from './store/store';

function App() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <AuthForm />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Dashboard user={user} />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;