import React from 'react';
import { PageIntro } from '@/components/ui/PageIntro';
import { ReportItemForm } from '@/components/items/ReportItemForm';

export default function ReportFoundPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageIntro
        title="Report a Found Item"
        description="Catalog an item found on campus. You can set a challenge question that claimants must answer to verify their rightful ownership before physical release."
        badge="Asset Safeguard"
      />
      <ReportItemForm defaultType="found" />
    </div>
  );
}
