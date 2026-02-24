'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Case, HearingDate, CaseFile } from '@/lib/types';
import { FileUploadArea } from '@/components/FileUploadArea';

interface CaseFormProps {
  onSubmit: (caseData: Omit<Case, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  initialData?: Case;
}

export function CaseForm({ onSubmit, onClose, initialData }: CaseFormProps) {
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [caseNumber, setCaseNumber] = useState(initialData?.caseNumber || '');
  const [courtName, setCourtName] = useState(initialData?.courtName || '');
  const [status, setStatus] = useState<'Active' | 'Closed'>(initialData?.status || 'Active');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [hearingDates, setHearingDates] = useState<HearingDate[]>(
    initialData?.hearingDates || [{ id: '1', date: '', time: '' }]
  );
  const [files, setFiles] = useState<CaseFile[]>(initialData?.files || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!caseNumber.trim()) newErrors.caseNumber = 'Case number is required';
    if (!courtName.trim()) newErrors.courtName = 'Court name is required';

    const validHearings = hearingDates.filter(h => h.date.trim());
    if (validHearings.length === 0) {
      newErrors.hearingDates = 'At least one hearing date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const validHearings = hearingDates.filter(h => h.date.trim());

    onSubmit({
      clientName,
      caseNumber,
      courtName,
      status,
      notes,
      hearingDates: validHearings,
      files,
    });
  };

  const updateHearing = (index: number, field: keyof HearingDate, value: string) => {
    const updated = [...hearingDates];
    updated[index] = { ...updated[index], [field]: value };
    setHearingDates(updated);
  };

  const addHearing = () => {
    setHearingDates([...hearingDates, { id: Date.now().toString(), date: '', time: '' }]);
  };

  const removeHearing = (index: number) => {
    setHearingDates(hearingDates.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Form Header with Background */}
        <div
          className="h-24 bg-cover bg-center relative"
          style={{
            backgroundImage: 'url(/images/legal-documents.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/65" />
          <div className="relative z-10 flex items-center h-full px-6">
            <h2 className="text-2xl font-bold text-primary-foreground">
              {initialData ? 'Edit Case' : 'Create New Case'}
            </h2>
          </div>
        </div>

        <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Client Name *
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName) setErrors({ ...errors, clientName: '' });
                  }}
                  placeholder="Full name"
                  className={errors.clientName ? 'border-destructive' : ''}
                />
                {errors.clientName && (
                  <p className="text-destructive text-sm mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Case Number *
                </label>
                <Input
                  value={caseNumber}
                  onChange={(e) => {
                    setCaseNumber(e.target.value);
                    if (errors.caseNumber) setErrors({ ...errors, caseNumber: '' });
                  }}
                  placeholder="e.g., 2024-CV-001"
                  className={errors.caseNumber ? 'border-destructive' : ''}
                />
                {errors.caseNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.caseNumber}</p>
                )}
              </div>
            </div>

            {/* Court Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Court Name *
                </label>
                <Input
                  value={courtName}
                  onChange={(e) => {
                    setCourtName(e.target.value);
                    if (errors.courtName) setErrors({ ...errors, courtName: '' });
                  }}
                  placeholder="e.g., District Court"
                  className={errors.courtName ? 'border-destructive' : ''}
                />
                {errors.courtName && (
                  <p className="text-destructive text-sm mt-1">{errors.courtName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Closed')}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Hearing Dates */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Hearing Dates *
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addHearing}>
                  + Add Date
                </Button>
              </div>

              {errors.hearingDates && (
                <p className="text-destructive text-sm mb-2">{errors.hearingDates}</p>
              )}

              <div className="space-y-3">
                {hearingDates.map((hearing, idx) => (
                  <div key={hearing.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={hearing.date}
                        onChange={(e) => updateHearing(idx, 'date', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={hearing.time || ''}
                        onChange={(e) => updateHearing(idx, 'time', e.target.value)}
                        placeholder="Time (optional)"
                        className="w-full"
                      />
                    </div>
                    {hearingDates.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHearing(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Case Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Case Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add important details or reminders about this case..."
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground resize-none"
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Case Documents & Photos
              </label>
              <FileUploadArea
                onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
                existingFiles={files}
                onDeleteFile={(fileId) => setFiles(files.filter(f => f.id !== fileId))}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Update Case' : 'Create Case'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
