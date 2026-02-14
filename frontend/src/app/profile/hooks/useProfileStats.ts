import { useState, useCallback } from 'react';

interface ProfileStats {
  createdMemes: number;
  savedMemes: number;
  likedMemes: number;
  savedTemplates: number;
  userTemplates: number;
}

export const useProfileStats = () => {
  const [stats, setStats] = useState<ProfileStats>({
    createdMemes: 0,
    savedMemes: 0,
    likedMemes: 0,
    savedTemplates: 0,
    userTemplates: 0,
  });

  const updateStat = useCallback((key: keyof ProfileStats, value: number) => {
    setStats((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { stats, updateStat };
};
