import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
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

export default function DateManager() {
  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  
  // List state
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'important-dates'), {
        title,
        date,
        description,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setDate('');
      setDescription('');
      toast.success('Important date added successfully!');
    } catch (error) {
      toast.error('Failed to add important date');
    }
  };

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Form Section */}
      <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={24} className="text-blue-600" />
          Add Important Date
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Date
          </button>
        </form>
      </div>

      {/* List Section */}
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
    </div>
  );
}