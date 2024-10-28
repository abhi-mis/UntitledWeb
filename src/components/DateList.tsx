import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Calendar, Trash2 } from 'lucide-react';
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
      <h2 className="text-2xl font-bold mb-6">Important Dates</h2>
      <div className="space-y-4">
        {dates.map((date) => (
          <div
            key={date.id}
            className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
              isUpcoming(date.date) ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {date.title}
                </h3>
                <div className="flex items-center text-blue-600 font-medium mt-1">
                  <Calendar size={16} className="mr-2" />
                  {new Date(date.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <button
                onClick={() => handleDelete(date.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-gray-600 mt-2">{date.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              Added by: {date.userEmail}
            </div>
          </div>
        ))}
        {dates.length === 0 && (
          <p className="text-center text-gray-500">No important dates added yet.</p>
        )}
      </div>
    </div>
  );
}