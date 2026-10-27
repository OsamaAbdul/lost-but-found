'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { ITEM_CATEGORIES, ItemType } from '@/types';
import { Button } from '@/components/ui/Button';

interface ReportItemFormProps {
  defaultType: ItemType;
}

export function ReportItemForm({ defaultType }: ReportItemFormProps) {
  const router = useRouter();
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [secretVerificationDetails, setSecretVerificationDetails] = useState('');
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [contactEmailPublic, setContactEmailPublic] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        type,
        title,
        category,
        description,
        incident_date: incidentDate,
        location,
        secret_verification_details: secretVerificationDetails || null,
        verification_question: verificationQuestion || null,
        contact_email_public: contactEmailPublic,
        image_urls: imageUrl.trim() ? [imageUrl.trim()] : [],
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          for (const key of Object.keys(data.details)) {
            if (data.details[key]._errors?.length) {
              errors[key] = data.details[key]._errors[0];
            }
          }
          setFieldErrors(errors);
        }
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSuccess('Your item report has been logged and indexed for matching.');
      setTimeout(() => {
        router.push(`/items/${data.item.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isLost = type === 'lost';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
      {/* Type Toggle Pills */}
      <div className="flex bg-gray-100/70 p-1 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setType('lost')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            isLost
              ? 'bg-[#FBBF07] text-gray-950 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Lost Belonging
        </button>
        <button
          type="button"
          onClick={() => setType('found')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            !isLost
              ? 'bg-[#0793D4] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Found Belonging
        </button>
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

      {/* Section 1: Core Item Information */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            1. Item Identification
          </h3>
          <span className="text-[11px] text-gray-600 font-medium">Public Information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isLost ? 'e.g. MacBook Pro 14" Space Gray' : 'e.g. Black Sony Over-Ear Headphones'}
              className="w-full text-sm px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Date {isLost ? 'Lost' : 'Found'} *
            </label>
            <input
              type="date"
              required
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full text-sm px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
            {fieldErrors.incident_date && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.incident_date}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Campus Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Library, 2nd Floor Study Room 204 or Student Center Cafeteria"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
              />
            </div>
            {fieldErrors.location && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.location}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Public Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide general observable details visible in search. Do not disclose secret passcodes or hidden serial numbers."
              className="w-full text-sm p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Image Attachment */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            2. Photo Reference
          </h3>
          <span className="text-[11px] text-gray-600 font-medium">Optional</span>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Public Image URL
          </label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... direct image link"
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
            />
          </div>
          {imageUrl.trim() && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-gray-500">Image attached for catalog listing</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Verification & Security Controls */}
      <div className="space-y-5 pt-2">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            3. Verification & Privacy Controls
          </h3>
          <span className="text-[11px] font-bold text-[#0793D4] bg-[#0793D4]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#0793D4]" /> Security Guarded
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Claimant Challenge Question
          </label>
          <input
            type="text"
            value={verificationQuestion}
            onChange={(e) => setVerificationQuestion(e.target.value)}
            placeholder="e.g. What specific sticker is on the lid? / What unique keychain is attached?"
            className="w-full text-sm px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#0793D4]/10 focus:border-[#0793D4] transition-all outline-none"
          />
          <p className="text-[11px] text-gray-600 mt-1.5">
            Claimants will be required to answer this challenge question when asserting rightful ownership.
          </p>
        </div>

        <div className="bg-[#FBBF07]/10 border border-[#FBBF07]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
            <ShieldAlert className="w-4 h-4 text-[#735500]" />
            <span>Confidential Verification Clues (Adjudication Ground Truth)</span>
          </div>
          <textarea
            rows={2}
            value={secretVerificationDetails}
            onChange={(e) => setSecretVerificationDetails(e.target.value)}
            placeholder="e.g. Serial number C02G41ABMD6M, lockscreen wallpaper is a golden retriever, back pocket holds $15 cash"
            className="w-full text-xs p-3 bg-white border border-[#FBBF07]/40 rounded-xl focus:ring-4 focus:ring-[#FBBF07]/20 focus:border-[#FBBF07] transition-all outline-none"
          />
          <p className="text-[11px] text-gray-700 leading-relaxed">
            Strictly hidden from public catalogs. University security officers compare claimant answers against this confidential baseline before approving property handovers.
          </p>
        </div>

        <label className="flex items-center gap-3 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            id="contact_privacy"
            checked={contactEmailPublic}
            onChange={(e) => setContactEmailPublic(e.target.checked)}
            className="h-4 w-4 rounded-md border-gray-300 text-[#0793D4] focus:ring-[#0793D4]"
          />
          <span className="text-xs text-gray-700">
            Show campus email on report (uncheck to route communication safely through security).
          </span>
        </label>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
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
          variant={isLost ? 'warning' : 'primary'}
          isLoading={loading}
          className="min-w-[160px]"
        >
          Submit {isLost ? 'Lost Report' : 'Found Report'}
        </Button>
      </div>
    </form>
  );
}
