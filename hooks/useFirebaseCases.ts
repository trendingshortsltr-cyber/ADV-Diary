'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Case, HearingDate, CaseFile } from '@/lib/types';

export function useFirebaseCases(userId: string | null) {
    const [cases, setCases] = useState<Case[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load all cases for the user
    const loadCases = useCallback(async () => {
        if (!userId) {
            setCases([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch cases
            const casesQuery = query(
                collection(db, 'cases'),
                where('user_id', '==', userId),
                orderBy('created_at', 'desc')
            );

            const casesSnapshot = await getDocs(casesQuery);
            const casesData = casesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];

            if (casesData.length === 0) {
                setCases([]);
                return;
            }

            // Fetch all hearings for these cases
            // Firestore 'in' query supports up to 30 items. 
            // For simplicity and matching original logic, we'll fetch hearings for all user's cases.
            // Better way: query hearings where user_id == userId (if we add user_id to hearings)
            const hearingsQuery = query(
                collection(db, 'hearing_dates'),
                where('case_id', 'in', casesData.map(c => c.id).slice(0, 30)) // Limit to 30 for 'in' query
            );

            const hearingsSnapshot = await getDocs(hearingsQuery);
            const hearingsData = hearingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as any[];

            const casesWithHearings: Case[] = casesData.map(c => ({
                id: c.id,
                clientName: c.client_name,
                caseNumber: c.case_number,
                courtName: c.court_name,
                status: c.status,
                notes: c.notes,
                createdAt: c.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
                hearingDates: hearingsData
                    .filter(h => h.case_id === c.id)
                    .map(h => ({
                        id: h.id,
                        date: h.date,
                        time: h.time,
                        notes: h.notes,
                    })),
                files: c.files || [],
            }));

            setCases(casesWithHearings);
        } catch (err: any) {
            console.error('Error loading cases:', err);
            setError(err.message || 'Failed to load cases');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadCases();
    }, [loadCases]);

    // Add case
    const addCase = useCallback(
        async (caseData: Omit<Case, 'id' | 'createdAt'>) => {
            if (!userId) return;

            try {
                setError(null);

                // Add case document
                const caseDocRef = await addDoc(collection(db, 'cases'), {
                    user_id: userId,
                    client_name: caseData.clientName,
                    case_number: caseData.caseNumber,
                    court_name: caseData.courtName,
                    status: caseData.status,
                    notes: caseData.notes || null,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                });

                // Add hearing dates
                if (caseData.hearingDates && caseData.hearingDates.length > 0) {
                    const batch = writeBatch(db);
                    caseData.hearingDates.forEach(h => {
                        const hearingRef = doc(collection(db, 'hearing_dates'));
                        batch.set(hearingRef, {
                            case_id: caseDocRef.id,
                            user_id: userId,
                            date: h.date,
                            time: h.time || null,
                            notes: h.notes || null,
                            created_at: serverTimestamp(),
                            updated_at: serverTimestamp(),
                        });
                    });
                    await batch.commit();
                }

                await loadCases();
            } catch (err: any) {
                console.error('Error adding case:', err);
                setError(err.message || 'Failed to add case');
            }
        },
        [userId, loadCases]
    );

    // Update case
    const updateCase = useCallback(
        async (caseId: string, updates: Partial<Case>) => {
            if (!userId) return;

            try {
                setError(null);

                const updateData: any = {
                    updated_at: serverTimestamp()
                };
                if (updates.clientName) updateData.client_name = updates.clientName;
                if (updates.caseNumber) updateData.case_number = updates.caseNumber;
                if (updates.courtName) updateData.court_name = updates.courtName;
                if (updates.status) updateData.status = updates.status;
                if (updates.notes !== undefined) updateData.notes = updates.notes;

                await updateDoc(doc(db, 'cases', caseId), updateData);

                await loadCases();
            } catch (err: any) {
                console.error('Error updating case:', err);
                setError(err.message || 'Failed to update case');
            }
        },
        [userId, loadCases]
    );

    // Delete case
    const deleteCase = useCallback(
        async (caseId: string) => {
            if (!userId) return;

            try {
                setError(null);

                // Delete hearings first
                const hearingsQuery = query(
                    collection(db, 'hearing_dates'),
                    where('case_id', '==', caseId)
                );
                const hearingsSnapshot = await getDocs(hearingsQuery);

                const batch = writeBatch(db);
                hearingsSnapshot.docs.forEach(d => {
                    batch.delete(d.ref);
                });

                // Delete case
                batch.delete(doc(db, 'cases', caseId));

                await batch.commit();
                await loadCases();
            } catch (err: any) {
                console.error('Error deleting case:', err);
                setError(err.message || 'Failed to delete case');
            }
        },
        [userId, loadCases]
    );

    // Add hearing date
    const addHearingDate = useCallback(
        async (caseId: string, hearingData: Omit<HearingDate, 'id'>) => {
            if (!userId) return;

            try {
                setError(null);

                await addDoc(collection(db, 'hearing_dates'), {
                    case_id: caseId,
                    user_id: userId,
                    date: hearingData.date,
                    time: hearingData.time || null,
                    notes: hearingData.notes || null,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                });

                await loadCases();
            } catch (err: any) {
                console.error('Error adding hearing date:', err);
                setError(err.message || 'Failed to add hearing date');
            }
        },
        [userId, loadCases]
    );

    // Update hearing date
    const updateHearingDate = useCallback(
        async (caseId: string, hearingId: string, updates: Partial<HearingDate>) => {
            if (!userId) return;

            try {
                setError(null);

                const updateData: any = {
                    updated_at: serverTimestamp()
                };
                if (updates.date) updateData.date = updates.date;
                if (updates.time !== undefined) updateData.time = updates.time;
                if (updates.notes !== undefined) updateData.notes = updates.notes;

                await updateDoc(doc(db, 'hearing_dates', hearingId), updateData);

                await loadCases();
            } catch (err: any) {
                console.error('Error updating hearing date:', err);
                setError(err.message || 'Failed to update hearing date');
            }
        },
        [userId, loadCases]
    );

    // Delete hearing date
    const deleteHearingDate = useCallback(
        async (caseId: string, hearingId: string) => {
            if (!userId) return;

            try {
                setError(null);

                await deleteDoc(doc(db, 'hearing_dates', hearingId));

                await loadCases();
            } catch (err: any) {
                console.error('Error deleting hearing date:', err);
                setError(err.message || 'Failed to delete hearing date');
            }
        },
        [userId, loadCases]
    );

    // Add case file
    const addCaseFile = useCallback(
        async (caseId: string, file: CaseFile) => {
            if (!userId) return;

            try {
                setError(null);
                const caseRef = doc(db, 'cases', caseId);
                const currentCase = cases.find(c => c.id === caseId);
                if (!currentCase) throw new Error('Case not found');

                await updateDoc(caseRef, {
                    files: [...(currentCase.files || []), file],
                    updated_at: serverTimestamp(),
                });

                await loadCases();
            } catch (err: any) {
                console.error('Error adding file:', err);
                setError(err.message || 'Failed to add file');
            }
        },
        [userId, cases, loadCases]
    );

    // Delete case file
    const deleteCaseFile = useCallback(
        async (caseId: string, fileId: string) => {
            if (!userId) return;

            try {
                setError(null);
                const caseRef = doc(db, 'cases', caseId);
                const currentCase = cases.find(c => c.id === caseId);
                if (!currentCase) throw new Error('Case not found');

                await updateDoc(caseRef, {
                    files: (currentCase.files || []).filter(f => f.id !== fileId),
                    updated_at: serverTimestamp(),
                });

                await loadCases();
            } catch (err: any) {
                console.error('Error deleting file:', err);
                setError(err.message || 'Failed to delete file');
            }
        },
        [userId, cases, loadCases]
    );

    const getNextHearingDate = useCallback((c: Case): HearingDate | undefined => {
        const now = new Date();
        const futureHearings = c.hearingDates
            .filter(h => new Date(h.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return futureHearings[0];
    }, []);

    const getTodaysHearings = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return cases.filter(c => c.status === 'Active' && c.hearingDates.some(h => h.date === today));
    }, [cases]);

    const getUpcomingWeek = useCallback(() => {
        const today = new Date();
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const todayStr = today.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];

        return cases
            .filter(c => c.status === 'Active')
            .flatMap(c => c.hearingDates
                .filter(h => h.date >= todayStr && h.date <= weekEndStr)
                .map(h => ({ ...h, caseId: c.id, clientName: c.clientName, caseNumber: c.caseNumber }))
            )
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [cases]);

    const searchCases = useCallback((query: string) => {
        const lowerQuery = query.toLowerCase();
        return cases.filter(c =>
            c.clientName.toLowerCase().includes(lowerQuery) ||
            c.caseNumber.toLowerCase().includes(lowerQuery) ||
            c.courtName.toLowerCase().includes(lowerQuery)
        );
    }, [cases]);

    const getSortedCases = useCallback((filtered?: Case[]) => {
        const casesToSort = filtered || cases;
        return casesToSort.sort((a, b) => {
            const nextA = getNextHearingDate(a);
            const nextB = getNextHearingDate(b);
            if (!nextA && !nextB) return 0;
            if (!nextA) return 1;
            if (!nextB) return -1;
            return new Date(nextA.date).getTime() - new Date(nextB.date).getTime();
        });
    }, [cases, getNextHearingDate]);

    return {
        cases,
        isLoading,
        error,
        loadCases,
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
        getSortedCases,
        getNextHearingDate,
    };
}
