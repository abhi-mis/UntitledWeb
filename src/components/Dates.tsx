import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc,
} from 'firebase/firestore';
import { Calendar, Trash2, User, Plus, Search, X, Clock } from 'lucide-react';
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
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!auth.currentUser ) {
      setDates([]);
      setLoading(false);
      return;
    }
  
    const q = query(
      collection(db, 'important-dates'),
      where('userId', '==', auth.currentUser .uid) // Fetch only dates added by the current user
    );
  
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dateData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ImportantDate));
        // Sort the dates after fetching
        const sortedDates = dateData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setDates(sortedDates);
        setLoading(false);
      },
      (error) => {
        toast.error("Error fetching dates: " + error.message);
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, [auth.currentUser ]); // Add dependency on auth.currentUser  // Add dependency on user email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("You must be logged in to add dates.");
      return;
    }
  
    // Ensure all fields are filled
    if (!title || !date || !description) {
      toast.error("All fields are required.");
      return;
    }
  
    // Check if the date is valid
    if (isNaN(new Date(date).getTime())) {
      toast.error("Invalid date format.");
      return;
    }
  
    setIsSubmitting(true);
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
      setIsModalOpen(false);
      toast.success('Important date added successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to add important date: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
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

  const filteredDates = dates.filter(date =>
    date.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    date.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-violet-600" />
              <h1 className="text-2xl font-bold text-gray-900">Important Dates</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Date
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-24 bg-gray-200 rounded w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDates.map((date) => (
              <div
                key={date.id}
                className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-l-4 ${
                  isUpcoming(date.date) ? 'border-l-violet-500' : 'border-l-gray-300'
                } overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {date.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(date.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center text-violet-600 mb-3">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">
                      {new Date(date.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-3 mb-4 min-h-[4.5rem]">
                    {date.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <User size={14} className="mr-2" />
                    <span className="truncate">{date.userEmail}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredDates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-600 mb-2">No dates found</p>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding some important dates!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Date Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Important Date</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent h-32"
                      required
                      disabled={isSubmitting}
                      placeholder="Add event details..."
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Add Date
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}