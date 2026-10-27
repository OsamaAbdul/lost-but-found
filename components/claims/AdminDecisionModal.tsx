'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { Claim, Item } from '@/types';
import { Button } from '@/components/ui/Button';

interface AdminDecisionModalProps {
  claim: Claim;
  item: Item;
  onSuccess: (updatedClaim: Claim) => void;
  onClose: () => void;
}

export function AdminDecisionModal({
  claim,
  item,
  onSuccess,
  onClose,
}: AdminDecisionModalProps) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'under_review'>('approved');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A detailed decision justification is required for the audit record.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          decision_reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit decision.');
      }

      onSuccess(data.claim);
    } catch (err: any) {
      setError(err.message || 'Decision failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-gray-900">
            <div className="w-8 h-8 rounded-xl bg-[#0793D4]/10 flex items-center justify-center text-[#0793D4]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Adjudicate Ownership Claim</h3>
              <p className="text-xs text-gray-500">Official security desk verification protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Clues Comparison Box */}
        <div className="space-y-3 bg-gray-50/70 border border-gray-100 rounded-2xl p-4 text-xs">
          <div>
            <span className="font-bold text-gray-600 uppercase text-[10px] tracking-wider block mb-1">
              Confidential Baseline (Ground Truth):
            </span>
            <p className="bg-white p-3 border border-gray-200/70 rounded-xl text-gray-900 font-mono text-[11px] leading-relaxed">
              {item.secret_verification_details || '[No confidential details recorded on item report]'}
            </p>
          </div>

          <div>
            <span className="font-bold text-gray-600 uppercase text-[10px] tracking-wider block mb-1">
              Claimant Submission Answer:
            </span>
            <p className="bg-white p-3 border border-gray-200/70 rounded-xl text-gray-900 font-mono text-[11px] leading-relaxed">
              {claim.verification_answer}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Adjudication Action
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDecision('approved')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  decision === 'approved'
                    ? 'bg-[#79BF2B] text-white border-[#79BF2B] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Claim
              </button>

              <button
                type="button"
                onClick={() => setDecision('under_review')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  decision === 'under_review'
                    ? 'bg-[#0793D4] text-white border-[#0793D4] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Under Review
              </button>

              <button
                type="button"
                onClick={() => setDecision('rejected')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  decision === 'rejected'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Reject Claim
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Audit Notes & Decision Justification *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                decision === 'approved'
                  ? 'e.g. Verified serial number against original student receipt and checked institutional ID.'
                  : decision === 'rejected'
                  ? 'e.g. Verification answer did not match item distinctive characteristics. Claimant notified.'
                  : 'e.g. Requested physical inspection of ownership proof at campus security reception.'
              }
              className="w-full text-xs p-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
          </div>

          {decision === 'approved' && (
            <div className="p-3.5 bg-[#FBBF07]/10 border border-[#FBBF07]/30 rounded-2xl text-[11px] text-gray-900 leading-relaxed">
              <strong>Notice:</strong> Approving will immediately transition item status to &ldquo;Claimed&rdquo; and reject any other conflicting pending claims for this asset.
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decision === 'rejected' ? 'danger' : decision === 'approved' ? 'success' : 'primary'}
              size="sm"
              isLoading={loading}
            >
              Confirm {decision.replace('_', ' ').toUpperCase()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
