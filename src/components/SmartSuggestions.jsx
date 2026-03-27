import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { generateSmartSuggestions } from '../utils/suggestions';

const typeStyles = {
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
  tip: 'bg-indigo-50 border-indigo-200',
  positive: 'bg-emerald-50 border-emerald-200',
};

export default function SmartSuggestions({ expenses, budget }) {
  const suggestions = useMemo(
    () => generateSmartSuggestions(expenses, budget),
    [expenses, budget]
  );

  if (!suggestions.length) return null;

  return (
    <div className="bg-white rounded-2xl card-shadow p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-accent" />
        Smart Insights
      </h3>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border
                        ${typeStyles[s.type] || typeStyles.info}`}
          >
            <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
            <p className="text-xs text-text-secondary leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
