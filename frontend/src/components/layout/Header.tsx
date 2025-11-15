import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Trophy } from 'lucide-react';

export default function Header() {
  const { xp } = useSelector((state: RootState) => state.user);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {xp && (
            <div className="flex items-center gap-x-2 px-4 py-2 bg-primary-50 rounded-lg">
              <Trophy className="h-5 w-5 text-primary-600" />
              <div className="text-sm">
                <span className="font-semibold text-gray-900">Level {xp.currentLevel}</span>
                <span className="text-gray-500 ml-2">{xp.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
