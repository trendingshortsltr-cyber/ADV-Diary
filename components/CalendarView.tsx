'use client';

import { useState } from 'react';
import { Case } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CalendarViewProps {
  cases: Case[];
}

export function CalendarView({ cases }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getHearingsForDate = (date: string) => {
    return cases.flatMap(c =>
      c.hearingDates
        .filter(h => h.date === date)
        .map(h => ({ ...h, clientName: c.clientName, caseNumber: c.caseNumber }))
    );
  };

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      {/* Header with Background */}
      <div
        className="h-20 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(/images/law-office.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/65" />
        <div className="relative z-10 flex justify-between items-center h-full px-6">
          <Button variant="outline" onClick={goToPreviousMonth} className="bg-background hover:bg-secondary">
            ← Previous
          </Button>
          <h2 className="text-2xl font-bold text-white">{monthName}</h2>
          <Button variant="outline" onClick={goToNextMonth} className="bg-background hover:bg-secondary">
            Next →
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Day Headers */}
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const dateStr = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const hearings = getHearingsForDate(dateStr);
            const isTodays = isToday(day);

            return (
              <div
                key={day}
                className={`aspect-square p-2 border rounded-md text-sm ${isTodays
                    ? 'border-primary border-2 bg-primary/5'
                    : 'border-border bg-background hover:bg-secondary'
                  }`}
              >
                <div className={`font-semibold mb-1 ${isTodays ? 'text-primary' : 'text-foreground'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {hearings.map((hearing, i) => (
                    <div
                      key={i}
                      className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate"
                      title={`${hearing.clientName} (Case #${hearing.caseNumber})`}
                    >
                      {hearing.clientName.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hearing Details */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3">Upcoming Hearings This Month</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cases
              .flatMap(c =>
                c.hearingDates
                  .filter(h => {
                    const hDate = new Date(h.date);
                    return (
                      hDate.getMonth() === currentDate.getMonth() &&
                      hDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .map(h => ({
                    ...h,
                    clientName: c.clientName,
                    caseNumber: c.caseNumber,
                    courtName: c.courtName,
                  }))
              )
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((hearing, idx) => (
                <div key={idx} className="p-2 bg-secondary/30 rounded text-sm">
                  <p className="font-medium text-foreground">{hearing.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(hearing.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    {hearing.time ? `at ${hearing.time}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{hearing.courtName}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
