import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  userId: string;
  userEmail: string;
}

export default function NoteList() {
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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note: ');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Shared Notes</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading notes...</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {note.title}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={16} className="mr-1" />
                    {note.createdAt.toDate().toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                Shared by: {note.userEmail}
              </div>
            </div>
          ))}
          {notes.length === 0 && !loading && (
            <p className="text-center text-gray-500">No notes shared yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
