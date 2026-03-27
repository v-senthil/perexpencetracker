import { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { CATEGORIES, getCategoryInfo } from '../utils/categorizer';
import { formatCurrency, formatDateShort, groupBy } from '../utils/helpers';
import { TrendingUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function InsightsPanel({ expenses, budget }) {
  const categoryData = useMemo(() => {
    const totals = {};
    for (const exp of expenses) {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    }
    const entries = Object.entries(totals).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
    return {
      labels: entries.map(([id]) => getCategoryInfo(id).label),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([id]) => getCategoryInfo(id).color),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [expenses]);

  const dailyData = useMemo(() => {
    const groups = groupBy(expenses, e => e.date);
    const sorted = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10);
    return {
      labels: sorted.map(([d]) => formatDateShort(d)),
      datasets: [{
        data: sorted.map(([, items]) => items.reduce((s, e) => s + e.amount, 0)),
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barThickness: 24,
        maxBarThickness: 32,
      }],
    };
  }, [expenses]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  if (!expenses.length) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-8 text-center animate-slide-up">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-text-secondary font-medium">No insights yet</p>
        <p className="text-sm text-text-muted mt-1">Add some expenses to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Category breakdown */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Category Breakdown</h3>
        <div className="w-48 h-48 mx-auto mb-4">
          <Doughnut
            data={categoryData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              cutout: '65%',
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${((ctx.raw / totalSpent) * 100).toFixed(0)}%)`,
                  },
                },
              },
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {categoryData.labels.map((label, i) => {
            const cat = CATEGORIES.find(c => c.label === label);
            return (
              <div key={label} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat?.color }} />
                <span className="text-text-secondary truncate">{cat?.emoji} {label}</span>
                <span className="font-semibold text-text-primary ml-auto">
                  {formatCurrency(categoryData.datasets[0].data[i])}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily trend */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Daily Spending Trend
        </h3>
        <div className="h-48">
          <Bar
            data={dailyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 10 }, color: '#94a3b8' },
                },
                y: {
                  grid: { color: '#f1f5f9' },
                  ticks: {
                    font: { size: 10 },
                    color: '#94a3b8',
                    callback: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
