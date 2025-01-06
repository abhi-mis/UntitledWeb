import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ExternalLink, Calendar, Trash2, User, Plus, Link, Search, BookMarked, Library } from 'lucide-react';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt: any;
  userId: string;
  userEmail: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('You must be logged in to add resources');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'resources'), {
        title,
        url,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setUrl('');
      toast.success('Resource added successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="w-full text-center py-8 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Library className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Resource Hub</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Add Resource Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Plus size={24} className="text-blue-600" />
                  Add New Resource
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter resource title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                      <Link size={16} />
                      Resource URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                      placeholder="https://example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <BookMarked size={18} />
                        Add Resource
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Resource List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{resource.title}</h3>
                      <div className="space-y-4">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                        >
                          <ExternalLink size={18} className="mr-2 transition-transform group-hover:translate-x-1" />
                          Visit Resource
                        </a>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} className="text-gray-400" />
                          <span>{resource.userEmail}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {resource.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }) || 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100">
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="w-full text-red-500 hover:text-red-700 flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete Resource
                      </button>
                    </div>
                  </div>
                ))}
                {filteredResources.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookMarked size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-600 mb-2">No resources found</p>
                    <p className="text-gray-500">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by adding some resources!'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}