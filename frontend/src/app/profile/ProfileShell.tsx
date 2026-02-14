'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  changePassword,
  updateProfile,
  changeProfilePicture,
  getUserDetails,
} from '@/services/userService';
import {
  getSavedMemes,
  getLikedMemes,
  getCreatedMemesByUsername,
} from '@/services/memeService';
import {
  getSavedTemplates,
  getAllUserTemplates,
} from '@/services/templateService';
import { LikedMemesSection } from './components/LikedMemesSection';
import { SavedMemesSection } from './components/SavedMemesSection';
import { SavedTemplatesSection } from './components/SavedTemplatesSection';
import { UserTemplatesSection } from './components/UserTemplatesSection';
import { CreatedMemesSection } from './components/CreatedMemesSection';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  Mail,
  AlertTriangle,
  Trash2,
  Loader2,
  Sparkles,
  Lock,
  User as UserIcon,
  Settings,
  Image as ImageIcon,
  Heart,
  Bookmark,
  Grid3X3,
  Shield,
  Search,
  Edit2,
} from 'lucide-react';

type ProfileShellMode = 'self' | 'public';

interface ProfileShellProps {
  mode: ProfileShellMode;
  usernameParam?: string;
}

interface ProfileUser {
  _id?: string;
  uuid?: string;
  username?: string;
  email?: string;
  name?: string;
  bio?: string;
  profilePic?: string;
}

