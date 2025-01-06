import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { FileText, Calendar, Trash2, User } from 'lucide-react';
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("You must be logged in to add notes.");
      return;
    }

    try {
      await addDoc(collection(db, 'notes'), {
        title,
        content,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: Timestamp.now(),
      });
      setTitle('');
      setContent('');
      toast.success('Note added successfully!');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={24} className="text-blue-600" />
          Add New Note
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
            <label className="block text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Note
          </button>
        </form>
      </div>

      <div className="w-full">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 text-center">📝 Shared Notes</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading notes...</p>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="relative bg-gradient-to-r from-white to-blue-50 p-6 rounded-lg shadow-lg transition-shadow border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-blue-700">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={18} className="mr-2 text-blue-500" />
                      {note.createdAt.toDate().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mt-3 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
                <div className="mt-4 flex items-center text-gray-500 text-sm">
                  <User size={16} className="mr-2 text-blue-400" />
                  Shared by: <span className="ml-1 font-medium text-blue-600">{note.userEmail}</span>
                </div>
              </div>
            ))}
            {notes.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg">No notes shared yet.</p>
                <p>Start adding some to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}