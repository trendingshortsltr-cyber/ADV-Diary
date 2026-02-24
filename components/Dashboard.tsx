'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Case, HearingDate, CaseFile } from '@/lib/types';
import { CaseForm } from './CaseForm';
import { CaseCard } from './CaseCard';
import { CaseDetailModal } from './CaseDetailModal';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';

type View = 'dashboard' | 'today' | 'week' | 'calendar' | 'timeline';

interface DashboardProps {
  onLogout: () => void | Promise<void>;
  userEmail: string;
  cases?: Case[];
  addCase?: (caseData: any) => Promise<void>;
  updateCase?: (id: string, updates: any) => Promise<void>;
  deleteCase?: (id: string) => Promise<void>;
  addHearingDate?: (caseId: string, hearing: any) => Promise<void>;
  updateHearingDate?: (caseId: string, hearingId: string, updates: any) => Promise<void>;
  deleteHearingDate?: (caseId: string, hearingId: string) => Promise<void>;
  addCaseFile?: (caseId: string, file: CaseFile) => Promise<void>;
  deleteCaseFile?: (caseId: string, fileId: string) => Promise<void>;
  getTodaysHearings?: () => Case[];
  getUpcomingWeek?: () => any[];
  searchCases?: (query: string) => Case[];
  getSortedCases?: (filtered?: Case[]) => Case[];
  isLoading?: boolean;
}

