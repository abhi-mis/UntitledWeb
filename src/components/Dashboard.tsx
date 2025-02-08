import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  Bookmark, Calendar, FileText, CheckCircle, ChevronRight, 
  Book, Link, X, Send, Bot, Sparkles,
  Pen
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Resources from './Resources';
import Notes from './Notes';
import DateManager from './Dates';
import TaskManager from './TaskManager';
import Links from './Links';
import Canva from './Canva';
import { generateChatResponse } from '../store/openai';

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

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('resources');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stats>({
    totalResources: 0,
    totalNotes: 0,
    upcomingDates: 0,
    completedTasks: 0,
    totalLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  // Initial welcome message from Nik
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        content: "Hi! I'm Nik, your Doubt solver. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, []);

  const tabs = [
    { id: 'resources', label: 'Resources', icon: Bookmark, color: 'blue' },
    { id: 'notes', label: 'Notes', icon: FileText, color: 'emerald' },
    { id: 'dates', label: 'Important Dates', icon: Calendar, color: 'violet' },
    { id: 'tasks', label: 'Tasks', icon: Book, color: 'red' },
    { id: 'links', label: 'Important Links', icon: Link, color: 'yellow' },
    { id: 'canva', label: 'WhiteBoard', icon: Pen, color: 'green' },
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      content: message,
      isUser: true,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(message);
      const botMessage: Message = {
        content: response || "I apologize, but I couldn't process that request.",
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        content: "I'm having trouble connecting to my AI services right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's first name for welcome message
  const firstName = user.displayName?.split(' ')[0] || 'there';

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 shadow-lg z-50">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <Sparkles className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">Untitled</h1>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-xl">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`}
              alt={user.displayName || 'User avatar'}
              className="w-12 h-12 rounded-full ring-2 ring-blue-500 ring-offset-2"
            />
            <div>
              <div className="font-semibold text-gray-900">{user.displayName || 'User'}</div>
              <div className="text-sm text-blue-600 font-medium">Welcome back, {firstName}!</div>
            </div>
          </div>
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl
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
      <main className="flex-1 ml-72 min-h-screen overflow-auto">
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
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-16 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</h2>
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
            <div className="col-span-12">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 ">
                {activeTab === 'resources' && <Resources />}
                {activeTab === 'notes' && <Notes />}
                {activeTab === 'dates' && <DateManager />}
                {activeTab === 'tasks' && <TaskManager />}
                {activeTab === 'links' && <Links />}
                {activeTab === 'canva' && <Canva />}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Nik The AI Bot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
        {isChatOpen && (
          <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-blue-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-3">
              <Bot className="h-6 w-6 text-white" />
              <h3 className="text-lg font-bold text-white">Nik The AI Bot</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="ml-auto p-1 hover:bg-blue-400 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-white shadow-md text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="bg-white shadow-md p-3 rounded-xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask Nik anything..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
        >
          {isChatOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <Bot className="h-6 w-6" />
              <span className="font-medium">Chat with Nik</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}