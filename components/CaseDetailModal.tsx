'use client';

import { useState, useEffect } from 'react';
import { Case, HearingDate, CaseFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FileUploadArea } from '@/components/FileUploadArea';

interface CaseDetailModalProps {
  case: Case;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Case>) => void;
  onAddHearing: (caseId: string, hearing: Omit<HearingDate, 'id'>) => void;
  onUpdateHearing: (caseId: string, hearingId: string, updates: Partial<HearingDate>) => void;
  onDeleteHearing: (caseId: string, hearingId: string) => void;
  onDelete: (id: string) => void;
  onAddFile?: (caseId: string, file: CaseFile) => void;
  onDeleteFile?: (caseId: string, fileId: string) => void;
}

export function CaseDetailModal({
  case: c,
  onClose,
  onUpdate,
  onAddHearing,
  onUpdateHearing,
  onDeleteHearing,
  onDelete,
  onAddFile,
  onDeleteFile,
}: CaseDetailModalProps) {
  const [notes, setNotes] = useState(c.notes || '');
  const [isEditingFull, setIsEditingFull] = useState(false);

  console.log('CaseDetailModal rendering for case:', c.id, {
    clientName: c.clientName,
    notes: c.notes,
    hearingsCount: c.hearingDates?.length
  });

  // Full edit state
  const [editClientName, setEditClientName] = useState(c.clientName);
  const [editClientPhone, setEditClientPhone] = useState(c.clientPhone || '');
  const [editCaseNumber, setEditCaseNumber] = useState(c.caseNumber);
  const [editCourtName, setEditCourtName] = useState(c.courtName);
  const [editStatus, setEditStatus] = useState(c.status);

  const [newHearingDate, setNewHearingDate] = useState('');
  const [newHearingTime, setNewHearingTime] = useState('');
  const [editingHearing, setEditingHearing] = useState<string | null>(null);

  // Sync state with props when the case data changes in the background
  useEffect(() => {
    if (!isEditingFull) {
      setNotes(c.notes || '');
    }
  }, [c.notes, isEditingFull]);

  useEffect(() => {
    if (!isEditingFull) {
      setEditClientName(c.clientName);
      setEditClientPhone(c.clientPhone || '');
      setEditCaseNumber(c.caseNumber);
      setEditCourtName(c.courtName);
      setEditStatus(c.status);
    }
  }, [c, isEditingFull]);

  const handleSaveFull = () => {
    console.log('Saving case updates:', {
      id: c.id,
      name: editClientName,
      notes: notes
    });
    onUpdate(c.id, {
      clientName: editClientName,
      clientPhone: editClientPhone,
      caseNumber: editCaseNumber,
      courtName: editCourtName,
      status: editStatus,
      notes: notes,
    });
    setIsEditingFull(false);
  };

  const handleAddHearing = () => {
    if (!newHearingDate) return;
    onAddHearing(c.id, {
      date: newHearingDate,
      time: newHearingTime || undefined,
    });
    setNewHearingDate('');
    setNewHearingTime('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const sortedHearings = [...c.hearingDates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Background */}
        <div
          className="h-20 bg-cover bg-center relative"
          style={{
            backgroundImage: 'url(/images/judge-gavel.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/65" />
          <div className="relative z-10 flex items-center justify-between h-full px-6">
            <div>
              {isEditingFull ? (
                <div className="space-y-2 py-2">
                  <Input
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Client Name"
                  />
                  <Input
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    className="h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Phone Number"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary-foreground">{c.clientName}</h2>
                  <p className="text-xs text-primary-foreground/80">
                    Case #{c.caseNumber} • {c.courtName}
                    {c.clientPhone && ` • ${c.clientPhone}`}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {isEditingFull ? (
                <>
                  <Button size="sm" onClick={handleSaveFull} className="bg-green-600 hover:bg-green-700">
                    Save Changes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingFull(false)} className="text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingFull(true)} className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Edit Case
                  </Button>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${c.status === 'Active'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/80'
                      }`}
                  >
                    {c.status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="bg-background hover:bg-secondary"
                  >
                    ✕
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-8">
            {/* Case Details / Info Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/30">
                <div className="w-1 h-6 bg-primary rounded" />
                <h3 className="text-lg font-semibold text-foreground">
                  {isEditingFull ? 'Edit Case Details' : 'Case Information'}
                </h3>
              </div>

              {isEditingFull ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Case Number</label>
                    <Input value={editCaseNumber} onChange={(e) => setEditCaseNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Court Name</label>
                    <Input value={editCourtName} onChange={(e) => setEditCourtName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground"
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Case Number</p>
                    <p className="text-sm font-semibold">{c.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Court</p>
                    <p className="text-sm font-semibold">{c.courtName}</p>
                  </div>
                  {c.clientPhone && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Client Phone</p>
                      <p className="text-sm font-semibold">{c.clientPhone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                    <p className="text-sm font-semibold">{c.status}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Case Notes Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/30">
                <div className="w-1 h-6 bg-primary rounded" />
                <h3 className="text-lg font-semibold text-foreground">Case Notes</h3>
              </div>
              {isEditingFull ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground resize-none"
                  rows={6}
                  placeholder="Add important details about this case..."
                />
              ) : (
                <div
                  className="p-4 bg-secondary/30 rounded-md min-h-[100px] cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setIsEditingFull(true)}
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {notes || 'Click "Edit Case" to add notes...'}
                  </p>
                </div>
              )}
            </section>

            {/* Hearing Dates Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/30">
                <div className="w-1 h-6 bg-primary rounded" />
                <h3 className="text-lg font-semibold text-foreground">Hearing Dates</h3>
              </div>

              {/* Add New Hearing (Simplified for Modal) */}
              <div className="mb-4 p-4 bg-secondary/30 rounded-md">
                <p className="text-sm font-medium text-foreground mb-2">Add New Hearing Date</p>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    type="date"
                    value={newHearingDate}
                    onChange={(e) => setNewHearingDate(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="time"
                    value={newHearingTime}
                    onChange={(e) => setNewHearingTime(e.target.value)}
                    placeholder="Time (optional)"
                    className="flex-1"
                  />
                  <Button onClick={handleAddHearing} size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Hearing List */}
              <div className="space-y-3">
                {sortedHearings.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No hearing dates scheduled.</p>
                ) : (
                  sortedHearings.map((hearing) => (
                    <div key={hearing.id} className="p-4 border border-border rounded-md bg-card">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{formatDate(hearing.date)}</p>
                          {hearing.time && (
                            <p className="text-sm text-muted-foreground">Time: {hearing.time}</p>
                          )}
                          {hearing.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">{hearing.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-col">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditingHearing(editingHearing === hearing.id ? null : hearing.id)
                            }
                          >
                            {editingHearing === hearing.id ? 'Done' : 'Notes'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Delete this hearing date?')) {
                                onDeleteHearing(c.id, hearing.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {editingHearing === hearing.id && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <textarea
                            defaultValue={hearing.notes || ''}
                            onChange={(e) =>
                              onUpdateHearing(c.id, hearing.id, { notes: e.target.value })
                            }
                            placeholder="Add hearing-specific notes..."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground resize-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Case Files Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/30">
                <div className="w-1 h-6 bg-primary rounded" />
                <h3 className="text-lg font-semibold text-foreground">Case Documents</h3>
              </div>
              <FileUploadArea
                onFilesSelected={(newFiles) => {
                  newFiles.forEach(file => onAddFile?.(c.id, file));
                }}
                existingFiles={c.files || []}
                onDeleteFile={(fileId) => onDeleteFile?.(c.id, fileId)}
              />
            </section>

            {/* Final Actions */}
            <div className="flex gap-2 justify-end pt-6 border-t border-border">
              {!isEditingFull && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this case?')) {
                      onDelete(c.id);
                      onClose();
                    }
                  }}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  Delete Case
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Card >
    </div >
  );
}
