import { Wifi, WifiOff } from 'lucide-react';

export default function OnlineStatus({ isOnline }) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center
                    py-1.5 text-xs font-medium flex items-center justify-center gap-1.5
                    animate-slide-up">
      <WifiOff className="w-3.5 h-3.5" />
      You're offline — changes will sync when back online
    </div>
  );
}
