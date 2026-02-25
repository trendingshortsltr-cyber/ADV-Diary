'use client';

import { useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { FirebaseAuthPage } from '@/components/FirebaseAuthPage';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseCases } from '@/hooks/useFirebaseCases';

export default function Page() {
  const { user, isLoading: authLoading, signOut } = useFirebaseAuth();
  const {
    cases,
    isLoading: casesLoading,
    error: casesError,
    addCase,
    updateCase,
    deleteCase,
    addHearingDate,
    updateHearingDate,
    deleteHearingDate,
    addCaseFile,
    deleteCaseFile,
    getTodaysHearings,
    getUpcomingWeek,
    searchCases,
    getSortedCases
  } = useFirebaseCases(user?.id || null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setIsInitialized(true);
    }
  }, [authLoading]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">CaseTrack</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <FirebaseAuthPage
        onAuthSuccess={() => {
          // Auth state will update automatically via useFirebaseAuth
          setIsInitialized(true);
        }}
      />
    );
  }

  return (
    <Dashboard
      onLogout={async () => { await signOut(); }}
      userEmail={user.email}
      cases={cases}
      addCase={addCase}
      updateCase={updateCase}
      deleteCase={deleteCase}
      addHearingDate={addHearingDate}
      updateHearingDate={updateHearingDate}
      deleteHearingDate={deleteHearingDate}
      addCaseFile={addCaseFile}
      deleteCaseFile={deleteCaseFile}
      getTodaysHearings={getTodaysHearings}
      getUpcomingWeek={getUpcomingWeek}
      searchCases={searchCases}
      getSortedCases={getSortedCases}
      isLoading={casesLoading}
      error={casesError}
    />
  );
}
