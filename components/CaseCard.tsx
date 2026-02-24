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
      className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${isHighlighted ? 'border-accent border-2' : ''
        }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{c.clientName}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {c.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Case: {c.caseNumber}</p>
          <p className="text-sm text-muted-foreground">Court: {c.courtName}</p>

          {nextHearing && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Next Hearing</p>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${isToday(nextHearing.date)
                      ? 'text-destructive'
                      : 'text-foreground'
                    }`}
                >
                  {formatDate(nextHearing.date)}
                </span>
                {nextHearing.time && (
                  <span className="text-sm text-muted-foreground">{nextHearing.time}</span>
                )}
                {isToday(nextHearing.date) && (
                  <span className="text-xs bg-destructive text-white px-2 py-0.5 rounded">
                    Today
                  </span>
                )}
              </div>
            </div>
          )}

          {c.notes && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {c.notes.length > 100 ? `${c.notes.substring(0, 100)}...` : c.notes}
            </div>
          )}

          {c.files && c.files.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-primary">
              <Paperclip className="w-4 h-4" />
              <span>{c.files.length} file{c.files.length > 1 ? 's' : ''} attached</span>
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
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this case?')) {
                onDelete(c.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
