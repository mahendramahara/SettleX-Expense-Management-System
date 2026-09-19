/**
 * Returns a time-appropriate greeting based on the current local hour:
 * - 05:00 to 11:59: Good morning
 * - 12:00 to 16:59: Good afternoon
 * - 17:00 to 21:59: Good evening
 * - 22:00 to 04:59: Good evening
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
