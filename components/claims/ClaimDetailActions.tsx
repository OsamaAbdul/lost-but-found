'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Undo2, AlertCircle } from 'lucide-react';
import { Claim, Item, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { AdminDecisionModal } from './AdminDecisionModal';

interface ClaimDetailActionsProps {
  claim: Claim;
  item: Item;
  currentUserRole?: UserRole;
  isClaimant: boolean;
}

export function ClaimDetailActions({
  claim,
  item,
  currentUserRole,
  isClaimant,
}: ClaimDetailActionsProps) {
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you wish to withdraw this ownership claim?')) return;
    setWithdrawing(true);
    setError(null);

    try {
      const res = await fetch(`/api/claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to withdraw claim');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error withdrawing claim');
    } finally {
      setWithdrawing(false);
    }
  };

  const isAdmin = currentUserRole === 'admin';
  const canWithdraw = isClaimant && claim.status === 'pending';
  const canAdjudicate = isAdmin && (claim.status === 'pending' || claim.status === 'under_review');

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canAdjudicate && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAdminModal(true)}
            className="gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Adjudicate Claim (Security Admin)
          </Button>
        )}

        {canWithdraw && (
          <Button
            variant="outline"
            size="md"
            onClick={handleWithdraw}
            isLoading={withdrawing}
            className="gap-1.5 text-red-600 hover:bg-red-50"
          >
            <Undo2 className="w-4 h-4" />
            Withdraw Pending Claim
          </Button>
        )}
      </div>

      {showAdminModal && (
        <AdminDecisionModal
          claim={claim}
          item={item}
          onSuccess={() => {
            setShowAdminModal(false);
            router.refresh();
          }}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
