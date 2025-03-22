// Constants for app usage limits and reminders

export const USAGE_LIMITS = {
  // Early reminder time constants (in minutes)
  EARLY_REMINDER_TIME_FIRST: 10,  // First reminder 10 minutes before limit
  EARLY_REMINDER_TIME_SECOND: 5,  // Second reminder 5 minutes before limit
  
  // Notification types
  NOTIFICATION_TYPES: {
    FIRST_WARNING: 'first_warning',
    SECOND_WARNING: 'second_warning',
    LIMIT_REACHED: 'limit_reached'
  },
  
  // Overlay display durations (in ms)
  OVERLAY_DURATION: {
    WARNING: 5000,     // 5 seconds for warnings
    BLOCK: 0           // 0 means indefinite/until user action
  }
};

// Export reminder threshold calculation helper
export const getReminderThresholds = (limitInMinutes) => {
  if (!limitInMinutes || limitInMinutes <= 0) return null;
  
  return {
    // When to show first reminder (total limit minus first reminder time)
    firstReminderThreshold: Math.max(0, limitInMinutes - USAGE_LIMITS.EARLY_REMINDER_TIME_FIRST),
    
    // When to show second reminder (total limit minus second reminder time)
    secondReminderThreshold: Math.max(0, limitInMinutes - USAGE_LIMITS.EARLY_REMINDER_TIME_SECOND),
    
    // The actual limit when apps should be blocked
    blockThreshold: limitInMinutes
  };
}; 