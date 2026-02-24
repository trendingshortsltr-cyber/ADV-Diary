import { Case, CaseFile } from './useCaseManager';

export const SAMPLE_CASES: Case[] = [
  {
    id: '1',
    clientName: 'Jane Mitchell',
    caseNumber: '2024-CV-001',
    courtName: 'District Court',
    status: 'Active',
    notes: 'Ongoing civil litigation regarding property dispute. Client needs updates before March hearing.',
    files: [
      {
        id: 'f1',
        fileName: 'Property_Deed.pdf',
        fileType: 'application/pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo=',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'f2',
        fileName: 'Contract.pdf',
        fileType: 'application/pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo=',
        uploadedAt: new Date().toISOString(),
      },
    ],
    hearingDates: [
      {
        id: 'h1',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        notes: 'Status conference - discuss settlement options',
      },
      {
        id: 'h2',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '2:00 PM',
        notes: 'Pre-trial motion hearing',
      },
      {
        id: 'h3',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '9:30 AM',
        notes: 'Trial - expect 2-3 days',
      },
    ],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    clientName: 'Robert Johnson',
    caseNumber: '2024-CR-042',
    courtName: 'Superior Court',
    status: 'Active',
    notes: 'Criminal defense case. Client in custody. High priority case.',
    hearingDates: [
      {
        id: 'h4',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00 AM',
        notes: 'Bail hearing - prepare character witnesses',
      },
      {
        id: 'h5',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '1:30 PM',
        notes: 'Discovery conference with prosecution',
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    clientName: 'Sarah Chen',
    caseNumber: '2024-FAM-156',
    courtName: 'Family Court',
    status: 'Active',
    notes: 'Family law case - custody dispute. Mediation recommended.',
    hearingDates: [
      {
        id: 'h6',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '3:00 PM',
        notes: 'Mediation session with judge',
      },
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    clientName: 'Michael Rodriguez',
    caseNumber: '2023-AP-089',
    courtName: 'Court of Appeals',
    status: 'Closed',
    notes: 'Appeal case - oral arguments completed. Awaiting decision.',
    hearingDates: [
      {
        id: 'h7',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00 AM',
        notes: 'Oral arguments - case submitted',
      },
    ],
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useSampleData = () => {
  const initializeSampleData = (userId: string) => {
    const userCasesKey = `advocate_cases_${userId}`;
    const existingCases = localStorage.getItem(userCasesKey);

    if (!existingCases) {
      localStorage.setItem(userCasesKey, JSON.stringify(SAMPLE_CASES));
    }
  };

  return { initializeSampleData };
};
