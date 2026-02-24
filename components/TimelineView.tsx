'use client';

import { Case } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface TimelineViewProps {
  cases: Case[];
}

export function TimelineView({ cases }: TimelineViewProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Collect all hearings from all cases
  const allHearings = cases
    .flatMap(c =>
      c.hearingDates.map(h => ({
        ...h,
        caseId: c.id,
        clientName: c.clientName,
        caseNumber: c.caseNumber,
        courtName: c.courtName,
        caseStatus: c.status,
      }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (allHearings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No hearings scheduled</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-lg overflow-hidden h-20 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(/images/timeline-history.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/65" />
        <div className="relative z-10 flex items-center h-full px-6">
          <h3 className="text-xl font-bold text-white">Chronological Timeline</h3>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {allHearings.map((hearing, idx) => {
          const isUpcoming = new Date(hearing.date) > new Date();
          const isToday = new Date(hearing.date).toDateString() === new Date().toDateString();

          return (
            <div key={`${hearing.caseId}-${hearing.id}`} className="flex gap-4 mb-6">
              {/* Timeline Point */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${isToday
                      ? 'bg-destructive border-destructive'
                      : isUpcoming
                        ? 'bg-primary border-primary'
                        : 'bg-muted border-muted-foreground'
                    }`}
                />
                {idx !== allHearings.length - 1 && (
                  <div className="w-0.5 h-20 bg-border mt-2" />
                )}
              </div>

              {/* Content */}
              <Card className="flex-1 p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{hearing.clientName}</h3>
                      {isToday && (
                        <span className="text-xs bg-destructive text-white px-2 py-0.5 rounded">
                          Today
                        </span>
                      )}
                      {!isUpcoming && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Passed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Case #{hearing.caseNumber} at {hearing.courtName}
                    </p>
                    <p
                      className={`text-base font-medium mt-2 ${isToday ? 'text-destructive' : 'text-foreground'
                        }`}
                    >
                      {formatDate(hearing.date)}
                      {hearing.time && ` at ${hearing.time}`}
                    </p>
                    {hearing.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {hearing.notes}
                      </p>
                    )}
                  </div>

                  {hearing.caseStatus && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${hearing.caseStatus === 'Active'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {hearing.caseStatus}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-secondary/30">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {allHearings.filter(h => new Date(h.date) > new Date()).length}
          </span>{' '}
          upcoming hearings
        </p>
      </Card>
    </div>
  );
}
