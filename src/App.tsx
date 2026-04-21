/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { 
  Music, 
  Plus, 
  Trash2, 
  Share2, 
  ExternalLink, 
  Search, 
  X, 
  Disc, 
  Mic2, 
  Tag,
  CheckCircle2,
  AlertCircle,
  Download,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  link: string;
  lyrics: string;
  addedAt: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install logic
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // Form state
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    genre: '',
    link: '',
    lyrics: ''
  });

  // Load songs from localStorage
  useEffect(() => {
    const savedSongs = localStorage.getItem('melodyvault_songs');
    if (savedSongs) {
      try {
        setSongs(JSON.parse(savedSongs));
      } catch (e) {
        console.error('Failed to parse songs', e);
      }
    }
  }, []);

  // Save songs to localStorage
  useEffect(() => {
    localStorage.setItem('melodyvault_songs', JSON.stringify(songs));
  }, [songs]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleAddSong = (e: FormEvent) => {
    e.preventDefault();
    if (!newSong.title || !newSong.artist) {
      addToast('Title and Artist are required', 'error');
      return;
    }

    const song: Song = {
      id: Math.random().toString(36).substring(2, 9),
      ...newSong,
      addedAt: Date.now()
    };

    setSongs(prev => [song, ...prev]);
    setNewSong({ title: '', artist: '', genre: '', link: '', lyrics: '' });
    setIsModalOpen(false);
    addToast('Song added to your collection');
  };

  const handleDeleteSong = (id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
    addToast('Song removed from collection');
  };

  const handleShareSong = (song: Song) => {
    const shareText = `Check out this song: ${song.title} by ${song.artist}${song.link ? ` - ${song.link}` : ''}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        addToast('Song details copied to clipboard!');
      }).catch(() => {
        addToast('Failed to copy. Try again.', 'error');
      });
    } else {
      addToast('Clipboard not supported', 'error');
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0c]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Music className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Bodo Christian Song</h1>
              {!isOnline && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-1 font-medium">
                  <WifiOff className="w-3 h-3" /> Offline Mode
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showInstallBtn && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-sm border border-white/10"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
            )}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search songs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-full md:w-64 backdrop-blur-sm"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats / Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Songs', value: songs.length, icon: Disc },
            { label: 'Artists', value: new Set(songs.map(s => s.artist)).size, icon: Mic2 },
            { label: 'Genres', value: new Set(songs.map(s => s.genre)).size, icon: Tag },
            { label: 'Latest', value: songs.length > 0 ? songs[0].title : 'None', icon: Music },
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</span>
              </div>
              <div className="text-xl font-semibold text-white truncate">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Song List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedSong(song)}
                  className="glass-panel p-5 rounded-2xl song-card-hover group relative overflow-hidden cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <Music className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleShareSong(song)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Send / Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSong(song.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white truncate">{song.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <Mic2 className="w-3 h-3" /> {song.artist}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {song.genre || 'Unknown'}
                    </span>
                    {song.link && (
                      <a 
                        href={song.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 text-xs font-medium"
                      >
                        Listen <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <Music className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Your collection is empty</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Start adding your favorite Bodo Christian songs to build your collection.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Add your first song
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Song Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Add New Song</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSong} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Song Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g. Bohemian Rhapsody"
                    value={newSong.title}
                    onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Artist</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Queen"
                    value={newSong.artist}
                    onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Genre</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rock"
                      value={newSong.genre}
                      onChange={(e) => setNewSong(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Link (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="Spotify/YouTube link"
                      value={newSong.link}
                      onChange={(e) => setNewSong(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Lyrics (Use Enter for paragraph breaks)</label>
                  <textarea 
                    placeholder="Write song lyrics here..."
                    value={newSong.lyrics}
                    onChange={(e) => setNewSong(prev => ({ ...prev, lyrics: e.target.value }))}
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none custom-scrollbar"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4"
                >
                  Save to Collection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lyrics View Modal */}
      <AnimatePresence>
        {selectedSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSong(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-3xl p-8 relative z-10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-white leading-tight">{selectedSong.title}</h2>
                  <p className="text-indigo-400 font-medium flex items-center gap-2 mt-1">
                    <Mic2 className="w-4 h-4" /> {selectedSong.artist}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSong(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
                {selectedSong.lyrics ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {selectedSong.lyrics}
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-500 italic">
                    No lyrics added for this song yet.
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  {selectedSong.genre || 'General'}
                </span>
                {selectedSong.link && (
                  <a 
                    href={selectedSong.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    Listen Now <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
