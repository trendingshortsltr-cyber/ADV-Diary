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
import { Logo } from './Logo';

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
  error?: string | null;
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
  error: propError = null,
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
  const searchCases = propSearchCases || ((query: string) => {
    const lowerQuery = query.toLowerCase();
    return cases.filter((c: Case) =>
      c.clientName.toLowerCase().includes(lowerQuery) ||
      c.caseNumber.toLowerCase().includes(lowerQuery) ||
      c.courtName.toLowerCase().includes(lowerQuery)
    );
  });
  const getSortedCases = propGetSortedCases || ((f?: Case[]) => {
    const casesToSort = f || cases;
    return [...casesToSort].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Closed'>('Active');

  // Calculate sorted and filtered cases
  const filteredCases = useMemo(() => {
    let result = searchQuery ? searchCases(searchQuery) : cases;
    if (statusFilter !== 'All') {
      result = result.filter((c: Case) => c.status === statusFilter);
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
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Today's Schedule</h2>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Live court sessions</p>
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
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Weekly Forecast</h2>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Upcoming 7 days</p>
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
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Court Calendar</h2>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Full Monthly View</p>
              </div>
            </div>
            <CalendarView cases={cases} />
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Case Timeline</h2>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Chronological History</p>
              </div>
            </div>
            <TimelineView cases={filteredCases} />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Professional Dashboard</h2>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Overview of all cases</p>
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
                {filteredCases.map((c: Case) => (
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
    <div className="relative min-h-screen font-sans antialiased text-foreground">
      {/* Dynamic Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000")', // Fallback high-quality courtroom
          filter: 'brightness(0.5)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-morphism border-b border-white/10 shadow-xl backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Advocate Diary</h1>
                <p className="text-[10px] font-bold text-white/90 tracking-widest uppercase">{userEmail}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 font-bold"
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Error Display */}
          {propError && (
            <div className="mb-8 p-4 glass-card border-destructive/30 text-destructive-foreground text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <span className="font-bold">!</span>
                </div>
                <span>{propError}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="hover:bg-destructive/20 text-white">
                Retry
              </Button>
            </div>
          )}

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Total Cases', value: propIsLoading && cases.length === 0 ? '...' : cases.length, color: 'from-blue-500/20 to-indigo-500/20' },
              { label: 'Active Cases', value: propIsLoading && cases.length === 0 ? '...' : cases.filter(c => c.status === 'Active').length, color: 'from-emerald-500/20 to-teal-500/20' },
              { label: "Today's Hearings", value: propIsLoading && cases.length === 0 ? '...' : todaysHearings.length, color: 'from-amber-500/20 to-orange-500/20' }
            ].map((stat, i) => (
              <div key={i} className={`glass-card p-6 rounded-2xl flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-all duration-500 cursor-default bg-gradient-to-br ${stat.color}`}>
                <p className="text-xs font-black text-white/90 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-5xl font-black text-white group-hover:text-primary-foreground transition-colors duration-300">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Controls Area */}
          <div className="glass-card p-6 rounded-2xl mb-10 border-white/10">
            {/* View Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {[
                { id: 'dashboard', label: 'All Cases' },
                { id: 'today', label: "Today's Hearings" },
                { id: 'week', label: 'Next 7 Days' },
                { id: 'calendar', label: 'Calendar' },
                { id: 'timeline', label: 'Timeline' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all duration-300 whitespace-nowrap ${activeView === view.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/20'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* Search and Action */}
            <div className="flex gap-4 flex-col lg:flex-row items-stretch lg:items-center">
              <div className="relative flex-1 group">
                <Input
                  placeholder="Universal search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 h-12 pl-12 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all duration-300 font-bold"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              {activeView === 'dashboard' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 h-12 backdrop-blur-md appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <option value="All" className="bg-slate-900">All Status</option>
                  <option value="Active" className="bg-slate-900">Active</option>
                  <option value="Closed" className="bg-slate-900">Closed</option>
                </select>
              )}

              <Button
                onClick={() => setShowForm(true)}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.03] active:scale-95 whitespace-nowrap"
              >
                + Create Case
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative min-h-[500px] animate-in fade-in duration-700">
            {propIsLoading && cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-3xl glass-card bg-white/5 border-dashed border-white/20">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="text-white font-bold tracking-widest text-sm uppercase animate-pulse">Synchronizing Data...</p>
              </div>
            ) : cases.length === 0 && !propError ? (
              <div className="p-16 text-center glass-card rounded-3xl border-dashed border-white/20">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Your Digital Diary is Empty</h2>
                <p className="text-white/90 mb-8 font-black">Start organizing your professional career by adding your first client case.</p>
                <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-6 rounded-2xl shadow-xl shadow-primary/30 h-auto text-lg transition-transform hover:scale-105 active:scale-95">
                  Begin Now
                </Button>
              </div>
            ) : (
              <div className="glass-card p-4 sm:p-8 rounded-3xl border-white/10 shadow-2xl backdrop-blur-2xl">
                {renderView()}
              </div>
            )}
          </div>
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center border-t border-white/10">
          <p className="text-[10px] uppercase font-black text-white tracking-[0.3em]">© 2026 Advocate Digital Diary • CaseTrack Pro</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            <span className="text-[10px] text-white font-black uppercase tracking-widest">Server Secure</span>
          </div>
        </footer>
      </div>

      {/* Modals - ensure they have their own glass effect through their implementation or parents */}
      {showForm && (
        <CaseForm
          onSubmit={handleAddCase}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedCase && (
        <CaseDetailModal
          case={cases.find(c => c.id === selectedCase.id) || selectedCase}
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