export function Dashboard({
  onLogout,
  userEmail,
  cases: propCases,
  addCase: propAddCase,
  updateCase: propUpdateCase,
  deleteCase: propDeleteCase,
  addHearingDate: propAddHearingDate,
  updateHearingDate: propUpdateHearingDate,
  deleteHearingDate: propDeleteHearingDate,
  addCaseFile: propAddCaseFile,
  deleteCaseFile: propDeleteCaseFile,
  getTodaysHearings: propGetTodaysHearings,
  getUpcomingWeek: propGetUpcomingWeek,
  searchCases: propSearchCases,
  getSortedCases: propGetSortedCases,
  isLoading: propIsLoading = false,
}: DashboardProps) {
  const cases = propCases || [];
  const addCase = propAddCase || (async () => { });
  const updateCase = propUpdateCase || (async () => { });
  const deleteCase = propDeleteCase || (async () => { });
  const addHearingDate = propAddHearingDate || (async () => { });
  const updateHearingDate = propUpdateHearingDate || (async () => { });
  const deleteHearingDate = propDeleteHearingDate || (async () => { });
  const addCaseFile = propAddCaseFile || (async () => { });
  const deleteCaseFile = propDeleteCaseFile || (async () => { });

  const getTodaysHearings = propGetTodaysHearings || (() => []);
  const getUpcomingWeek = propGetUpcomingWeek || (() => []);
  const searchCases = propSearchCases || ((q: string) => []);
  const getSortedCases = propGetSortedCases || ((f?: Case[]) => []);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Closed'>('Active');

  // Calculate sorted and filtered cases
  const filteredCases = useMemo(() => {
    let result = searchQuery ? searchCases(searchQuery) : cases;
    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }
    return getSortedCases(result);
  }, [cases, searchQuery, statusFilter, searchCases, getSortedCases]);

  const todaysHearings = useMemo(() => getTodaysHearings(), [getTodaysHearings]);
  const upcomingWeek = useMemo(() => getUpcomingWeek(), [getUpcomingWeek]);

  const handleAddCase = (caseData: Omit<Case, 'id' | 'createdAt'>) => {
    addCase(caseData);
    setShowForm(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return (
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: 'url(/images/judge-gavel.jpg)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center h-full px-6">
                <h2 className="text-3xl font-bold text-white">Today's Hearings</h2>
              </div>
            </div>
            {todaysHearings.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hearings scheduled for today</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {todaysHearings.map(c => (
                  <CaseCard
                    key={c.id}
                    case={c}
                    onSelect={() => setSelectedCase(c)}
                    onUpdate={updateCase}
                    onDelete={deleteCase}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'week':
        return (
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: 'url(/images/legal-documents.jpg)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center h-full px-6">
                <h2 className="text-3xl font-bold text-white">Next 7 Days</h2>
              </div>
            </div>
            {upcomingWeek.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hearings scheduled for the next week</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingWeek.map((hearing, idx) => {
                  const c = cases.find(cas => cas.id === (hearing as any).caseId);
                  return c ? (
                    <CaseCard
                      key={`${c.id}-${idx}`}
                      case={c}
                      onSelect={() => setSelectedCase(c)}
                      onUpdate={updateCase}
                      onDelete={deleteCase}
                      highlightHearingDate={(hearing as any).date}
                    />
                  ) : null;
                })}
              </div>
            )}
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: 'url(/images/law-office.jpg)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center h-full px-6">
                <h2 className="text-3xl font-bold text-white">Calendar View</h2>
              </div>
            </div>
            <CalendarView cases={cases} />
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: 'url(/images/team-collaboration.jpg)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center h-full px-6">
                <h2 className="text-3xl font-bold text-white">All Cases Timeline</h2>
              </div>
            </div>
            <TimelineView cases={filteredCases} />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: 'url(/images/case-files.jpg)',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center h-full px-6">
                <h2 className="text-3xl font-bold text-white">My Cases</h2>
              </div>
            </div>
            {filteredCases.length === 0 && !searchQuery ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No cases yet. Create your first case to get started.</p>
              </Card>
            ) : filteredCases.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No cases match your search</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCases.map(c => (
                  <CaseCard
                    key={c.id}
                    case={c}
                    onSelect={() => setSelectedCase(c)}
                    onUpdate={updateCase}
                    onDelete={deleteCase}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-cover bg-center bg-no-repeat border-b border-border shadow-sm relative"
        style={{
          backgroundImage: 'url(/images/courthouse.jpg)',
          minHeight: '140px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/65" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 flex items-center justify-between h-full">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">CaseTrack</h1>
            <p className="text-sm text-primary-foreground/90">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="bg-background hover:bg-secondary">
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats Card */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-3xl font-bold text-primary">{cases.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Cases</p>
              <p className="text-3xl font-bold text-primary">{cases.filter(c => c.status === 'Active').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Hearings</p>
              <p className="text-3xl font-bold text-primary">{todaysHearings.length}</p>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeView === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveView('dashboard')}
            size="sm"
          >
            All Cases
          </Button>
          <Button
            variant={activeView === 'today' ? 'default' : 'outline'}
            onClick={() => setActiveView('today')}
            size="sm"
          >
            Today's Hearings
          </Button>
          <Button
            variant={activeView === 'week' ? 'default' : 'outline'}
            onClick={() => setActiveView('week')}
            size="sm"
          >
            Next 7 Days
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'outline'}
            onClick={() => setActiveView('calendar')}
            size="sm"
          >
            Calendar
          </Button>
          <Button
            variant={activeView === 'timeline' ? 'default' : 'outline'}
            onClick={() => setActiveView('timeline')}
            size="sm"
          >
            Timeline
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6 flex-col sm:flex-row">
          <Input
            placeholder="Search by client name, case number, or court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          {activeView === 'dashboard' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          )}
          <Button onClick={() => setShowForm(true)} className="whitespace-nowrap">
            + New Case
          </Button>
        </div>

        {/* Main Content */}
        {renderView()}
      </div>

      {/* Modals */}
      {showForm && (
        <CaseForm
          onSubmit={handleAddCase}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedCase && (
        <CaseDetailModal
          case={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={updateCase}
          onAddHearing={addHearingDate}
          onUpdateHearing={updateHearingDate}
          onDeleteHearing={deleteHearingDate}
          onDelete={deleteCase}
          onAddFile={addCaseFile}
          onDeleteFile={deleteCaseFile}
        />
      )}
    </div>
  );
}
