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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getHearingsForDate = (date: string) => {
    return cases.flatMap(c =>
      (c.hearingDates || [])
        .filter(h => h.date === date)
        .map(h => ({ ...h, clientName: c.clientName, caseNumber: c.caseNumber, courtName: c.courtName }))
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
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const selectedDateHearings = selectedDate ? getHearingsForDate(selectedDate) : [];
  const monthHearings = cases
    .flatMap(c =>
      (c.hearingDates || [])
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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="glass-card overflow-hidden border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* Refined Glassy Header */}
      <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary/20 to-transparent">
        <Button variant="outline" onClick={goToPreviousMonth} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all">
          ← Prev
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{monthName}</h2>
          <p className="text-[9px] font-black text-white/80 tracking-[0.3em] uppercase mt-1">Court Calendar</p>
        </div>
        <Button variant="outline" onClick={goToNextMonth} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all">
          Next →
        </Button>
      </div>

      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-black text-xs uppercase tracking-wider text-white">
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
            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`aspect-square p-2 border rounded-xl text-sm cursor-pointer transition-all duration-300 ${isSelected
                  ? 'border-primary ring-4 ring-primary/20 bg-primary/20 scale-105 z-10 shadow-xl shadow-primary/20'
                  : isTodays
                    ? 'border-primary/40 bg-white/10 shadow-lg shadow-white/5'
                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                <div className={`font-black text-xs mb-1 ${isTodays || isSelected ? 'text-primary' : 'text-white'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {hearings.slice(0, 2).map((hearing, i) => (
                    <div
                      key={i}
                      className="text-[9px] leading-tight bg-primary text-white font-black rounded-md px-1.5 py-1 truncate shadow-lg"
                      title={`${hearing.clientName} (Case #${hearing.caseNumber})`}
                    >
                      {hearing.clientName.split(' ')[0]}
                    </div>
                  ))}
                  {hearings.length > 2 && (
                    <div className="text-[8px] text-white/70 font-black uppercase tracking-tighter pl-1">
                      +{hearings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hearing Details Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h3 className="font-black text-xl text-white tracking-tight uppercase">
              {selectedDate ? `Hearings: ${formatDateLabel(selectedDate)}` : `Month View: ${monthName.split(' ')[0]}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {(selectedDate ? selectedDateHearings : monthHearings).length === 0 ? (
              <div className="col-span-full py-10 text-center bg-white/5 rounded-2xl border border-dashed border-white/20 text-white/70 font-black uppercase text-xs tracking-widest italic">
                {selectedDate ? 'No hearings scheduled for this date.' : `No hearings scheduled for ${monthName.split(' ')[0]}.`}
              </div>
            ) : (
              (selectedDate ? selectedDateHearings : monthHearings).map((hearing: any, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:w-2 transition-all" />
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-white group-hover:text-primary transition-colors text-lg">{hearing.clientName}</p>
                    {hearing.time && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 px-2 py-1 rounded-full text-white">
                        {hearing.time}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-white/90 flex items-center gap-2 font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      #{hearing.caseNumber}
                    </p>
                    <p className="text-xs text-white/90 flex items-center gap-2 font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {hearing.courtName}
                    </p>
                    {!selectedDate && (
                      <p className="text-[10px] mt-3 font-black text-primary uppercase tracking-[0.2em] bg-white/5 inline-block px-2 py-1 rounded">
                        {new Date(hearing.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
