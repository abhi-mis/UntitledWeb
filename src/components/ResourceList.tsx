import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ExternalLink, Calendar, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt: any; // Firebase Timestamp
  userId: string;
  userEmail: string;
}

export default function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resourceData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Resource));

        setResources(resourceData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching resources:', error);
        setError('Failed to load resources');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <div className="animate-pulse text-gray-500">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">🔗 Shared Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-200 ease-in-out flex flex-col h-full"
          >
            {/* Title Section */}
            <div className="p-6 flex-grow">
              <h3 className="text-lg font-bold text-blue-700">{resource.title}</h3>
            </div>
            
            {/* Link and Details Section */}
            <div className="px-6 pb-4 mt-auto space-y-2 text-sm text-gray-500">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink size={18} className="mr-2" />
                <span>Visit Resource</span>
              </a>
              <hr/>
              <div className="flex items-center gap-2 mt-2">
                <User size={16} className="text-blue-400" />
                <span>
                  <span className="text-blue-600 font-semibold">Shared by:</span> {resource.userEmail}
                </span>
              </div>
            <hr/>
              <div className="flex items-center text-gray-500">
                <Calendar size={16} className="mr-2 text-blue-500" />
                {resource.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) || 'Unknown date'}
              </div>
            </div>

            {/* Delete Button Section */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => handleDelete(resource.id)}
                className="w-full text-red-500 hover:text-red-700 flex items-center justify-center space-x-2"
                title="Delete Resource"
              >
                <Trash2 size={20} />
                <span>Delete Resource</span>
              </button>
            </div>
          </div>
        ))}
        
        {resources.length === 0 && (
          <div className="text-center text-gray-500 py-10 col-span-full">
            <p className="text-lg">No resources shared yet.</p>
            <p>Start sharing some to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
