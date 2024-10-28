import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NoteForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

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
      toast.error('Failed to add note: ');
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
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
  );
}
