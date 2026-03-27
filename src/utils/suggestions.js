import { CATEGORIES, getCategoryInfo } from './categorizer';

export function generateSmartSuggestions(expenses, budget) {
  const suggestions = [];
  if (!expenses.length) return suggestions;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percentUsed = (totalSpent / budget) * 100;

  const categoryTotals = {};
  for (const cat of CATEGORIES) {
    categoryTotals[cat.id] = 0;
  }
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }

  const sortedCategories = Object.entries(categoryTotals)
    .filter(([, total]) => total > 0)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length > 0) {
    const [topCatId, topAmount] = sortedCategories[0];
    const topCat = getCategoryInfo(topCatId);
    const topPercent = ((topAmount / totalSpent) * 100).toFixed(0);
    if (topPercent > 40) {
      suggestions.push({
        type: 'warning',
        icon: topCat.emoji,
        text: `${topCat.label} takes ${topPercent}% of your spending. Consider setting a sub-limit.`,
      });
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const uniqueDays = [...new Set(expenses.map(e => e.date))].length;
  const dailyAvg = totalSpent / Math.max(uniqueDays, 1);

  if (todayTotal > dailyAvg * 1.5 && uniqueDays > 1) {
    suggestions.push({
      type: 'info',
      icon: '📈',
      text: `Today's spending (₹${todayTotal.toLocaleString()}) is ${((todayTotal / dailyAvg - 1) * 100).toFixed(0)}% above your daily average.`,
    });
  }

  if (percentUsed > 50 && percentUsed < 70) {
    const remaining = budget - totalSpent;
    suggestions.push({
      type: 'tip',
      icon: '💡',
      text: `You have ₹${remaining.toLocaleString()} left. Try to keep daily spending under ₹${Math.floor(remaining / Math.max(1, 3)).toLocaleString()}.`,
    });
  }

  if (sortedCategories.length >= 2) {
    const leastCatId = sortedCategories[sortedCategories.length - 1][0];
    const leastCat = getCategoryInfo(leastCatId);
    if (leastCat.id !== 'others') {
      suggestions.push({
        type: 'positive',
        icon: '✅',
        text: `Great job keeping ${leastCat.label.toLowerCase()} expenses low!`,
      });
    }
  }

  const todayCategoryTotals = {};
  for (const exp of todayExpenses) {
    todayCategoryTotals[exp.category] = (todayCategoryTotals[exp.category] || 0) + exp.amount;
  }
  for (const [catId, todayCatTotal] of Object.entries(todayCategoryTotals)) {
    const overallCatTotal = categoryTotals[catId] || 0;
    const overallCatDailyAvg = overallCatTotal / Math.max(uniqueDays, 1);
    if (todayCatTotal > overallCatDailyAvg * 2 && uniqueDays > 1) {
      const cat = getCategoryInfo(catId);
      suggestions.push({
        type: 'warning',
        icon: cat.emoji,
        text: `You spent more on ${cat.label.toLowerCase()} today than usual. Consider reducing.`,
      });
    }
  }

  if (sortedCategories.length > 1) {
    const secondCatId = sortedCategories[1][0];
    const secondCat = getCategoryInfo(secondCatId);
    const secondAmount = sortedCategories[1][1];
    if ((secondAmount / totalSpent) * 100 > 25) {
      suggestions.push({
        type: 'tip',
        icon: '🎯',
        text: `Consider reducing ${secondCat.label.toLowerCase()} expenses to stay within budget.`,
      });
    }
  }

  return suggestions.slice(0, 4);
}
