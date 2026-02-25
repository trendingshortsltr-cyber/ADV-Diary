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
    onSnapshot,
    serverTimestamp,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Case, HearingDate, CaseFile } from '@/lib/types';

export function useFirebaseCases(userId: string | null) {
    const [rawCases, setRawCases] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(`cases_${userId}`);
            return cached ? JSON.parse(cached) : [];
        }
        return [];
    });
    const [rawHearings, setRawHearings] = useState<any[]>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(`hearings_${userId}`);
            return cached ? JSON.parse(cached) : [];
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(() => {
        if (typeof window !== 'undefined' && userId) {
            return !localStorage.getItem(`cases_${userId}`);
        }
        return true;
    });
    const [error, setError] = useState<string | null>(null);

    // Initial load from cache is now handled in useState initializer for speed.
    // However, we still need to handle userId changes.
    useEffect(() => {
        if (!userId) {
            setRawCases([]);
            setRawHearings([]);
            setIsLoading(false);
            return;
        }
        const cachedCases = localStorage.getItem(`cases_${userId}`);
        const cachedHearings = localStorage.getItem(`hearings_${userId}`);
        if (cachedCases && cachedHearings) {
            setRawCases(JSON.parse(cachedCases));
            setRawHearings(JSON.parse(cachedHearings));
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [userId]);

    // Load all cases and hearings for the user via real-time listeners
    useEffect(() => {
        if (!userId) {
            setRawCases([]);
            setRawHearings([]);
            setIsLoading(false);
            return;
        }

        if (rawCases.length === 0) {
            setIsLoading(true);
        }
        setError(null);

        console.log('Initializing Firestore listeners for user:', userId);

        // 1. Listen to Cases
        const casesQuery = query(
            collection(db, 'cases'),
            where('user_id', '==', userId)
        );

        const unsubscribeCases = onSnapshot(casesQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawCases(data);
            localStorage.setItem(`cases_${userId}`, JSON.stringify(data));
            setIsLoading(false);
        }, (err) => {
            setError(err.message || 'Failed to load cases.');
            setIsLoading(false);
        });

        // 2. Listen to Hearings
        const hearingsQuery = query(
            collection(db, 'hearing_dates'),
            where('user_id', '==', userId)
        );

        const unsubscribeHearings = onSnapshot(hearingsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawHearings(data);
            localStorage.setItem(`hearings_${userId}`, JSON.stringify(data));
        }, (err) => {
            console.error('[Firestore] Error listening to hearings:', err);
        });

        return () => {
            console.log('Unsubscribing from Firestore listeners');
            unsubscribeCases();
            unsubscribeHearings();
        };
    }, [userId]);

    // Combine cases and hearings using useMemo for stability
    const cases = useMemo(() => {
        if (rawCases.length === 0) return [];

        // O(M) - Group hearings by caseId using a Map for O(1) lookup
        const hearingsMap = new Map<string, any[]>();
        rawHearings.forEach(h => {
            const caseId = String(h.case_id || h.case_Id || h.caseId || '').trim();
            if (!hearingsMap.has(caseId)) hearingsMap.set(caseId, []);
            hearingsMap.get(caseId)?.push(h);
        });

        // O(N) - Map cases efficiently
        return rawCases.map(c => {
            const caseId = String(c.id).trim();
            const caseHearings = hearingsMap.get(caseId) || [];

            // Robust timestamp extraction
            let createdAt = new Date().toISOString();
            if (c.created_at) {
                if (typeof c.created_at.toDate === 'function') {
                    createdAt = c.created_at.toDate().toISOString();
                } else if (c.created_at instanceof Date) {
                    createdAt = c.created_at.toISOString();
                } else if (typeof c.created_at === 'string') {
                    createdAt = new Date(c.created_at).toISOString();
                }
            }

            return {
                id: caseId,
                clientName: String(c.client_name || c.clientName || 'Unnamed Client'),
                clientPhone: String(c.client_phone || c.clientPhone || ''),
                caseNumber: String(c.case_number || c.caseNumber || 'No Number'),
                courtName: String(c.court_name || c.courtName || 'No Court'),
                status: (c.status === 'Closed' ? 'Closed' : 'Active'),
                notes: String(c.notes || ''),
                createdAt: createdAt,
                hearingDates: caseHearings.map(h => {
                    let hDate = String(h.date || '');
                    if (h.date && typeof h.date.toDate === 'function') {
                        hDate = h.date.toDate().toISOString().split('T')[0];
                    }
                    return {
                        id: String(h.id),
                        date: hDate,
                        time: h.time ? String(h.time) : undefined,
                        notes: h.notes ? String(h.notes) : undefined,
                    };
                }),
                files: Array.isArray(c.files) ? c.files : [],
            } as Case;
        });
    }, [rawCases, rawHearings]);

    // loadCases is no longer needed for initial load, but keep it for compatibility if used elsewhere
    // though it's better to remove it or make it a no-op / refetch trigger.
    const loadCases = useCallback(async () => {
        // Real-time updates handled by useEffect
    }, []);

    // Add case
    const addCase = useCallback(
        async (caseData: Omit<Case, 'id' | 'createdAt'>) => {
            if (!userId) return;

            try {
                setError(null);
                console.log('[Write] Starting atomic addCase for user:', userId);

                const batch = writeBatch(db);

                // 1. Prepare Case Document
                const caseRef = doc(collection(db, 'cases'));
                const casePayload = {
                    user_id: userId,
                    client_name: caseData.clientName,
                    client_phone: caseData.clientPhone || null,
                    case_number: caseData.caseNumber,
                    court_name: caseData.courtName,
                    status: caseData.status,
                    notes: caseData.notes || null,
                    files: caseData.files || [],
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                };
                console.log(`[Write] Batching case creation: ${caseRef.id}`);
                batch.set(caseRef, casePayload);

                // 2. Prepare Hearing Dates
                if (caseData.hearingDates && caseData.hearingDates.length > 0) {
                    caseData.hearingDates.forEach((h, index) => {
                        const hearingRef = doc(collection(db, 'hearing_dates'));
                        const hearingPayload = {
                            case_id: caseRef.id,
                            user_id: userId,
                            date: h.date,
                            time: h.time || null,
                            notes: h.notes || null,
                            created_at: serverTimestamp(),
                            updated_at: serverTimestamp(),
                        };
                        console.log(`[Write] Batching hearing ${index + 1} for case ${caseRef.id}`);
                        batch.set(hearingRef, hearingPayload);
                    });
                }

                // 3. Commit Atomic Batch
                console.log('[Write] Committing atomic batch...');
                await batch.commit();
                console.log('[Write] Atomic batch commit successful!');

                // No need to manually refresh, onSnapshot handles it
            } catch (err: any) {
                console.error('[Write] Error in atomic addCase:', err);
                setError(err.message || 'Failed to add case');
            }
        },
        [userId]
    );

    // Update case
    const updateCase = useCallback(
        async (caseId: string, updates: Partial<Case>) => {
            if (!userId) return;

            try {
                setError(null);
                console.log('Updating case:', caseId, 'with updates:', updates);

                const updateData: any = {
                    updated_at: serverTimestamp()
                };
                if (updates.clientName) updateData.client_name = updates.clientName;
                if (updates.clientPhone !== undefined) updateData.client_phone = updates.clientPhone;
                if (updates.caseNumber) updateData.case_number = updates.caseNumber;
                if (updates.courtName) updateData.court_name = updates.courtName;
                if (updates.status) updateData.status = updates.status;
                if (updates.notes !== undefined) updateData.notes = updates.notes;

                await updateDoc(doc(db, 'cases', caseId), updateData);
            } catch (err: any) {
                console.error('Error updating case:', err);
                setError(err.message || 'Failed to update case');
            }
        },
        [userId]
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
            } catch (err: any) {
                console.error('Error deleting case:', err);
                setError(err.message || 'Failed to delete case');
            }
        },
        [userId]
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
            } catch (err: any) {
                console.error('Error adding hearing date:', err);
                setError(err.message || 'Failed to add hearing date');
            }
        },
        [userId]
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
            } catch (err: any) {
                console.error('Error updating hearing date:', err);
                setError(err.message || 'Failed to update hearing date');
            }
        },
        [userId]
    );

    // Delete hearing date
    const deleteHearingDate = useCallback(
        async (caseId: string, hearingId: string) => {
            if (!userId) return;

            try {
                setError(null);

                await deleteDoc(doc(db, 'hearing_dates', hearingId));
            } catch (err: any) {
                console.error('Error deleting hearing date:', err);
                setError(err.message || 'Failed to delete hearing date');
            }
        },
        [userId]
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
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return cases.filter(c => c.status === 'Active' && c.hearingDates.some(h => h.date === today));
    }, [cases]);

    const getUpcomingWeek = useCallback(() => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;

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
