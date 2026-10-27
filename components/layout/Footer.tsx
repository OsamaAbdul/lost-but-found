import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-300 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: System info & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://pg.nsuk.edu.ng/api/global/logo"
                alt="NSUK Logo"
                className="h-10 w-auto object-contain bg-white p-1 rounded-xl"
              />
              <div>
                <span className="font-bold text-white text-sm block leading-tight">
                  NSUK Lost & Found
                </span>
                <span className="text-[11px] text-[#0793D4] font-medium block">
                  Asset Recovery System
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Decentralized university asset recovery portal connecting students and security officers with explainable matching and verification.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[#79BF2B] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nasarawa State University Keffi</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Directory</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/items" className="text-gray-400 hover:text-white transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link href="/report/lost" className="text-gray-400 hover:text-[#FBBF07] transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link href="/report/found" className="text-gray-400 hover:text-[#0793D4] transition-colors">
                  Report a Found Asset
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-gray-400 hover:text-[#79BF2B] transition-colors">
                  Matched Pairs
                </Link>
              </li>
              <li>
                <Link href="/claims" className="text-gray-400 hover:text-white transition-colors">
                  Ownership Claims
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Adjudication Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Verification Policy</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ownership claims require structured validation of unique marks, serial numbers, and administrative approval before handover.
            </p>
            <div className="text-[11px] text-gray-400 bg-gray-800/60 p-3 rounded-xl border border-gray-700/50 leading-relaxed">
              Image similarity alone is insufficient. Claimants must provide verified proof.
            </div>
          </div>

          {/* Col 4: Campus Security Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">Campus Security Desk</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0793D4] shrink-0" />
                <span>Security Headquarters, Ground Floor</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#79BF2B] shrink-0" />
                <span>Dispatch: (555) 019-4400</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#0793D4] shrink-0" />
                <span>lostfound@nsuk.edu.ng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/80 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3">
          <p>&copy; 2026 Nasarawa State University Keffi. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/items" className="hover:text-gray-400">Directory</Link>
            <Link href="/auth/login" className="hover:text-gray-400">Security Login</Link>
            <Link href="/admin" className="hover:text-[#0793D4]">Officer Console</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
