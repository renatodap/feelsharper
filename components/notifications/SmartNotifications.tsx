"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Bell, 
  BellOff, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie,
  Dumbbell,
  Calendar,
  Clock,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSchedule {
  id: string;
  type: 'meal' | 'workout' | 'weigh-in' | 'water';
  title: string;
  message: string;
  time: string;
  days: string[];
  enabled: boolean;
  icon: any;
}

const DEFAULT_SCHEDULES: NotificationSchedule[] = [
  {
    id: 'breakfast',
    type: 'meal',
    title: 'Breakfast Reminder',
    message: "Time for breakfast! Start your day with protein 💪",
    time: '08:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
    icon: Coffee
  },
  {
    id: 'lunch',
    type: 'meal',
    title: 'Lunch Reminder',
    message: "Lunch time! Don't forget to log your meal 🍽️",
    time: '12:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
    icon: Sun
  },
  {
    id: 'dinner',
    type: 'meal',
    title: 'Dinner Reminder',
    message: "Dinner time! Finish strong with a balanced meal 🥗",
    time: '18:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
    icon: Moon
  },
  {
    id: 'snack',
    type: 'meal',
    title: 'Snack Reminder',
    message: "Healthy snack time! Keep your energy up 🍎",
    time: '15:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    enabled: false,
    icon: Cookie
  },
  {
    id: 'workout',
    type: 'workout',
    title: 'Workout Reminder',
    message: "Time to crush your workout! Let's go! 🔥",
    time: '17:00',
    days: ['Mon', 'Wed', 'Fri'],
    enabled: true,
    icon: Dumbbell
  },
  {
    id: 'weigh-in',
    type: 'weigh-in',
    title: 'Morning Weigh-In',
    message: "Time for your daily weigh-in ⚖️",
    time: '07:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    enabled: true,
    icon: Calendar
  }
];

export default function SmartNotifications() {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>(DEFAULT_SCHEDULES);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testNotification, setTestNotification] = useState<string | null>(null);

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Load saved schedules
    const saved = localStorage.getItem('notificationSchedules');
    if (saved) {
      setSchedules(JSON.parse(saved));
    }

    // Set up notification scheduling
    if (notificationsEnabled) {
      scheduleNotifications();
    }
  }, [notificationsEnabled]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setNotificationsEnabled(result === 'granted');
      
      if (result === 'granted') {
        // Show success notification
        new Notification('FeelSharper Notifications Enabled! 🎉', {
          body: 'You\'ll now receive reminders for meals and workouts.',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png'
        });
      }
    }
  };

  const scheduleNotifications = () => {
    // Clear existing timeouts
    const timeouts = (window as any).notificationTimeouts || [];
    timeouts.forEach((t: NodeJS.Timeout) => clearTimeout(t));
    (window as any).notificationTimeouts = [];

    const now = new Date();
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

    schedules.forEach(schedule => {
      if (!schedule.enabled || !schedule.days.includes(currentDay)) return;

      const [hours, minutes] = schedule.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      if (scheduledTime > now) {
        const timeout = setTimeout(() => {
          showNotification(schedule);
        }, scheduledTime.getTime() - now.getTime());
        
        (window as any).notificationTimeouts.push(timeout);
      }
    });
  };

  const showNotification = (schedule: NotificationSchedule) => {
    if (!notificationsEnabled) return;

    new Notification(schedule.title, {
      body: schedule.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: schedule.id,
      requireInteraction: false,
      actions: [
        { action: 'log', title: 'Log Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });

    // Reschedule for tomorrow
    setTimeout(() => scheduleNotifications(), 60000);
  };

  const testNotificationNow = (schedule: NotificationSchedule) => {
    if (!notificationsEnabled) {
      requestPermission();
      return;
    }

    showNotification(schedule);
    setTestNotification(schedule.id);
    setTimeout(() => setTestNotification(null), 2000);
  };

  const toggleSchedule = (id: string) => {
    const updated = schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSchedules(updated);
    localStorage.setItem('notificationSchedules', JSON.stringify(updated));
    
    // Reschedule notifications
    if (notificationsEnabled) {
      scheduleNotifications();
    }
  };

  const updateScheduleTime = (id: string, time: string) => {
    const updated = schedules.map(s => 
      s.id === id ? { ...s, time } : s
    );
    setSchedules(updated);
    localStorage.setItem('notificationSchedules', JSON.stringify(updated));
    
    // Reschedule notifications
    if (notificationsEnabled) {
      scheduleNotifications();
    }
  };

  const updateScheduleDays = (id: string, day: string) => {
    const updated = schedules.map(s => {
      if (s.id === id) {
        const days = s.days.includes(day)
          ? s.days.filter(d => d !== day)
          : [...s.days, day];
        return { ...s, days };
      }
      return s;
    });
    setSchedules(updated);
    localStorage.setItem('notificationSchedules', JSON.stringify(updated));
    
    // Reschedule notifications
    if (notificationsEnabled) {
      scheduleNotifications();
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-green-500" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold">Push Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {notificationsEnabled 
                  ? 'Notifications are enabled' 
                  : 'Enable notifications to get reminders'}
              </p>
            </div>
          </div>
          <Button
            variant={notificationsEnabled ? 'outline' : 'primary'}
            size="sm"
            onClick={requestPermission}
            disabled={notificationsEnabled}
          >
            {notificationsEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      </Card>

      {/* Notification Schedules */}
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const Icon = schedule.icon;
          return (
            <Card key={schedule.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    schedule.enabled ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      schedule.enabled ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-medium">{schedule.title}</h4>
                    <p className="text-sm text-muted-foreground">{schedule.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testNotificationNow(schedule)}
                    className="text-xs"
                  >
                    {testNotification === schedule.id ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      'Test'
                    )}
                  </Button>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      schedule.enabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        schedule.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {schedule.enabled && (
                <div className="space-y-3 pt-3 border-t">
                  {/* Time Picker */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => updateScheduleTime(schedule.id, e.target.value)}
                      className="px-3 py-1 bg-background border border-border rounded text-sm"
                    />
                  </div>

                  {/* Day Selector */}
                  <div>
                    <span className="text-sm text-muted-foreground block mb-2">Days</span>
                    <div className="flex gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          onClick={() => updateScheduleDays(schedule.id, day)}
                          className={cn(
                            "w-10 h-10 rounded text-xs font-medium transition-colors",
                            schedule.days.includes(day)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {day.slice(0, 1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Motivational Messages */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <h3 className="font-semibold mb-3">Smart Reminders</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Personalized timing based on your routine</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Gentle nudges to keep you on track</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Celebrate victories with achievement notifications</span>
          </div>
        </div>
      </Card>
    </div>
  );
}