export const ProfileShell: React.FC<ProfileShellProps> = ({
  mode,
  usernameParam,
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('created');
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    createdMemes: 0,
    savedMemes: 0,
    likedMemes: 0,
    savedTemplates: 0,
    userTemplates: 0,
  });

  // Derived State
  const isOwnProfile =
    !!user &&
    !!profileUser &&
    ((user._id && user._id === profileUser._id) ||
      (user.username && user.username === profileUser.username)) ||
    false;

  // 1. Load Profile Data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);

        // Self profile
        if (mode === 'self') {
          if (!user) {
            setProfileUser(null);
            return;
          }
          setProfileUser({
            _id: user._id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            bio: user.bio,
            profilePic: user.profilePic,
          });
          return;
        }

        // Public profile: viewing own profile
        if (user && usernameParam && usernameParam === user.username) {
          setProfileUser({
            _id: user._id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            name: user.name,
            bio: user.bio,
            profilePic: user.profilePic,
          });
          return;
        }

        // Fetch other user profile
        if (usernameParam) {
          try {
            const res = await getUserDetails(usernameParam);
            const u =
              (res && (res.user || res.data?.user)) ??
              res?.data ??
              res ??
              null;
            if (u) {
              setProfileUser({
                _id: u._id,
                uuid: u.uuid,
                username: u.username,
                email: u.email,
                name: u.name,
                bio: u.bio,
                profilePic: u.profilePic,
              });
            } else {
              setProfileUser(null);
            }
          } catch {
            setProfileUser(null);
          }
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [mode, usernameParam, user]);

  // 2. Sync Form Data
  useEffect(() => {
    if (profileUser) {
      setEditName(profileUser.name || '');
      setEditUsername(profileUser.username || '');
      setEditEmail(profileUser.email || '');
      setEditBio(profileUser.bio || '');
    }
  }, [profileUser]);

  // 3. Load Stats
  useEffect(() => {
    if (!profileUser?.username) return;

    const loadCounts = async () => {
      try {
        // Always load created memes
        const createdMemesRes = await Promise.allSettled([
          getCreatedMemesByUsername(profileUser.username || "neeraj"),
        ]);

        if (isOwnProfile && user) {
          const [
            savedMemesRes,
            likedMemesRes,
            savedTemplatesRes,
            userTemplatesRes,
          ] = await Promise.allSettled([
            getSavedMemes(),
            getLikedMemes(),
            getSavedTemplates(),
            getAllUserTemplates(),
          ]);

          const unwrap = (r: PromiseSettledResult<any>) =>
            r.status === 'fulfilled' ? r.value : null;

          const savedMemes = unwrap(savedMemesRes);
          const likedMemes = unwrap(likedMemesRes);
          const savedTemplates = unwrap(savedTemplatesRes);
          const userTemplates = unwrap(userTemplatesRes);
          const createdMemes = unwrap(createdMemesRes[0]);

          const getCount = (res: any, key?: string) => {
            if (!res) return 0;
            if (Array.isArray(res?.data)) return res.data.length;
            if (Array.isArray(res)) return res.length;
            if (key && Array.isArray(res?.data?.[key]))
              return res.data[key].length;
            if (key && Array.isArray(res?.[key])) return res[key].length;
            return 0;
          };

          setStats({
            createdMemes: getCount(createdMemes, 'memes'),
            savedMemes: getCount(savedMemes),
            likedMemes: getCount(likedMemes),
            savedTemplates: getCount(savedTemplates, 'templates'),
            userTemplates: getCount(userTemplates, 'templates'),
          });
        } else {
          // Public profile stats
          const unwrap = (r: PromiseSettledResult<any>) =>
            r.status === 'fulfilled' ? r.value : null;
          const createdMemes = unwrap(createdMemesRes[0]);
          const getCount = (res: any, key?: string) => {
            if (!res) return 0;
            if (Array.isArray(res?.data)) return res.data.length;
            if (Array.isArray(res)) return res.length;
            if (key && Array.isArray(res?.data?.[key]))
              return res.data[key].length;
            if (key && Array.isArray(res?.[key])) return res[key].length;
            return 0;
          };
          setStats((prev) => ({
            ...prev,
            createdMemes: getCount(createdMemes, 'memes'),
          }));
        }
      } catch (error) {
        console.error('Failed to load profile counts', error);
      }
    };

    loadCounts();
  }, [isOwnProfile, user, profileUser?.username]);

  // Handlers
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !profileUser) return;

    try {
      setIsSavingProfile(true);
      await updateProfile({
        name: editName,
        username: editUsername,
        email: editEmail,
        bio: editBio,
      });

      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              name: editName,
              username: editUsername,
              email: editEmail,
              bio: editBio,
            }
          : prev
      );

      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be < 5MB');
      return;
    }

    try {
      setIsUploadingPic(true);
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await changeProfilePicture(formData);
      const newProfilePic =
        response?.data?.user || response?.user || response?.data?.profilePic;

      if (newProfilePic) {
        setProfileUser((prev) =>
          prev ? { ...prev, profilePic: newProfilePic } : prev
        );
        toast.success('Profile picture updated');
      } else {
        const localUrl = URL.createObjectURL(file);
        setProfileUser((prev) =>
          prev ? { ...prev, profilePic: localUrl } : prev
        );
        toast.success('Profile picture updated');
      }
    } catch (error) {
      toast.error('Failed to update profile picture');
      console.error(error);
    } finally {
      setIsUploadingPic(false);
      e.target.value = '';
    }
  };

  // Render Helpers
  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <UserIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-200">
            Profile Unavailable
          </h2>
          <p className="text-sm mt-1">
            {mode === 'public'
              ? 'User not found or unavailable.'
              : 'Please log in to view your profile.'}
          </p>
        </div>
        {mode === 'self' && (
          <Button onClick={() => router.push('/login')} variant="secondary">
            Log in
          </Button>
        )}
      </div>
    );
  }

  const displayName = profileUser.name || profileUser.username || 'User';
  const handleLetter = (profileUser.name || profileUser.username || 'U')[0];

  return (
    <div className="w-full max-w-490 mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full md:w-auto text-center sm:text-left">
          {/* Avatar Group */}
          <div className="relative group">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-zinc-900 shadow-xl ring-1 ring-zinc-800">
              <AvatarImage src={profileUser.profilePic} className="object-cover" />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-3xl font-bold">
                {handleLetter?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {isOwnProfile && (
              <label className="absolute bottom-1 right-1 p-2 bg-zinc-800 border border-zinc-700 rounded-full cursor-pointer hover:bg-zinc-700 transition-colors shadow-lg">
                {isUploadingPic ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <Camera className="w-4 h-4 text-zinc-200" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </label>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2 mt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
                {displayName}
              </h1>
              {profileUser.username && (
                <p className="text-zinc-500 font-medium">
                  @{profileUser.username}
                </p>
              )}
            </div>
            {profileUser.bio && (
              <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                {profileUser.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full md:w-auto md:items-end">
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => setActiveTab('profile')}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}

          {/* Quick Search Widget */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const username = (formData.get('searchUsername') as string)
                ?.trim()
                .toLowerCase();
              if (!username) return;
              router.push(`/u/${encodeURIComponent(username)}`);
            }}
            className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-md border border-zinc-800 w-full md:w-64"
          >
            <Search className="w-4 h-4 text-zinc-500 ml-2" />
            <Input
              name="searchUsername"
              placeholder="Find user..."
              className="border-none bg-black h-8 text-sm focus-visible:ring-0 px-2 placeholder:text-zinc-600"
              defaultValue={mode === 'public' ? usernameParam : ''}
            />
          </form>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <StatCard
          label="Created"
          value={stats.createdMemes}
          icon={Grid3X3}
        />
        {isOwnProfile && (
          <>
            <StatCard label="Saved" value={stats.savedMemes} icon={Bookmark} />
            <StatCard label="Liked" value={stats.likedMemes} icon={Heart} />
            <StatCard
              label="Templates"
              value={stats.savedTemplates}
              icon={ImageIcon}
            />
            <StatCard
              label="My Uploads"
              value={stats.userTemplates}
              icon={Camera}
            />
          </>
        )}
      </div>

      <Separator className="bg-zinc-800/50" />

      {/* 3. Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="w-full h-auto p-0 bg-transparent border-b border-zinc-800 flex justify-start overflow-x-auto no-scrollbar">
          <ProfileTabTrigger value="created" label="Memes" icon={Grid3X3} />
          {isOwnProfile && (
            <>
              <ProfileTabTrigger
                value="saved"
                label="Saved"
                icon={Bookmark}
              />
              <ProfileTabTrigger value="liked" label="Liked" icon={Heart} />
              <ProfileTabTrigger
                value="templates"
                label="Templates"
                icon={ImageIcon}
              />
              <ProfileTabTrigger
                value="userTemplates"
                label="My Uploads"
                icon={Camera}
              />
              <ProfileTabTrigger
                value="profile"
                label="Settings"
                icon={Settings}
              />
              <ProfileTabTrigger
                value="security"
                label="Security"
                icon={Shield}
              />
            </>
          )}
        </TabsList>

        <div className="min-h-100">
          {/* Content: Created */}
          <TabsContent value="created" className="mt-0 outline-none">
            {profileUser?.username && (
              <CreatedMemesSection
                username={profileUser.username}
                isOwnProfile={isOwnProfile}
                onCountUpdate={(c) =>
                  setStats((p) => ({ ...p, createdMemes: c }))
                }
              />
            )}
          </TabsContent>

          {/* Content: Saved */}
          {isOwnProfile && (
            <TabsContent value="saved" className="mt-0 outline-none">
              <SavedMemesSection
                onCountUpdate={(c) =>
                  setStats((p) => ({ ...p, savedMemes: c }))
                }
              />
            </TabsContent>
          )}

          {/* Content: Liked */}
          {isOwnProfile && (
            <TabsContent value="liked" className="mt-0 outline-none">
              <LikedMemesSection
                onCountUpdate={(c) =>
                  setStats((p) => ({ ...p, likedMemes: c }))
                }
              />
            </TabsContent>
          )}

          {/* Content: Templates */}
          {isOwnProfile && (
            <TabsContent value="templates" className="mt-0 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-medium text-zinc-200">
                    Your Saved Templates
                  </h3>
                </div>
                <SavedTemplatesSection
                  onCountUpdate={(c) =>
                    setStats((p) => ({ ...p, savedTemplates: c }))
                  }
                />
              </div>
            </TabsContent>
          )}

          {/* Content: User Templates */}
          {isOwnProfile && (
            <TabsContent value="userTemplates" className="mt-0 outline-none">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-zinc-200">
                    Uploaded by You
                  </h3>
                </div>
                <UserTemplatesSection
                  onCountUpdate={(c) =>
                    setStats((p) => ({ ...p, userTemplates: c }))
                  }
                />
              </div>
            </TabsContent>
          )}

          {/* Content: Profile Settings */}
      <TabsContent value="profile" className="mt-0 outline-none">
        <div className="max-w-300 mx-auto space-y-0">
          <Card className="bg-zinc-900/30 border-zinc-800 overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-zinc-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-zinc-500/20 to-zinc-500/20 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                    Profile Information
                  </CardTitle>
                  <p className="text-sm text-zinc-500 mt-0.5 ml-13">
                    Manage your public profile details
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 py-0">
              {isOwnProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* Display Name & Username Row */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                        Display Name
                      </Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your display name"
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-violet-500/20 focus-visible:border-violet-500/50 h-11 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div>
                        Username
                      </Label>
                      <Input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="username"
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-fuchsia-500/20 focus-visible:border-fuchsia-500/50 h-11 transition-all"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-zinc-900/30 px-3 text-xs text-zinc-600">Contact Information</span>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-pink-500/20 focus-visible:border-pink-500/50 h-11 transition-all"
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-zinc-900/30 px-3 text-xs text-zinc-600">About You</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      Bio
                    </Label>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 min-h-30 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/50 resize-none transition-all"
                      placeholder="Tell the world about yourself..."
                    />
                    <p className="text-xs text-zinc-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      This will be visible on your public profile
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      Changes are saved instantly
                    </p>
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-linear-to-r from-white to-zinc-200 hover:from-white hover:to-zinc-300 text-black px-8 h-11 font-medium shadow-lg"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-950/50 border border-zinc-800/50 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-violet-400" />
                  </div>
                  <p className="text-zinc-400 text-sm">
                    You are viewing a public profile. Editing is disabled.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

          {/* Content: Security */}
        {isOwnProfile && (
          <TabsContent value="security" className="mt-0 outline-none">
            <div className="grid gap-6 max-w-400 mx-auto lg:grid-cols-2">
              {/* Change Password Card */}
              <Card className="bg-zinc-900/30 border-zinc-800 h-fit overflow-hidden">
                <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20">
                  <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-zinc-500/20 to-zinc-500/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-zinc-400" />
                    </div>
                    Change Password
                  </CardTitle>
                  <p className="text-sm text-zinc-500 mt-0 ml-13">
                    Update your password regularly for security
                  </p>
                </CardHeader>
                
                <CardContent className="px-6 py-1">
                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                        Current Password
                      </Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-500/20 focus-visible:border-zinc-500/50 h-11 transition-all"
                      />
                    </div>
                    
                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800/50"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                        New Password
                      </Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-500/20 focus-zinc:border-fuchsia-500/50 h-11 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                        Confirm New Password
                      </Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-zinc-500/20 focus-visible:border-zinc-500/50 h-11 transition-all"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full bg-linear-to-r from-zinc-500 to-zinc-600 hover:from-zinc-700 hover:to-zinc-800 text-white h-11 font-medium"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Account Actions Card */}
              <Card className="bg-zinc-900/30 border-zinc-800 h-fit overflow-hidden">
                <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/20">
                  <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-orange-400" />
                    </div>
                    Account Actions
                  </CardTitle>
                  <p className="text-sm text-zinc-500 mt-0 ml-13">
                    Additional security and account options
                  </p>
                </CardHeader>
                
                <CardContent className="px-6 py-2 space-y-3">
                  {/* Password Reset Option */}
                  <div className="p-5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-3 hover:border-violet-500/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-zinc-200 text-sm mb-1 flex items-center gap-2">
                          Password Reset
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            Email
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Forgot your password? Request a secure reset link via email to regain access.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-violet-500/50 h-10 text-sm"
                      onClick={() => router.push('/settings/password')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Link
                    </Button>
                  </div>

                  {/* Divider with Icon */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-zinc-900/30 px-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-5 bg-red-950/10 border border-red-900/30 rounded-xl space-y-3 hover:border-red-900/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-400 text-sm mb-1 flex items-center gap-2">
                          Danger Zone
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            Irreversible
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-900/80 h-10 text-sm"
                      onClick={() => router.push('/settings/account')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
        </div>
      </Tabs>
    </div>
  );
};

// --- Internal Sub-Components for cleaner code ---

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) => (
  <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all hover:bg-zinc-900/60 hover:border-zinc-700/60">
    <Icon className="w-4 h-4 text-zinc-500 mb-1.5 opacity-70" />
    <span className="text-xl font-bold text-zinc-100 leading-none">
      {value}
    </span>
    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mt-1">
      {label}
    </span>
  </div>
);

const ProfileTabTrigger = ({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: any;
}) => (
  <TabsTrigger
    value={value}
    className="
      data-[state=active]:bg-transparent 
      data-[state=active]:shadow-none 
      data-[state=active]:border-b-2 
      data-[state=active]:border-zinc-100 
      data-[state=active]:text-zinc-100
      text-zinc-500 
      rounded-none 
      border-b-2 
      border-transparent 
      px-4 
      py-3 
      h-auto 
      flex 
      items-center 
      gap-2 
      transition-all
      hover:text-zinc-300
    "
  >
    <Icon className="w-4 h-4" />
    {label}
  </TabsTrigger>
);