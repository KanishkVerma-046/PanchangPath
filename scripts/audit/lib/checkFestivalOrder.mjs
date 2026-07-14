export const DEFAULT_ORDER_RULES = [
  ['Navratri Begins', 'Maha Navami'],
  ['Maha Navami', 'Vijayadashami / Dussehra'],
  ['Dhanteras', 'Diwali'],
  ['Narak Chaturdashi', 'Diwali'],
  ['Diwali', 'Govardhan Puja'],
  ['Govardhan Puja', 'Bhai Dooj'],
  ['Holika Dahan', 'Holi'],
  ['Ganesh Chaturthi', 'Ganesh Visarjan'],
];

export function parseFestivals(sourceText) {
  const regex = /\{\s*date:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
  const festivals = [];
  let m;
  while ((m = regex.exec(sourceText))) {
    festivals.push({ date: m[1], name: m[2], year: m[1].slice(0, 4) });
  }
  return festivals;
}

export function checkFestivalOrder(festivals, rules) {
  const byYear = new Map();
  for (const f of festivals) {
    if (!byYear.has(f.year)) byYear.set(f.year, new Map());
    byYear.get(f.year).set(f.name, f.date);
  }
  const violations = [];
  for (const [year, byName] of byYear) {
    for (const [before, after] of rules) {
      const beforeDate = byName.get(before);
      const afterDate = byName.get(after);
      if (beforeDate && afterDate && beforeDate > afterDate) {
        violations.push({ year, before, beforeDate, after, afterDate });
      }
    }
  }
  return violations.sort((a, b) => a.year.localeCompare(b.year));
}
