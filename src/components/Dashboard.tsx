import { useState } from 'react';
import { User } from 'firebase/auth';
import { Bookmark, Calendar, FileText} from 'lucide-react';
import ResourceForm from './ResourceForm';
import ResourceList from './ResourceList';
import NoteForm from './NoteForm';
import NoteList from './NoteList';
import DateForm from './DateForm';
import DateList from './DateList';

interface DashboardProps {
  user: User;
}

export default function Dashboard({}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('resources');

  const tabs = [
    { id: 'resources', label: 'Resources', icon: Bookmark },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'dates', label: 'Important Dates', icon: Calendar },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid lg:grid-cols-[350px,1fr] gap-8">
        <div>
          {activeTab === 'resources' && <ResourceForm />}
          {activeTab === 'notes' && <NoteForm />}
          {activeTab === 'dates' && <DateForm />}
        </div>
        <div>
          {activeTab === 'resources' && <ResourceList />}
          {activeTab === 'notes' && <NoteList />}
          {activeTab === 'dates' && <DateList />}
        </div>
      </div>
    </main>
  );
}