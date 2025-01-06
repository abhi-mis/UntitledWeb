import { useState } from 'react';
import { User } from 'firebase/auth';
import { Bookmark, Calendar, FileText, Layout } from 'lucide-react';
import Resources from './Resources';
import Notes from './Notes';
import DateManager from './Dates';

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
          <Layout className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-150 ease-in-out
                ${
                  activeTab === id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {activeTab === 'resources' && <Resources />}
                {activeTab === 'notes' && <Notes />}
                {activeTab === 'dates' && <DateManager />}
              </div>
            </div>

            {/* Side Panel */}
            <div className="col-span-4 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Resources', value: '24' },
                    { label: 'Notes Created', value: '12' },
                    { label: 'Upcoming Dates', value: '5' },
                    { label: 'Completed Tasks', value: '18' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    'Added new resource: "React Best Practices"',
                    'Created note: "Meeting Minutes"',
                    'Set reminder for "Project Deadline"',
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}