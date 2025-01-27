import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  Timestamp,
  updateDoc 
} from 'firebase/firestore';
import { FileText, Calendar, Trash2, User, Plus, Search, X, BookOpen, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  userId: string;
  userEmail: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', auth.currentUser.uid),
      
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const noteData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Note));
        setNotes(noteData);
        setLoading(false);
      },
      (error) => {
        toast.error("Error fetching notes: " + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("You must be logged in to add notes.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), {
          title,
          content,
          updatedAt: Timestamp.now(),
        });
        toast.success('Note updated successfully!');
      } else {
        await addDoc(collection(db, 'notes'), {
          title,
          content,
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          createdAt: Timestamp.now(),
        });
        toast.success('Note added successfully!');
      }
      setTitle('');
      setContent('');
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast.error(editingNote ? 'Failed to update note' : 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Notes
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
                />
              </div>
              <button
                onClick={() => {
                  setEditingNote(null);
                  setTitle('');
                  setContent('');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Note
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
                <div className="h-24 bg-gray-200 rounded-full w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="group relative bg-white/40 hover:bg-white/70 backdrop-blur-sm rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 border border-gray-100/50"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors duration-300">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-emerald-500 transition-colors p-2 opacity-0 group-hover:opacity-100 hover:bg-emerald-50 rounded-xl"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-4 mb-4">
                    <p className="text-gray-600 line-clamp-4 min-h-[5rem]">
                      {note.content}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                      <User size={14} className="text-gray-400" />
                      <span className="truncate">{note.userEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Calendar size={14} className="mr-2 text-gray-400" />
                      {note.createdAt.toDate().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-gray-50">
                  <FileText size={48} className="text-gray-300" />
                </div>
                <p className="text-xl text-gray-600 mt-4 mb-2">No notes found</p>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by adding some notes!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm" onClick={() => {
                setIsModalOpen(false);
                setEditingNote(null);
                setTitle('');
                setContent('');
              }} />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {editingNote ? 'Edit Note' : 'Add New Note'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingNote(null);
                      setTitle('');
                      setContent('');
                    }}
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      required
                      disabled={isSubmitting}
                      placeholder="Enter note title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 h-32"
                      required
                      disabled={isSubmitting}
                      placeholder="Write your note here..."
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingNote(null);
                        setTitle('');
                        setContent('');
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          {editingNote ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          {editingNote ? <Pencil size={16} /> : <Plus size={16} />}
                          {editingNote ? 'Update Note' : 'Add Note'}
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