import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ExternalLink, Calendar, Trash2 } from 'lucide-react';
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
    try {
      console.log('Setting up resources listener');
      const q = query(
        collection(db, 'resources'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('Received resources update:', snapshot.size, 'documents');
          const resourceData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
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
    } catch (error) {
      console.error('Error setting up resources listener:', error);
      setError('Failed to set up resources listener');
      setLoading(false);
    }
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
        <div className="animate-pulse">Loading resources...</div>
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
      <h2 className="text-2xl font-bold mb-6">Shared Resources</h2>
      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {resource.title}
                </h3>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={16} />
                  Visit Resource
                </a>
                <div className="text-sm text-gray-500">
                  Shared by: {resource.userEmail}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar size={16} className="mr-1" />
                  {resource.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </div>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <p className="text-center text-gray-500">No resources shared yet.</p>
        )}
      </div>
    </div>
  );
}