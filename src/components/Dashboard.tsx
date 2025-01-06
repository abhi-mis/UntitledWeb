import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Bookmark, Calendar, FileText, Layout, CheckCircle, ChevronRight, Book, Link } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Resources from './Resources';
import Notes from './Notes';
import DateManager from './Dates';
import TaskManager from './TaskManager';
import Links from './Links';

interface DashboardProps {
  user: User;
}

interface Stats {
  totalResources: number;
  totalNotes: number;
  upcomingDates: number;
  completedTasks: number;
  totalLinks: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('resources');
  const [stats, setStats] = useState<Stats>({
    totalResources: 0,
    totalNotes: 0,
    upcomingDates: 0,
    completedTasks: 0,
    totalLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'resources', label: 'Resources', icon: Bookmark, color: 'blue' },
    { id: 'notes', label: 'Notes', icon: FileText, color: 'emerald' },
    { id: 'dates', label: 'Important Dates', icon: Calendar, color: 'violet' },
    { id: 'tasks', label: 'Tasks', icon: Book, color: 'red' },
    { id: 'links', label: 'Important Links', icon: Link, color: 'yellow' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const unsubscribeResources = onSnapshot(
        query(collection(db, 'resources')),
        (snapshot) => {
          setStats((prev) => ({ ...prev, totalResources: snapshot.size }));
        }
      );

      const unsubscribeNotes = onSnapshot(
        query(collection(db, 'notes'), where('userId', '==', user.uid)),
        (snapshot) => {
          setStats((prev) => ({ ...prev, totalNotes: snapshot.size }));
        }
      );

      const unsubscribeDates = onSnapshot(
        query(collection(db, 'important-dates'), where('userId', '==', user.uid)),
        (snapshot) => {
          const upcomingDates = snapshot.docs.filter((doc) => {
            const date = new Date(doc.data().date);
            return date >= new Date();
          }).length;
          setStats((prev) => ({ ...prev, upcomingDates }));
        }
      );

      const unsubscribeTasks = onSnapshot(
        query(collection(db, 'tasks'), where('userId', '==', user.uid), where('completed', '==', true)),
        (snapshot) => {
          setStats((prev) => ({ ...prev, completedTasks: snapshot.size }));
        }
      );

      const unsubscribeLinks = onSnapshot(
        query(collection(db, 'links'), where('userId', '==', user.uid)),
        (snapshot) => {
          setStats((prev) => ({ ...prev, totalLinks: snapshot.size }));
        }
      );

      setLoading(false);

      return () => {
        unsubscribeResources();
        unsubscribeNotes();
        unsubscribeDates();
        unsubscribeTasks();
        unsubscribeLinks();
      };
    };

    fetchStats();
  }, [user.uid]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200">
          <div className="p-2 bg-blue-100 rounded-lg">
           
          </div>
          <h1 className="text-xl font-semibold text-gray-900">UntitledWeb</h1>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
              alt={user.email || ''}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium text-gray-900">{user.displayName || user.email}</div>
              <div className="text-sm text-gray-500">Welcome back!</div>
            </div>
          </div>
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out group
                  ${
                    activeTab === id
                      ? `bg-${color}-100 text-${color}-700 shadow-md`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${activeTab === id ? `text-${color}-600` : 'text-gray-400 group-hover:text-gray-600'}`} />
                {label}
                <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${activeTab === id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-72">
        <div className="max-w-8xl mx-auto p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[
              { label: 'Total Resources', value: stats.totalResources, icon: Bookmark, color: 'blue' },
              { label: 'Notes Created', value: stats.totalNotes, icon: FileText, color: 'emerald' },
              { label: 'Upcoming Dates', value: stats.upcomingDates, icon: Calendar, color: 'violet' },
              { label: 'Completed Tasks', value: stats.completedTasks, icon: CheckCircle, color: 'amber' },
              { label: 'Total Links', value: stats.totalLinks, icon: Link, color: 'yellow' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</h2>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="col-span-12">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                {activeTab === 'resources' && <Resources />}
                {activeTab === 'notes' && <Notes />}
                {activeTab === 'dates' && <DateManager />}
                {activeTab === 'tasks' && <TaskManager />}
                {activeTab === 'links' && <Links />}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}