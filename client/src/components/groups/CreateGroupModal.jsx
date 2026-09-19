import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  AlertCircle,
  PlusCircle,
  UserCheck,
  Upload,
  Loader2,
  Search,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { LazyImage } from '../ui/LazyImage';
import { userService, uploadService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const PRESET_GROUPS = [
  { name: 'Pokhara Vacation', desc: 'Hotel, food, boating & sightseeing' },
  { name: 'Apartment Roommates', desc: 'Monthly rent, groceries, electricity & wifi' },
  { name: 'BCA Final Year Project', desc: 'Hardware, server hosting & documentation' },
  { name: 'Hiking & Trekking', desc: 'Permits, guide fees, tea houses & transport' },
];

const COVER_PRESETS = [
  {
    label: 'Phewa Lake',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Roommates',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Campus',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Himalayas',
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Office',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  },
];

function MemberPanel({ user, selectedUsers, onToggle }) {
  const [emailQuery, setEmailQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [hasSuggestRun, setHasSuggestRun] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const selectedIds = selectedUsers.map((u) => u.id || u._id);

  const loadSuggestions = useCallback(async () => {
    const lastName = (user?.name || '').trim().split(' ').slice(-1)[0];
    if (!lastName || lastName.length < 2) {
      setHasSuggestRun(true);
      return;
    }
    setIsSuggesting(true);
    try {
      const res = await userService.search(lastName);
      const users = res?.data?.users || [];
      const currentId = (user?._id || user?.id || '').toString();
      setSuggestedUsers(users.filter((u) => (u.id || u._id)?.toString() !== currentId));
    } catch {
      setSuggestedUsers([]);
    } finally {
      setIsSuggesting(false);
      setHasSuggestRun(true);
    }
  }, [user]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const runSearch = useCallback(
    async (q) => {
      setIsSearching(true);
      try {
        const res = await userService.search(q.trim());
        const users = res?.data?.users || [];
        const currentId = (user?._id || user?.id || '').toString();
        setSearchResults(users.filter((u) => (u.id || u._id)?.toString() !== currentId));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [user]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (emailQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(emailQuery), 300);
    } else {
      setSearchResults([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [emailQuery, runSearch]);

  const isQueryActive = emailQuery.trim().length >= 2;
  const displayList = isQueryActive ? searchResults : suggestedUsers;
  const isLoading = isQueryActive ? isSearching : isSuggesting;

  const totalCount = selectedUsers.length + 1;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Add Members
          </label>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
            {totalCount} total including you
          </span>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            {selectedUsers.map((u) => {
              const uid = u.id || u._id;
              return (
                <div
                  key={uid}
                  className="flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                >
                  <Avatar name={u.name || u.email} size="xs" />
                  <span className="max-w-[80px] truncate">{(u.name || u.email).split(' ')[0]}</span>
                  <button
                    type="button"
                    onClick={() => onToggle(u)}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
            placeholder="Enter email address to search..."
            className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
          />
          {emailQuery && (
            <button
              type="button"
              onClick={() => {
                setEmailQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isQueryActive ? 'Searching...' : 'Loading suggestions...'}
          </div>
        )}

        {!isLoading && !isQueryActive && hasSuggestRun && suggestedUsers.length === 0 && (
          <div className="py-6 text-center">
            <Users className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No relatable members found.
              <br />
              Enter an email address above to add a member.
            </p>
          </div>
        )}

        {!isLoading && isQueryActive && searchResults.length === 0 && (
          <div className="py-6 text-center text-[11px] text-slate-400">
            No users found for &ldquo;{emailQuery}&rdquo;
          </div>
        )}

        {!isLoading && displayList.length > 0 && (
          <>
            {!isQueryActive && (
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 px-1 pb-1">
                Suggested — same surname
              </div>
            )}
            {displayList.map((u) => {
              const uid = (u.id || u._id || '').toString();
              const isSelected = selectedIds.includes(uid);
              return (
                <button
                  key={uid}
                  type="button"
                  onClick={() => onToggle(u)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={u.name || u.email} size="xs" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {u.name || 'Unknown'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setImageUrl('');
      setSelectedUsers([]);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setError('');
    try {
      const uploadRes = await uploadService.uploadFile(file, 'settlex/groups');
      const url = uploadRes?.data?.url;
      if (url) setImageUrl(url);
    } catch {
      setError('Image upload failed. Select a preset cover instead.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const toggleUser = (u) => {
    const uid = (u.id || u._id || '').toString();
    setSelectedUsers((prev) => {
      const exists = prev.some((p) => (p.id || p._id)?.toString() === uid);
      return exists ? prev.filter((p) => (p.id || p._id)?.toString() !== uid) : [...prev, u];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      toast.warning('Demo Mode Active', 'Please log in to create groups. Modifications are disabled in demo preview mode.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide a name for your group.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await groupService.create({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        members: selectedUsers.map((u) => u.id || u._id),
      });
      onGroupCreated?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in fade-in zoom-in-95 duration-150 flex overflow-hidden"
        style={{ maxHeight: 'min(90vh, 600px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <form onSubmit={handleSubmit} className="flex w-full min-h-0">
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Create New Group
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Start a shared expense circle with friends or colleagues.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Group Name
                </label>
                <Input
                  id="group-name-input"
                  type="text"
                  placeholder="e.g. Pokhara Weekend Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  prefixIcon={Users}
                  required
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {PRESET_GROUPS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setName(preset.name);
                        setDescription(preset.desc);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Cover Image
                </label>
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <LazyImage src={imageUrl} alt="Cover" aspectRatio="aspect-[21/9]" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md cursor-pointer hover:bg-slate-900"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400">Presets:</span>
                      {COVER_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setImageUrl(p.url)}
                          className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  id="group-desc-input"
                  rows={2}
                  placeholder="What is this group for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-auto px-5 pb-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                icon={PlusCircle}
              >
                Create Group
              </Button>
            </div>
          </div>

          <div className="w-64 sm:w-72 shrink-0 flex flex-col p-4 bg-slate-50/60 dark:bg-slate-950/40 min-h-0 overflow-hidden">
            <MemberPanel user={user} selectedUsers={selectedUsers} onToggle={toggleUser} />
          </div>
        </form>
      </div>
    </div>
  );
}
