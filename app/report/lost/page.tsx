import React from 'react';
import { PageIntro } from '@/components/ui/PageIntro';
import { ReportItemForm } from '@/components/items/ReportItemForm';

export default function ReportLostPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageIntro
        title="Report a Lost Belonging"
        description="Provide comprehensive details about the item you lost on campus. Our automated matching algorithm will search recent found items and alert you when candidate matches arise."
        badge="Asset Reporting"
      />
      <ReportItemForm defaultType="lost" />
    </div>
  );
}
