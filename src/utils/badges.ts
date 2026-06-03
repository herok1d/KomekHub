const badgePriority = [
  'Urgent',
  'Online',
  'Student-friendly',
  'Certificate',
  'Weekend',
  'Flexible schedule',
  'No experience needed',
  'Kazakh language',
  'Russian language',
  'English language',
];

export function sortedUniqueBadges(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => {
    const aIndex = badgePriority.indexOf(a);
    const bIndex = badgePriority.indexOf(b);
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB || a.localeCompare(b);
  });
}

export function detailTags(tags: string[], topBadges: string[]) {
  const top = new Set(topBadges);
  return sortedUniqueBadges(tags).filter((tag) => !top.has(tag));
}
