export interface CaseFile {
    id: string;
    fileName: string;
    fileType: string;
    fileData: string; // Base64 encoded
    uploadedAt: string;
}

export interface HearingDate {
    id: string;
    date: string;
    time?: string;
    notes?: string;
}

export interface Case {
    id: string;
    clientName: string;
    clientPhone?: string;
    caseNumber: string;
    courtName: string;
    hearingDates: HearingDate[];
    status: 'Active' | 'Closed';
    notes?: string;
    files?: CaseFile[];
    createdAt: string;
}
