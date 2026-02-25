import React, { useState, useEffect, FormEvent } from 'react';

type Tab = 'read' | 'quiet' | 'grow' | 'soul' | 'profiles';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  role?: string;
}

interface JournalEntry {
  id: string;
  profileId: string;
  title: string;
  content: string;
  date: string;
  imageUrl?: string;
}

interface Habit {
  id: string;
  profileId: string;
  name: string;
  completedDates: string[];
}

interface Stats {
  profileId: string;
  cultivatedDays: number;
  momentsOfCalm: number;
  totalScore: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profiles');
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  
  // Local Storage State
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('journal_profiles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [allEntries, setAllEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal_all_entries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [allHabits, setAllHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('journal_all_habits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [allStats, setAllStats] = useState<Stats[]>(() => {
    const saved = localStorage.getItem('journal_all_stats');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to Local Storage
  useEffect(() => { localStorage.setItem('journal_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('journal_all_entries', JSON.stringify(allEntries)); }, [allEntries]);
  useEffect(() => { localStorage.setItem('journal_all_habits', JSON.stringify(allHabits)); }, [allHabits]);
  useEffect(() => { localStorage.setItem('journal_all_stats', JSON.stringify(allStats)); }, [allStats]);

  // Derived State for Current Profile
  const entries = allEntries.filter(e => e.profileId === currentProfile?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const habits = allHabits.filter(h => h.profileId === currentProfile?.id);
  const stats = allStats.find(s => s.profileId === currentProfile?.id) || { profileId: currentProfile?.id || '', cultivatedDays: 0, momentsOfCalm: 0, totalScore: 0 };

  const updateStats = (updater: (s: Stats) => Stats) => {
    if (!currentProfile) return;
    setAllStats(prev => {
      const existing = prev.find(s => s.profileId === currentProfile.id);
      if (existing) {
        return prev.map(s => s.profileId === currentProfile.id ? updater(s) : s);
      } else {
        return [...prev, updater({ profileId: currentProfile.id, cultivatedDays: 0, momentsOfCalm: 0, totalScore: 0 })];
      }
    });
  };

  const handleSelectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    setActiveTab('soul');
  };

  const handleCreateProfile = (name: string) => {
    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      avatar: `https://picsum.photos/seed/${name}/200`,
      role: 'forest wanderer',
      bio: ''
    };
    setProfiles([...profiles, newProfile]);
  };

  const handleDeleteProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this profile and all its data?')) {
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      setAllEntries(prev => prev.filter(e => e.profileId !== profileId));
      setAllHabits(prev => prev.filter(h => h.profileId !== profileId));
      setAllStats(prev => prev.filter(s => s.profileId !== profileId));
      if (currentProfile?.id === profileId) setCurrentProfile(null);
    }
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleUpdateProfile = () => {
    if (!currentProfile) return;
    const updated = { ...currentProfile, name: editName, bio: editBio, role: editRole };
    setProfiles(prev => prev.map(p => p.id === currentProfile.id ? updated : p));
    setCurrentProfile(updated);
    setIsEditingProfile(false);
  };

  const startEditing = () => {
    if (!currentProfile) return;
    setEditName(currentProfile.name);
    setEditBio(currentProfile.bio || '');
    setEditRole(currentProfile.role || 'forest wanderer');
    setIsEditingProfile(true);
  };

  // --- SOUL TAB ---
  const renderSoul = () => (
    <>
      <div className="relative px-8 pt-4 pb-12 flex flex-row items-start gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <div className="absolute inset-0 bg-sage/20 rounded-organic-1 rotate-6"></div>
          <div className="absolute inset-0 bg-earth/10 rounded-organic-2 -rotate-3"></div>
          <div 
            className="relative h-full w-full nature-silhouette bg-center bg-cover border-2 border-moss/10" 
            style={{ backgroundImage: `url("${currentProfile?.avatar}")` }}
          ></div>
        </div>
        <div className="flex flex-col pt-4 flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold font-handwritten text-earth leading-tight -rotate-1">{currentProfile?.name}</h2>
            <button onClick={startEditing} className="text-earth/40 hover:text-moss transition-colors">
              <span className="material-symbols-outlined text-xl">settings</span>
            </button>
          </div>
          <p className="text-sage font-medium text-lg leading-none mt-1">{currentProfile?.role}</p>
          <p className="text-earth/60 text-sm mt-2 font-informal italic">{currentProfile?.bio || 'No bio yet...'}</p>
          <div className="mt-4 flex gap-2">
            <span className="material-symbols-outlined text-earth/40">draw</span>
            <span className="material-symbols-outlined text-earth/40">filter_vintage</span>
          </div>
        </div>
      </div>

      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-cream w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-earth/10">
            <h3 className="text-2xl font-bold font-handwritten text-earth mb-6">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-earth/60 mb-1 block">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-white border border-earth/20 rounded-xl px-4 py-2 outline-none focus:border-sage text-moss" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth/60 mb-1 block">Role</label>
                <input type="text" value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full bg-white border border-earth/20 rounded-xl px-4 py-2 outline-none focus:border-sage text-moss" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-earth/60 mb-1 block">Bio</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="w-full bg-white border border-earth/20 rounded-xl px-4 py-2 outline-none focus:border-sage text-moss h-24 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 rounded-full font-bold text-earth/60 hover:bg-earth/5 transition-colors">Cancel</button>
              <button onClick={handleUpdateProfile} className="flex-1 py-2 bg-sage text-white rounded-full font-bold hover:bg-sage/90 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative px-8 mb-12">
        <div className="absolute top-0 right-12 w-24 h-24 bg-sage/5 rounded-full blur-2xl -z-10"></div>
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-2 bg-paper p-4 border border-earth/10 shadow-sm rotate-1 flex flex-col items-center">
            <span className="font-handwritten text-earth text-sm">Days</span>
            <span className="text-3xl font-bold text-moss">{stats.cultivatedDays}</span>
            <div className="w-full h-px bg-sage/20 my-1"></div>
            <span className="text-[10px] text-earth/60 uppercase tracking-widest">Growing</span>
          </div>
          <div className="col-span-2 bg-paper p-4 border border-earth/10 shadow-sm -rotate-2 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-moss">{stats.momentsOfCalm}</span>
            <span className="font-handwritten text-earth text-[10px] text-center leading-tight">Calm</span>
          </div>
          <div className="col-span-2 bg-paper p-4 border border-earth/10 shadow-sm rotate-3 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-sage">{stats.totalScore}</span>
            <span className="font-handwritten text-earth text-[10px] text-center leading-tight">Soul Score</span>
          </div>
        </div>
      </div>

      <div className="px-8 mb-32">
        <div className="flex items-end justify-between mb-8">
          <h3 className="text-2xl font-bold font-handwritten text-earth">Treasured Finds</h3>
          <button onClick={() => setActiveTab('read')} className="text-sage text-sm font-bold border-b border-sage/30 pb-1">See all notes</button>
        </div>
        
        <div className="relative h-96">
          {entries.length > 0 ? (
            entries.slice(0, 3).map((entry, idx) => {
              const rotations = ['-rotate-3', 'rotate-6', '-rotate-2'];
              const positions = ['top-0 left-0 w-64', 'top-16 right-0 w-56', 'bottom-0 left-8 w-60'];
              const shapes = ['rounded-organic-1', 'rounded-organic-2', 'rounded-organic-3'];
              return (
                <div key={entry.id} className={`absolute ${positions[idx]} p-2 bg-white shadow-md ${shapes[idx]} ${rotations[idx]} transition-transform hover:z-10 hover:scale-105`}>
                  <div className={`aspect-square ${shapes[idx]} bg-center bg-cover grayscale-[30%] sepia-[20%] opacity-90`} style={{ backgroundImage: `url("${entry.imageUrl || `https://picsum.photos/seed/${entry.id}/400`}")` }}></div>
                  <div className="p-3 text-center">
                    <h4 className="font-bold text-moss leading-tight truncate">{entry.title}</h4>
                    <p className="font-handwritten text-earth text-sm">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-earth/40 font-handwritten text-xl italic">No treasures yet...</div>
          )}
        </div>
      </div>
    </>
  );

  // --- READ TAB ---
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSaveEntry = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      profileId: currentProfile?.id || '',
      title: newTitle || 'Untitled Note',
      content: newContent,
      date: new Date().toISOString()
    };
    setAllEntries([entry, ...allEntries]);
    updateStats(s => ({ ...s, totalScore: s.totalScore + 100 }));
    setIsWriting(false);
    setNewTitle('');
    setNewContent('');
  };

  const renderRead = () => {
    if (isWriting) {
      return (
        <div className="px-8 pt-4 pb-32 flex flex-col h-full min-h-[70vh]">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setIsWriting(false)} className="text-earth/60 hover:text-moss"><span className="material-symbols-outlined">arrow_back</span></button>
            <button onClick={handleSaveEntry} className="bg-sage text-white px-4 py-1 rounded-full font-bold text-sm">Save</button>
          </div>
          <input type="text" placeholder="Title..." className="bg-transparent text-2xl font-bold font-handwritten text-moss outline-none mb-4 placeholder:text-earth/40" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <textarea placeholder="Write your thoughts..." className="bg-transparent flex-1 resize-none outline-none text-earth font-informal text-lg placeholder:text-earth/40 min-h-[50vh]" value={newContent} onChange={e => setNewContent(e.target.value)} />
        </div>
      );
    }
    return (
      <div className="px-8 pt-4 pb-32">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-handwritten text-earth">My Notes</h2>
          <button onClick={() => setIsWriting(true)} className="flex items-center justify-center w-10 h-10 bg-sage/20 text-moss rounded-full hover:bg-sage/30"><span className="material-symbols-outlined">edit</span></button>
        </div>
        <div className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <div className="text-center text-earth/60 mt-10 font-handwritten text-xl">No notes yet. Start writing...</div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="bg-paper p-5 rounded-organic-1 shadow-sm border border-earth/10">
                <h3 className="font-bold text-moss text-lg">{entry.title}</h3>
                <p className="text-xs text-earth/60 mb-2">{new Date(entry.date).toLocaleDateString()}</p>
                <p className="text-earth line-clamp-3">{entry.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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
      updateStats(s => ({ ...s, momentsOfCalm: s.momentsOfCalm + meditationTime, totalScore: s.totalScore + (meditationTime * 10) }));
      setMeditationTime(0);
    }
    setMeditationPhase('inhale');
  };

  const renderQuiet = () => (
    <div className="px-8 pt-12 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      <h2 className="text-3xl font-bold font-handwritten text-earth mb-12">Find Your Center</h2>
      <div className="relative w-64 h-64 flex items-center justify-center mb-16">
        <div className={`absolute inset-0 bg-sage/20 rounded-full transition-all duration-[4000ms] ease-in-out ${isMeditating ? (meditationPhase === 'inhale' ? 'scale-150 opacity-50' : meditationPhase === 'hold' ? 'scale-150 opacity-80' : 'scale-100 opacity-20') : 'scale-100 opacity-20'}`}></div>
        <div className="relative z-10 w-32 h-32 bg-paper rounded-full shadow-lg flex items-center justify-center border-4 border-sage/30">
          <span className="font-handwritten text-2xl text-moss">{!isMeditating ? 'Ready?' : meditationPhase === 'inhale' ? 'Breathe In' : meditationPhase === 'hold' ? 'Hold' : 'Breathe Out'}</span>
        </div>
      </div>
      {!isMeditating ? <button onClick={() => setIsMeditating(true)} className="bg-moss text-cream px-8 py-3 rounded-full font-bold tracking-wider shadow-md hover:bg-moss/90 transition-colors">START</button> : <button onClick={handleStopMeditation} className="bg-earth/20 text-moss px-8 py-3 rounded-full font-bold tracking-wider hover:bg-earth/30 transition-colors">FINISH</button>}
    </div>
  );

  // --- GROW TAB ---
  const toggleHabit = (habitId: string, dateStr: string) => {
    setAllHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const completed = h.completedDates.includes(dateStr);
        const scoreChange = completed ? -50 : 50;
        updateStats(s => ({ ...s, totalScore: s.totalScore + scoreChange }));
        return { ...h, completedDates: completed ? h.completedDates.filter(d => d !== dateStr) : [...h.completedDates, dateStr] };
      }
      return h;
    }));
  };

  const [newHabitName, setNewHabitName] = useState('');
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setAllHabits([...allHabits, { id: Date.now().toString(), profileId: currentProfile?.id || '', name: newHabitName, completedDates: [] }]);
    setNewHabitName('');
  };

  const renderGrow = () => {
    const today = new Date();
    const days = Array.from({length: 7}).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return (
      <div className="px-8 pt-4 pb-32">
        <h2 className="text-3xl font-bold font-handwritten text-earth mb-8">Cultivate Habits</h2>
        <div className="flex flex-col gap-6">
          {habits.map(habit => (
            <div key={habit.id} className="bg-paper p-4 rounded-organic-2 shadow-sm border border-earth/10">
              <h3 className="font-bold text-moss mb-3">{habit.name}</h3>
              <div className="flex justify-between items-center">
                {days.map(day => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <button onClick={() => toggleHabit(habit.id, day)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${habit.completedDates.includes(day) ? 'bg-sage text-white' : 'bg-earth/10 text-transparent hover:bg-earth/20'} ${day === today.toISOString().split('T')[0] ? 'ring-2 ring-sage/50 ring-offset-2 ring-offset-paper' : ''}`}><span className="material-symbols-outlined text-sm">check</span></button>
                    <span className="text-[10px] text-earth/60">{new Date(day).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddHabit} className="mt-8 flex gap-2">
          <input type="text" placeholder="Plant a new habit..." className="flex-1 bg-paper border border-earth/20 rounded-full px-4 py-2 outline-none focus:border-sage text-moss" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
          <button type="submit" className="w-10 h-10 bg-sage text-white rounded-full flex items-center justify-center hover:bg-sage/90"><span className="material-symbols-outlined">add</span></button>
        </form>
      </div>
    );
  };

  // --- PROFILES TAB ---
  const [newProfileName, setNewProfileName] = useState('');
  const renderProfiles = () => (
    <div className="px-8 pt-4 pb-32">
      <h2 className="text-3xl font-bold font-handwritten text-earth mb-8">Who is journaling?</h2>
      <div className="grid grid-cols-2 gap-6 mb-12">
        {profiles.map(p => (
          <div key={p.id} className="relative group">
            <button onClick={() => handleSelectProfile(p)} className="w-full flex flex-col items-center gap-3 p-4 bg-paper rounded-organic-1 border border-earth/10 shadow-sm hover:scale-105 transition-transform">
              <img src={p.avatar} className="w-20 h-20 rounded-full border-2 border-sage/30 object-cover" />
              <span className="font-bold text-moss">{p.name}</span>
            </button>
            <button onClick={(e) => handleDeleteProfile(e, p.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"><span className="material-symbols-outlined text-sm">delete</span></button>
          </div>
        ))}
      </div>
      <div className="bg-earth/5 p-6 rounded-organic-3 border border-earth/10">
        <h3 className="font-handwritten text-xl text-earth mb-4">Add a new soul</h3>
        <div className="flex gap-2">
          <input type="text" placeholder="Name..." className="flex-1 bg-white border border-earth/20 rounded-full px-4 py-2 outline-none focus:border-sage text-moss" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
          <button onClick={() => { if (newProfileName.trim()) { handleCreateProfile(newProfileName); setNewProfileName(''); } }} className="bg-sage text-white px-6 py-2 rounded-full font-bold hover:bg-sage/90">Add</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto">
      <header className="flex items-center justify-between p-8">
        <div className="scrapbook-tape px-4 py-1 text-earth font-handwritten text-xl">My Journal</div>
        <button onClick={() => { setCurrentProfile(null); setActiveTab('profiles'); }} className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 text-moss hover:bg-sage/20 transition-all"><span className="material-symbols-outlined text-2xl">group</span></button>
      </header>
      <main className="flex-1">
        {activeTab === 'profiles' && renderProfiles()}
        {currentProfile && (
          <>
            {activeTab === 'soul' && renderSoul()}
            {activeTab === 'read' && renderRead()}
            {activeTab === 'quiet' && renderQuiet()}
            {activeTab === 'grow' && renderGrow()}
          </>
        )}
      </main>
      {currentProfile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6">
          <div className="flex gap-4 bg-paper/90 backdrop-blur-md px-6 py-3 rounded-full border border-earth/10 shadow-xl">
            <button onClick={() => setActiveTab('read')} className={`flex flex-col items-center justify-center transition-colors ${activeTab === 'read' ? 'text-moss' : 'text-earth/50 hover:text-sage'}`}><span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'read' ? "'FILL' 1" : "'FILL' 0" }}>auto_stories</span><p className="text-[10px] uppercase font-bold tracking-tighter">Read</p></button>
            <button onClick={() => setActiveTab('quiet')} className={`flex flex-col items-center justify-center transition-colors ${activeTab === 'quiet' ? 'text-moss' : 'text-earth/50 hover:text-sage'}`}><span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'quiet' ? "'FILL' 1" : "'FILL' 0" }}>dark_mode</span><p className="text-[10px] uppercase font-bold tracking-tighter">Quiet</p></button>
            <button onClick={() => setActiveTab('grow')} className={`flex flex-col items-center justify-center transition-colors ${activeTab === 'grow' ? 'text-moss' : 'text-earth/50 hover:text-sage'}`}><span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'grow' ? "'FILL' 1" : "'FILL' 0" }}>potted_plant</span><p className="text-[10px] uppercase font-bold tracking-tighter">Grow</p></button>
            <button onClick={() => setActiveTab('soul')} className={`flex flex-col items-center justify-center transition-colors ${activeTab === 'soul' ? 'text-moss' : 'text-earth/50 hover:text-sage'}`}><span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'soul' ? "'FILL' 1" : "'FILL' 0" }}>face_6</span><p className="text-[10px] uppercase font-bold tracking-tighter">Soul</p></button>
          </div>
        </nav>
      )}
    </div>
  );
}
