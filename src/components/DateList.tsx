import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Calendar, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: string;
  userId: string;
  userEmail: string;
}

export default function DateList() {
  const [dates, setDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'important-dates'),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dateData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImportantDate));
      
      setDates(dateData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'important-dates', id));
      toast.success('Date deleted successfully');
    } catch (error) {
      toast.error('Failed to delete date');
    }
  };

  const isUpcoming = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate >= now;
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">📅 Important Dates</h2>
      <div className="space-y-6">
        {dates.map((date) => (
          <div
            key={date.id}
            className={`relative bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-lg transition-shadow border-l-4 ${
              isUpcoming(date.date) ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-blue-700">
                  {date.title}
                </h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <Calendar size={18} className="mr-2 text-blue-500" />
                  <span>
                    {new Date(date.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(date.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete Date"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <p className="text-gray-700 mt-3 leading-relaxed">{date.description}</p>
            <div className="mt-4 flex items-center text-gray-500 text-sm">
              <User size={16} className="mr-2 text-blue-400" />
              Added by: <span className="ml-1 font-medium text-blue-600">{date.userEmail}</span>
            </div>
          </div>
        ))}
        {dates.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg">No important dates added yet.</p>
            <p>Click "Add Date" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
