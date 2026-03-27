import { Database, CloudOff, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';

export default function SyncStatusBar({ isOnline, dbConnected, syncing, pendingSync, onHardRefresh }) {
  let icon, label, bgClass, textClass;

  if (!isOnline) {
    icon = <WifiOff className="w-3.5 h-3.5" />;
    label = 'Offline';
    bgClass = 'bg-slate-100';
    textClass = 'text-slate-500';
  } else if (!dbConnected) {
    icon = <CloudOff className="w-3.5 h-3.5" />;
    label = 'DB Offline';
    bgClass = 'bg-red-50';
    textClass = 'text-red-500';
  } else if (syncing) {
    icon = <RefreshCw className="w-3.5 h-3.5 animate-spin" />;
    label = 'Syncing...';
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-600';
  } else if (pendingSync > 0) {
    icon = <RefreshCw className="w-3.5 h-3.5" />;
    label = `${pendingSync} pending`;
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-600';
  } else {
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    label = 'Synced';
    bgClass = 'bg-emerald-50';
    textClass = 'text-emerald-600';
  }

  return (
    <button
      onClick={onHardRefresh}
      disabled={syncing}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${bgClass} ${textClass} active:scale-95 transition-all`}
    >
      {icon}
      <span>{label}</span>
      {isOnline && dbConnected && (
        <Database className="w-3 h-3 opacity-60" />
      )}
    </button>
  );
}
