// Calendar Integration Service for workout scheduling
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'workout' | 'recovery' | 'assessment' | 'goal';
  metadata?: {
    workout?: {
      type: string;
      plannedExercises?: string[];
      targetIntensity?: number;
    };
    reminder?: {
      enabled: boolean;
      minutesBefore: number;
    };
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      daysOfWeek?: number[];
      endDate?: Date;
    };
  };
}

export class CalendarIntegration {
  private static instance: CalendarIntegration;

  private constructor() {}

  static getInstance(): CalendarIntegration {
    if (!CalendarIntegration.instance) {
      CalendarIntegration.instance = new CalendarIntegration();
    }
    return CalendarIntegration.instance;
  }

  // Generate ICS file for calendar import
  generateICS(events: CalendarEvent[]): string {
    const icsEvents = events.map(event => this.formatICSEvent(event)).join('\n');
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FeelSharper//Workout Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:FeelSharper Workouts
X-WR-TIMEZONE:UTC
${icsEvents}
END:VCALENDAR`;
  }

  private formatICSEvent(event: CalendarEvent): string {
    const uid = event.id || `${Date.now()}@feelsharper.com`;
    const startStr = this.formatICSDate(event.start);
    const endStr = this.formatICSDate(event.end);
    const created = this.formatICSDate(new Date());
    
    let icsEvent = `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${created}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${this.escapeICS(event.title)}`;

    if (event.description) {
      icsEvent += `\nDESCRIPTION:${this.escapeICS(event.description)}`;
    }

    if (event.metadata?.reminder?.enabled) {
      icsEvent += `\nBEGIN:VALARM
TRIGGER:-PT${event.metadata.reminder.minutesBefore}M
ACTION:DISPLAY
DESCRIPTION:${this.escapeICS(event.title)} starting soon
END:VALARM`;
    }

    if (event.metadata?.recurring) {
      icsEvent += `\nRRULE:${this.formatRecurrenceRule(event.metadata.recurring)}`;
    }

    icsEvent += '\nEND:VEVENT';
    return icsEvent;
  }

  private formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private escapeICS(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  private formatRecurrenceRule(recurring: any): string {
    let rule = `FREQ=${recurring.frequency.toUpperCase()}`;
    
    if (recurring.daysOfWeek && recurring.daysOfWeek.length > 0) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const byDay = recurring.daysOfWeek.map(d => days[d]).join(',');
      rule += `;BYDAY=${byDay}`;
    }
    
    if (recurring.endDate) {
      rule += `;UNTIL=${this.formatICSDate(recurring.endDate)}`;
    }
    
    return rule;
  }

  // Generate Google Calendar URL
  generateGoogleCalendarURL(event: CalendarEvent): string {
    const baseURL = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: event.title,
      dates: `${this.formatGoogleDate(event.start)}/${this.formatGoogleDate(event.end)}`,
      details: event.description || '',
      location: 'FeelSharper App',
      sf: 'true'
    });
    
    return `${baseURL}&${params.toString()}`;
  }

  private formatGoogleDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  // Generate Outlook Calendar URL
  generateOutlookURL(event: CalendarEvent): string {
    const baseURL = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description || '',
      location: 'FeelSharper App'
    });
    
    return `${baseURL}?${params.toString()}`;
  }

  // Parse workout plan into calendar events
  parseWorkoutPlan(
    plan: string,
    startDate: Date = new Date()
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const lines = plan.split('\n');
    let currentDate = new Date(startDate);
    
    lines.forEach(line => {
      const dayMatch = line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/i);
      const workoutMatch = line.match(/^(?:Day\s*\d+:?\s*)?(.+?)(?:\s*-\s*(.+))?$/i);
      
      if (dayMatch) {
        // Set to next occurrence of this day
        const targetDay = this.getDayNumber(dayMatch[1]);
        while (currentDate.getDay() !== targetDay) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (workoutMatch && workoutMatch[1].trim()) {
        const title = workoutMatch[1].trim();
        const description = workoutMatch[2]?.trim();
        
        if (!title.toLowerCase().includes('rest')) {
          const event: CalendarEvent = {
            title: `Workout: ${title}`,
            description,
            start: new Date(currentDate),
            end: new Date(currentDate.getTime() + 60 * 60 * 1000), // 1 hour
            type: 'workout',
            metadata: {
              workout: {
                type: this.detectWorkoutType(title)
              }
            }
          };
          
          events.push(event);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return events;
  }

  private getDayNumber(dayName: string): number {
    const days: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    };
    return days[dayName.toLowerCase()] || 0;
  }

  private detectWorkoutType(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('chest') || lower.includes('push')) return 'upper_push';
    if (lower.includes('back') || lower.includes('pull')) return 'upper_pull';
    if (lower.includes('leg') || lower.includes('squat')) return 'lower';
    if (lower.includes('cardio') || lower.includes('run')) return 'cardio';
    if (lower.includes('core') || lower.includes('abs')) return 'core';
    return 'general';
  }

  // Create recurring workout schedule
  createRecurringSchedule(
    template: {
      name: string;
      daysOfWeek: number[];
      time: { hour: number; minute: number };
      duration: number; // minutes
      type: 'workout' | 'recovery';
    },
    startDate: Date,
    endDate?: Date
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const current = new Date(startDate);
    const end = endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default
    
    while (current <= end) {
      if (template.daysOfWeek.includes(current.getDay())) {
        const eventStart = new Date(current);
        eventStart.setHours(template.time.hour, template.time.minute, 0, 0);
        
        const eventEnd = new Date(eventStart.getTime() + template.duration * 60 * 1000);
        
        events.push({
          title: template.name,
          start: eventStart,
          end: eventEnd,
          type: template.type,
          metadata: {
            recurring: {
              frequency: 'weekly',
              daysOfWeek: template.daysOfWeek,
              endDate: end
            }
          }
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return events;
  }

  // Download ICS file
  downloadICS(events: CalendarEvent[], filename: string = 'feelsharper-workouts.ics'): void {
    const icsContent = this.generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export default CalendarIntegration;