'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface PageIntroProps {
  title: string;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageIntro({ title, description, badge, actions }: PageIntroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-6 mb-8 border-b border-gray-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
    >
      <div className="space-y-1.5 max-w-3xl">
        {badge && (
          <div>
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0793D4] bg-[#0793D4]/10 rounded-full">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </motion.section>
  );
}
