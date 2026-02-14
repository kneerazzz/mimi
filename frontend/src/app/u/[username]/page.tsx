'use client';

import React, { use } from 'react'; // 1. Import 'use'
import { ProfileShell } from '../../profile/ProfileShell';

interface UserProfilePageProps {
  // 2. Update type: params is now a Promise
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  // 3. Unwrap the params Promise using React.use()
  const { username } = use(params);

  return <ProfileShell mode="public" usernameParam={username} />;
}