import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'read' | 'quiet' | 'grow' | 'soul';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
}

interface Profile {
  name: string;
  avatar: string;
  bio: string;
  role: string;
}

interface Stats {
  cultivatedDays: number;
  momentsOfCalm: number;
  totalScore: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('soul');
  
  // Single Profile State
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('witty_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Wanderer',
      avatar: 'https://picsum.photos/seed/witty/400',
      bio: 'Exploring the quiet corners of the mind.',
      role: 'Mindful Explorer'
    };
  });
  
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('witty_entries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('witty_habits');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Morning Sunlight', completedDates: [] },
      { id: '2', name: 'Deep Breathing', completedDates: [] }
    ];
  });
  
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('witty_stats');
    return saved ? JSON.parse(saved) : { cultivatedDays: 0, momentsOfCalm: 0, totalScore: 0 };
  });

  // Sync to Local Storage
  useEffect(() => { localStorage.setItem('witty_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('witty_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('witty_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('witty_stats', JSON.stringify(stats)); }, [stats]);

  // Weekly Reset Logic
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const mondayIso = monday.toISOString().split('T')[0];

    const lastReset = localStorage.getItem('witty_last_reset');
    if (lastReset !== mondayIso) {
      setHabits(prev => prev.map(h => ({ ...h, completedDates: [] })));
      localStorage.setItem('witty_last_reset', mondayIso);
    }
  }, []);

  const updateScore = (points: number) => {
    setStats(prev => ({ ...prev, totalScore: prev.totalScore + points }));
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editRole, setEditRole] = useState(profile.role);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  const handleUpdateProfile = () => {
    setProfile({ name: editName, bio: editBio, role: editRole, avatar: editAvatar });
    setIsEditingProfile(false);
  };

  // --- SOUL TAB ---
  const renderSoul = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      <div className="relative px-6 pt-4 pb-8 flex flex-col items-center text-center">
        <div className="relative w-36 h-36 mb-4 group">
          <div className="absolute inset-0 bg-sage/20 rounded-leaf-1 rotate-12 animate-pulse"></div>
          <div className="absolute inset-0 bg-earth/10 rounded-leaf-2 -rotate-6"></div>
          <div 
            className="relative h-full w-full rounded-leaf-1 bg-center bg-cover border-4 border-white shadow-lg overflow-hidden" 
            style={{ backgroundImage: `url("${profile.avatar}")` }}
          >
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <span className="material-symbols-outlined text-3xl">edit</span>
            </button>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold font-handwritten text-earth mb-0.5">{profile.name}</h2>
        <p className="text-sage font-semibold uppercase tracking-widest text-[10px] mb-2">{profile.role}</p>
        <p className="text-earth/70 font-informal italic max-w-[240px] leading-snug text-sm">{profile.bio}</p>
      </div>

      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white p-3 rounded-leaf-1 shadow-sm border border-earth/5 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-moss">{stats.cultivatedDays}</span>
            <span className="text-[8px] uppercase tracking-tighter text-earth/40 font-bold">Days</span>
          </div>
          <div className="bg-white p-3 rounded-leaf-2 shadow-sm border border-earth/5 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-moss">{stats.momentsOfCalm}</span>
            <span className="text-[8px] uppercase tracking-tighter text-earth/40 font-bold">Calms</span>
          </div>
          <div className="bg-moss p-3 rounded-leaf-1 shadow-md flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-cream">{stats.totalScore}</span>
            <span className="text-[8px] uppercase tracking-tighter text-cream/60 font-bold">Score</span>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-handwritten text-earth">Treasured Finds</h3>
          <button onClick={() => setActiveTab('read')} className="text-sage text-xs font-bold">View All</button>
        </div>
        
        <div className="relative h-[320px]">
          {entries.length > 0 ? (
            entries.slice(0, 3).map((entry, idx) => {
              const rotations = ['-rotate-3', 'rotate-6', '-rotate-2'];
              const positions = ['top-0 left-0 w-56', 'top-16 right-0 w-48', 'bottom-0 left-4 w-52'];
              const shapes = ['rounded-leaf-1', 'rounded-leaf-2', 'rounded-leaf-1'];
              return (
                <motion.div 
                  key={entry.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleOpenEntry(entry)}
                  className={`absolute ${positions[idx]} p-1.5 bg-white shadow-lg ${shapes[idx]} ${rotations[idx]} transition-transform hover:z-10 hover:rotate-0 active:scale-95 cursor-pointer`}
                >
                  <div className={`aspect-square ${shapes[idx]} bg-center bg-cover grayscale-[20%] sepia-[10%]`} style={{ backgroundImage: `url("${entry.imageUrl || `https://picsum.photos/seed/${entry.id}/400`}")` }}></div>
                  <div className="p-2 text-center">
                    <h4 className="font-bold text-moss text-[10px] truncate">{entry.title}</h4>
                    <p className="font-handwritten text-earth/60 text-[8px]">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-earth/30 font-handwritten text-lg italic text-center p-8">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-20">auto_stories</span>
              Your memories will appear here.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // --- READ TAB ---
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSaveEntry = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    
    if (editingEntryId) {
      setEntries(prev => prev.map(entry => 
        entry.id === editingEntryId 
          ? { ...entry, title: newTitle || 'Untitled Reflection', content: newContent }
          : entry
      ));
    } else {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        title: newTitle || 'Untitled Reflection',
        content: newContent,
        date: new Date().toISOString()
      };
      setEntries([entry, ...entries]);
      updateScore(100);
    }
    
    setIsWriting(false);
    setEditingEntryId(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleOpenEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setNewTitle(entry.title);
    setNewContent(entry.content);
    setIsWriting(true);
    setActiveTab('read');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setIsWriting(false);
    setEditingEntryId(null);
    setNewTitle('');
    setNewContent('');
  };

  const renderRead = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 pt-2 pb-24"
    >
      <AnimatePresence mode="wait">
        {isWriting ? (
          <motion.div 
            key="editor"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex flex-col h-full min-h-[60vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => {
                  setIsWriting(false);
                  setEditingEntryId(null);
                  setNewTitle('');
                  setNewContent('');
                }} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-earth/5 text-earth/60"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <div className="flex gap-2">
                {editingEntryId && (
                  <button 
                    onClick={() => handleDeleteEntry(editingEntryId)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
                <button onClick={handleSaveEntry} className="bg-moss text-white px-5 py-1.5 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform">
                  {editingEntryId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Title..." 
              className="bg-transparent text-2xl font-bold font-handwritten text-moss outline-none mb-4 placeholder:text-earth/20"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea 
              placeholder="What's on your mind?" 
              className="bg-transparent flex-1 resize-none outline-none text-earth font-informal text-lg leading-relaxed placeholder:text-earth/20 min-h-[40vh]"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold font-handwritten text-earth">Reflections</h2>
                <p className="text-sage text-[10px] font-bold uppercase tracking-widest">Capture your thoughts</p>
              </div>
              <button 
                onClick={() => {
                  setIsWriting(true);
                  setEditingEntryId(null);
                  setNewTitle('');
                  setNewContent('');
                }} 
                className="flex items-center justify-center w-12 h-12 bg-moss text-white rounded-leaf-1 shadow-lg hover:rotate-3 transition-transform active:scale-90"
              >
                <span className="material-symbols-outlined text-2xl">edit_note</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {entries.length === 0 ? (
                <div className="text-center py-16 bg-paper/50 rounded-leaf-1 border-2 border-dashed border-earth/10">
                  <p className="font-handwritten text-xl text-earth/30">The page is waiting...</p>
                </div>
              ) : (
                entries.map((entry, idx) => (
                  <motion.div 
                    key={entry.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOpenEntry(entry)}
                    className="bg-white p-5 rounded-leaf-1 shadow-sm border border-earth/5 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-moss text-lg leading-tight">{entry.title}</h3>
                      <span className="text-[8px] font-bold text-earth/30 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-earth/70 line-clamp-2 font-informal text-sm leading-relaxed">{entry.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // --- QUIET TAB ---
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationPhase, setMeditationPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [meditationTime, setMeditationTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating) {
      interval = setInterval(() => {
        setMeditationTime(t => t + 1);
        setMeditationPhase(prev => prev === 'inhale' ? 'hold' : prev === 'hold' ? 'exhale' : 'inhale');
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isMeditating]);

  const handleStopMeditation = () => {
    setIsMeditating(false);
    if (meditationTime > 0) {
      setStats(prev => ({ 
        ...prev, 
        momentsOfCalm: prev.momentsOfCalm + meditationTime,
        totalScore: prev.totalScore + (meditationTime * 10)
      }));
      setMeditationTime(0);
    }
    setMeditationPhase('inhale');
  };

  const renderQuiet = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 pt-8 pb-24 flex flex-col items-center justify-center min-h-[60vh]"
    >
      <h2 className="text-3xl font-bold font-handwritten text-earth mb-1">Quiet Time</h2>
      <p className="text-sage text-[10px] font-bold uppercase tracking-widest mb-12">Find your rhythm</p>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-16">
        <motion.div 
          animate={isMeditating ? {
            scale: meditationPhase === 'inhale' ? 1.5 : meditationPhase === 'hold' ? 1.5 : 1,
            opacity: meditationPhase === 'inhale' ? 0.4 : meditationPhase === 'hold' ? 0.6 : 0.2
          } : { scale: 1, opacity: 0.1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-sage rounded-full"
        ></motion.div>
        
        <div className="relative z-10 w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-sage/10">
          <AnimatePresence mode="wait">
            <motion.span 
              key={meditationPhase + isMeditating}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="font-handwritten text-xl text-moss text-center px-4"
            >
              {!isMeditating ? 'Ready?' : meditationPhase === 'inhale' ? 'Breathe In' : meditationPhase === 'hold' ? 'Hold' : 'Breathe Out'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {!isMeditating ? (
        <button 
          onClick={() => setIsMeditating(true)} 
          className="bg-moss text-cream px-10 py-3 rounded-full font-bold tracking-widest shadow-lg active:scale-95 transition-transform"
        >
          BEGIN
        </button>
      ) : (
        <button 
          onClick={handleStopMeditation} 
          className="bg-earth/10 text-moss px-10 py-3 rounded-full font-bold tracking-widest active:scale-95 transition-transform"
        >
          FINISH
        </button>
      )}
    </motion.div>
  );

  // --- GROW TAB ---
  const toggleHabit = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const completed = h.completedDates.includes(dateStr);
        updateScore(completed ? -50 : 50);
        return { ...h, completedDates: completed ? h.completedDates.filter(d => d !== dateStr) : [...h.completedDates, dateStr] };
      }
      return h;
    }));
  };

  const [newHabitName, setNewHabitName] = useState('');
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setHabits([...habits, { id: Date.now().toString(), name: newHabitName, completedDates: [] }]);
    setNewHabitName('');
  };

  const renderGrow = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    
    const days = Array.from({length: 7}).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 pt-2 pb-24"
      >
        <h2 className="text-3xl font-bold font-handwritten text-earth mb-1">Cultivate</h2>
        <p className="text-sage text-[10px] font-bold uppercase tracking-widest mb-8">Nurture your daily habits</p>
        
        <div className="flex flex-col gap-4">
          {habits.map(habit => (
            <motion.div 
              layout
              key={habit.id} 
              className="bg-white p-5 rounded-leaf-1 shadow-sm border border-earth/5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-moss text-base">{habit.name}</h3>
                <span className="text-[8px] font-bold text-earth/30 uppercase tracking-widest">7 Days</span>
              </div>
              <div className="flex justify-between items-center">
                {days.map(day => {
                  const isCompleted = habit.completedDates.includes(day);
                  const isToday = day === today.toISOString().split('T')[0];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <button 
                        onClick={() => toggleHabit(habit.id, day)} 
                        className={`w-8 h-8 rounded-leaf-1 flex items-center justify-center transition-all active:scale-90 ${
                          isCompleted ? 'bg-sage text-white shadow-md' : 'bg-earth/5 text-transparent hover:bg-earth/10'
                        } ${isToday ? 'ring-2 ring-sage ring-offset-2 ring-offset-white' : ''}`}
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                      </button>
                      <span className="text-[8px] font-bold text-earth/40">{new Date(day).toLocaleDateString('en-US', {weekday: 'short'})[0]}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <form onSubmit={handleAddHabit} className="mt-8 flex gap-2">
          <input 
            type="text" 
            placeholder="What to grow?" 
            className="flex-1 bg-white border border-earth/10 rounded-leaf-1 px-4 py-3 outline-none focus:border-sage text-moss shadow-sm text-sm"
            value={newHabitName}
            onChange={e => setNewHabitName(e.target.value)}
          />
          <button type="submit" className="w-12 h-12 bg-moss text-white rounded-leaf-1 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-cream selection:bg-sage/30 no-scrollbar touch-pan-y">
      <header className="flex items-center justify-between px-6 pt-8 pb-2 sticky top-0 bg-cream/80 backdrop-blur-md z-[60]">
        <div className="flex items-center gap-2">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-moss rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-md"
          ></motion.div>
          <h1 className="text-2xl font-bold font-handwritten text-earth tracking-tight">Witty</h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-bold text-earth/40 uppercase tracking-widest">Soul Score</span>
          <span className="text-base font-bold text-moss leading-none">{stats.totalScore}</span>
        </div>
      </header>

      <main className="flex-1 no-scrollbar pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'soul' && renderSoul()}
            {activeTab === 'read' && renderRead()}
            {activeTab === 'quiet' && renderQuiet()}
            {activeTab === 'grow' && renderGrow()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-6">
        <div className="flex w-full max-w-[280px] justify-between items-center bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-earth/5">
          <button 
            onClick={() => setActiveTab('read')} 
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeTab === 'read' ? 'text-moss' : 'text-earth/40'}`}
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'read' ? "'FILL' 1" : "'FILL' 0" }}>auto_stories</span>
            <p className="text-[9px] uppercase font-bold tracking-widest">Read</p>
          </button>
          <button 
            onClick={() => setActiveTab('quiet')} 
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeTab === 'quiet' ? 'text-moss' : 'text-earth/40'}`}
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'quiet' ? "'FILL' 1" : "'FILL' 0" }}>dark_mode</span>
            <p className="text-[9px] uppercase font-bold tracking-widest">Quiet</p>
          </button>
          <button 
            onClick={() => setActiveTab('grow')} 
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeTab === 'grow' ? 'text-moss' : 'text-earth/40'}`}
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'grow' ? "'FILL' 1" : "'FILL' 0" }}>potted_plant</span>
            <p className="text-[9px] uppercase font-bold tracking-widest">Grow</p>
          </button>
          <button 
            onClick={() => setActiveTab('soul')} 
            className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${activeTab === 'soul' ? 'text-moss' : 'text-earth/40'}`}
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: activeTab === 'soul' ? "'FILL' 1" : "'FILL' 0" }}>face_6</span>
            <p className="text-[9px] uppercase font-bold tracking-widest">Soul</p>
          </button>
        </div>
      </nav>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-cream w-full max-w-sm rounded-leaf-1 p-6 shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold font-handwritten text-earth">Your Persona</h3>
                <button onClick={() => setIsEditingProfile(false)} className="text-earth/40 hover:text-moss">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center mb-2">
                  <div className="relative w-20 h-20 mb-1">
                    <img src={editAvatar} className="w-full h-full rounded-leaf-1 border-4 border-white shadow-lg object-cover" />
                    <button 
                      onClick={() => setEditAvatar(`https://picsum.photos/seed/${Math.random()}/400`)}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-moss text-cream rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="material-symbols-outlined text-xs">refresh</span>
                    </button>
                  </div>
                  <span className="text-[8px] font-bold text-earth/40 uppercase tracking-widest">Shuffle Avatar</span>
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-widest text-earth/40 font-bold mb-1 block ml-2">Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white border border-earth/5 rounded-leaf-1 px-4 py-2.5 outline-none focus:border-sage text-moss shadow-sm text-sm"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-widest text-earth/40 font-bold mb-1 block ml-2">Role</label>
                  <input 
                    type="text" 
                    value={editRole} 
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full bg-white border border-earth/5 rounded-leaf-1 px-4 py-2.5 outline-none focus:border-sage text-moss shadow-sm text-sm"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-widest text-earth/40 font-bold mb-1 block ml-2">Bio</label>
                  <textarea 
                    value={editBio} 
                    onChange={e => setEditBio(e.target.value)}
                    className="w-full bg-white border border-earth/5 rounded-leaf-1 px-4 py-2.5 outline-none focus:border-sage text-moss h-20 resize-none shadow-sm text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-3 rounded-leaf-1 font-bold text-earth/40 hover:bg-earth/5 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className="flex-1 py-3 bg-moss text-cream rounded-leaf-1 font-bold shadow-lg active:scale-95 transition-transform text-sm"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

