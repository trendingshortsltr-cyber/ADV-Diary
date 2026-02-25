'use client';

import { Case } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Paperclip } from 'lucide-react';

interface CaseCardProps {
  case: Case;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Case>) => void;
  onDelete: (id: string) => void;
  highlightHearingDate?: string;
}

export function CaseCard({
  case: c,
  onSelect,
  onUpdate,
  onDelete,
  highlightHearingDate,
}: CaseCardProps) {
  const nextHearing = [...c.hearingDates]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find(h => {
      const hDate = new Date(h.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return hDate >= now;
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isHighlighted = highlightHearingDate === nextHearing?.date;

  return (
    <Card
      className={`glass-card p-5 cursor-pointer hover:scale-[1.01] transition-all duration-300 border-white/10 group ${isHighlighted ? 'ring-2 ring-primary border-primary/50' : ''
        }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{c.clientName}</h3>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'Active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-white/20 text-white/90 border border-white/30'
                }`}
            >
              {c.status}
            </span>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              CASE: {c.caseNumber}
            </p>
            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              COURT: {c.courtName}
            </p>
          </div>

          {nextHearing && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Next Hearing</p>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isToday(nextHearing.date) ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                  <span
                    className={`text-sm font-black ${isToday(nextHearing.date) ? 'text-destructive-foreground' : 'text-slate-900'
                      }`}
                  >
                    {formatDate(nextHearing.date)}
                  </span>
                </div>
                {nextHearing.time && (
                  <span className="text-xs font-black text-slate-900 bg-slate-900/10 px-2 py-1 rounded border border-slate-900/20">
                    {nextHearing.time}
                  </span>
                )}
                {isToday(nextHearing.date) && (
                  <span className="text-[10px] font-black bg-destructive text-white px-2 py-1 rounded uppercase tracking-tighter animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
            </div>
          )}

          {c.notes && (
            <div className="mt-4 text-xs text-slate-800 leading-relaxed max-w-xl">
              <span className="font-black text-slate-900/50 uppercase text-[9px] tracking-widest block mb-1">Notes:</span>
              <p className="italic font-medium">{c.notes.length > 120 ? `${c.notes.substring(0, 120)}...` : c.notes}</p>
            </div>
          )}

          {c.files && c.files.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <Paperclip className="w-3.5 h-3.5" />
              </div>
              <span>{c.files.length} DOCUMENT{c.files.length > 1 ? 'S' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="bg-white/5 border-white/10 text-white hover:bg-primary hover:border-primary font-bold shadow-lg"
          >
            Manage
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this case?')) {
                onDelete(c.id);
              }
            }}
          >
            Archive
          </Button>
        </div>
      </div>
    </Card>
  );
}
