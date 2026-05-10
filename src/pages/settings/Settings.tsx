import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, token, setRole } = useAuth(); // Need to update user context if it supports it, setting role may be generic enough for now
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch current user details if any
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setName(data.user.name);
        setEmail(data.user.email);
        setBio(data.user.bio || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, bio })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        // If we had a setUser in AuthContext we'd call it here
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-slate-400">Manage your profile and security preferences.</p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Navigation / Tabs */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-5 h-5" />
            Profile Details
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-5 h-5" />
            Security & Password
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-[#0e1526] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
          
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Details</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Update your personal information associated with your account.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Bio (Optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500 resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Security & Password</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Update your password to keep your account secure.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Current Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-px w-full bg-gray-200 dark:bg-slate-800"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-[#0B1120] dark:border-slate-700 dark:text-white dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword || !currentPassword}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
