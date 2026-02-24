'use client';

import { Card } from '@/components/ui/card';

export function FeatureShowcase() {
  return (
    <div className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Image Section */}
        <div className="rounded-lg overflow-hidden shadow-lg h-80">
          <img
            src="/images/consultation.jpg"
            alt="Legal consultation"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Professional Case Management</h2>
          <p className="text-lg text-muted-foreground">
            Streamline your legal practice with CaseTrack, the comprehensive case management solution designed specifically for advocates.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Organize Cases & Hearings</p>
                <p className="text-sm text-muted-foreground">Track all hearing dates, court details, and client information in one place</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Document Management</p>
                <p className="text-sm text-muted-foreground">Upload and manage case documents, photos, and evidence with ease</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Smart Views & Filters</p>
                <p className="text-sm text-muted-foreground">View your cases by today, upcoming week, calendar, or timeline</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Case Notes & Timeline</p>
                <p className="text-sm text-muted-foreground">Keep detailed notes for each case and individual hearing dates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
