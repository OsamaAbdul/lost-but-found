'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Item, EvidenceType } from '@/types';
import { Button } from '@/components/ui/Button';

interface SubmitClaimFormProps {
  item: Item;
  claimantId?: string;
}

interface EvidenceDraft {
  evidence_type: EvidenceType;
  description: string;
  file_url: string;
}

export function SubmitClaimForm({ item }: SubmitClaimFormProps) {
  const router = useRouter();
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [claimStatement, setClaimStatement] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceDraft[]>([
    {
      evidence_type: 'purchase_receipt',
      description: '',
      file_url: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const addEvidence = () => {
    setEvidenceList([
      ...evidenceList,
      { evidence_type: 'photo', description: '', file_url: '' },
    ]);
  };

  const removeEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, idx) => idx !== index));
  };

  const updateEvidence = (index: number, field: keyof EvidenceDraft, val: string) => {
    const updated = [...evidenceList];
    updated[index] = { ...updated[index], [field]: val };
    setEvidenceList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const trimmedAnswer = verificationAnswer.trim();
    const trimmedStatement = claimStatement.trim();

    // Client-side quick check
    const localErrors: Record<string, string> = {};
    if (trimmedAnswer.length < 5) {
      localErrors.verification_answer = 'Verification answer must be at least 5 characters.';
    }
    if (trimmedStatement.length < 10) {
      localErrors.claim_statement = 'Claim statement must be at least 10 characters.';
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setError('Please provide more detailed verification answers and claim statement.');
      setLoading(false);
      return;
    }

    try {
      const formattedEvidence = evidenceList
        .filter((ev) => ev.description.trim())
        .map((ev) => ({
          evidence_type: ev.evidence_type,
          description: ev.description.trim(),
          file_url: ev.file_url.trim() || undefined,
        }));

      const payload = {
        item_id: item.id,
        verification_answer: trimmedAnswer,
        claim_statement: trimmedStatement,
        evidence: formattedEvidence,
      };

      const res = await fetch(`/api/items/${item.id}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          if (data.details.verification_answer?._errors?.length) {
            errors.verification_answer = data.details.verification_answer._errors[0];
          }
          if (data.details.claim_statement?._errors?.length) {
            errors.claim_statement = data.details.claim_statement._errors[0];
          }
          setFieldErrors(errors);
        }
        throw new Error(data.error || 'Failed to submit ownership claim.');
      }

      setSuccess('Ownership claim submitted. It has entered the administrative review queue.');
      setTimeout(() => {
        router.push(`/claims/${data.claim.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0793D4]" />
          Submit Ownership Verification Claim
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Provide distinguishing ownership proof. Submitted evidence is reviewed solely by authorized Campus Security officers.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Verification Question Prompt */}
      {item.verification_question ? (
        <div className="bg-[#0793D4]/8 border border-[#0793D4]/20 rounded-2xl p-5 space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0793D4]">
              Reporter&apos;s Verification Challenge
            </label>
            <span className="text-[11px] text-gray-400">Min. 5 characters</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            &ldquo;{item.verification_question}&rdquo;
          </p>
          <textarea
            required
            minLength={5}
            rows={3}
            value={verificationAnswer}
            onChange={(e) => {
              setVerificationAnswer(e.target.value);
              if (fieldErrors.verification_answer) {
                setFieldErrors((prev) => ({ ...prev, verification_answer: '' }));
              }
            }}
            placeholder="Type your detailed answer here (e.g. specific stickers, engravings, unique wallpaper, exact marks)..."
            className={`w-full text-xs sm:text-sm p-3.5 bg-white border rounded-xl focus:ring-4 focus:outline-none transition-all ${
              fieldErrors.verification_answer
                ? 'border-red-400 focus:ring-red-100'
                : 'border-[#0793D4]/30 focus:ring-[#0793D4]/10 focus:border-[#0793D4]'
            }`}
          />
          {fieldErrors.verification_answer && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.verification_answer}</p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700">
              Identifying Marks & Distinctive Features *
            </label>
            <span className="text-[11px] text-gray-400">Min. 5 characters</span>
          </div>
          <textarea
            required
            minLength={5}
            rows={3}
            value={verificationAnswer}
            onChange={(e) => {
              setVerificationAnswer(e.target.value);
              if (fieldErrors.verification_answer) {
                setFieldErrors((prev) => ({ ...prev, verification_answer: '' }));
              }
            }}
            placeholder="Describe unique marks, serial numbers, scratches, or interior contents..."
            className={`w-full text-xs sm:text-sm p-3.5 bg-gray-50/70 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all ${
              fieldErrors.verification_answer
                ? 'border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:ring-[#0793D4]/10 focus:border-[#0793D4]'
            }`}
          />
          {fieldErrors.verification_answer && (
            <p className="text-xs text-red-600 font-medium">{fieldErrors.verification_answer}</p>
          )}
        </div>
      )}

      {/* Circumstances of Loss */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold text-gray-700">
            Circumstances of Loss & Ownership Statement *
          </label>
          <span className="text-[11px] text-gray-400">Min. 10 characters</span>
        </div>
        <textarea
          required
          minLength={10}
          rows={3}
          value={claimStatement}
          onChange={(e) => {
            setClaimStatement(e.target.value);
            if (fieldErrors.claim_statement) {
              setFieldErrors((prev) => ({ ...prev, claim_statement: '' }));
            }
          }}
          placeholder="Where and when did you lose this asset? Provide any contextual evidence or approximate dates..."
          className={`w-full text-xs sm:text-sm p-3.5 bg-gray-50/70 border rounded-xl focus:bg-white focus:ring-4 focus:outline-none transition-all ${
            fieldErrors.claim_statement
              ? 'border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:ring-[#0793D4]/10 focus:border-[#0793D4]'
          }`}
        />
        {fieldErrors.claim_statement && (
          <p className="text-xs text-red-600 font-medium">{fieldErrors.claim_statement}</p>
        )}
      </div>

      {/* Supporting Evidence List */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Supporting Verification Evidence (Optional)
            </h4>
            <p className="text-[11px] text-gray-400">
              Attach purchase receipts, matching photos, or student ID verification.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEvidence}
            className="gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Proof
          </Button>
        </div>

        <div className="space-y-3">
          {evidenceList.map((ev, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <select
                  value={ev.evidence_type}
                  onChange={(e) => updateEvidence(index, 'evidence_type', e.target.value)}
                  className="text-xs py-1.5 px-3 bg-white border border-gray-200 rounded-xl text-gray-700"
                >
                  <option value="purchase_receipt">Purchase Receipt / Invoice</option>
                  <option value="serial_number">Serial Number Record</option>
                  <option value="photo">Photograph of You with Item</option>
                  <option value="identification">Student ID Proof</option>
                  <option value="other">Other Corroboration</option>
                </select>

                {evidenceList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvidence(index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={ev.description}
                onChange={(e) => updateEvidence(index, 'description', e.target.value)}
                placeholder="Description of this proof (e.g. Apple Store receipt #4092)..."
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0793D4] focus:outline-none"
              />

              <input
                type="url"
                value={ev.file_url}
                onChange={(e) => updateEvidence(index, 'file_url', e.target.value)}
                placeholder="Proof URL or cloud document link (optional)..."
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0793D4] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          className="min-w-[150px]"
        >
          Submit Claim
        </Button>
      </div>
    </form>
  );
}
