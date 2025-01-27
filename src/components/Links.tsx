import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ExternalLink, Trash2, User, Plus, Link as LinkIcon, Search, Bookmark, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Link {
  id: string;
  title: string;
  url: string;
  type: 'profile' | 'docs';
  description?: string;
  tags?: string[];
  createdAt: any;
  userId: string;
  userEmail: string;
}

export default function Links() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'profile' | 'docs'>('docs');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'profile' | 'docs'>('all');

  useEffect(() => {
    if (!auth.currentUser) {
      setLinks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'links'),
      where('userId', '==', auth.currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const linkData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Link));
        setLinks(linkData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching links:', error);
        setError('Failed to load links');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('You must be logged in to add links');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'links'), {
        title,
        url,
        type,
        description,
        tags,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setUrl('');
      setType('docs');
      setDescription('');
      setTags([]);
      setTagInput('');
      setIsModalOpen(false);
      toast.success('Link added successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to add link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'links', id));
      toast.success('Link deleted successfully');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredLinks = links
    .filter(link => filter === 'all' || link.type === filter)
    .filter(link =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <LinkIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Links Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('profile')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'profile'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Profiles
                </button>
                <button
                  onClick={() => setFilter('docs')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'docs'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Docs
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl w-64 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Link
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
              <div key={i} className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded-full w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className="group relative bg-white/40 hover:bg-white/70 backdrop-blur-sm rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 border border-gray-100/50"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          link.type === 'profile'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {link.type === 'profile' ? 'Profile' : 'Documentation'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors duration-300">
                        {link.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {link.description && (
                    <p className="mt-2 text-gray-600 line-clamp-2">
                      {link.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 group/link"
                    >
                      <ExternalLink size={16} className="mr-2 transition-transform group-hover/link:translate-x-1" />
                      Visit Link
                    </a>

                    {link.tags && link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {link.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <User size={14} className="text-gray-400" />
                        <span className="truncate">{link.userEmail}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {link.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) || 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredLinks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-gray-50">
                  <Bookmark size={48} className="text-gray-300" />
                </div>
                <p className="text-xl text-gray-600 mt-4 mb-2">No links found</p>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding some links!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span> <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Add New Link
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter link title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <LinkIcon size={14} />
                      URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      required
                      disabled={isSubmitting}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'profile' | 'docs')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      disabled={isSubmitting}
                    >
                      <option value="profile">Profile</option>
                      <option value="docs">Documentation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 h-24"
                      disabled={isSubmitting}
                      placeholder="Add a description (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-purple-500 hover:text-purple-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      disabled={isSubmitting}
                      placeholder="Type tag and press Enter"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Add Link
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