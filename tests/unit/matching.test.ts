import { describe, it, expect } from 'vitest';
import { calculateItemMatch, findMatchesForItem } from '@/lib/matching/algorithm';
import { Item } from '@/types';

const baseLostItem: Item = {
  id: 'lost-1',
  type: 'lost',
  title: 'MacBook Pro 14" Space Gray',
  category: 'Electronics',
  description: 'Left on the 2nd floor desk near window. Has GitHub stickers.',
  incident_date: '2026-10-25',
  location: 'Science Library',
  status: 'open',
  reporter_id: 'user-1',
  contact_email_public: false,
  created_at: '2026-10-25T10:00:00Z',
  updated_at: '2026-10-25T10:00:00Z',
};

const baseFoundItem: Item = {
  id: 'found-1',
  type: 'found',
  title: 'Apple Laptop Space Gray in Sleeve',
  category: 'Electronics',
  description: 'Found unattended in library study area. Has stickers on lid.',
  incident_date: '2026-10-25',
  location: 'Science Library',
  status: 'open',
  reporter_id: 'user-2',
  contact_email_public: false,
  created_at: '2026-10-25T18:00:00Z',
  updated_at: '2026-10-25T18:00:00Z',
};

describe('Explainable Matching Algorithm', () => {
  it('rejects match if items are of the same type (lost vs lost)', () => {
    const anotherLost: Item = { ...baseFoundItem, type: 'lost', id: 'lost-2' };
    const match = calculateItemMatch(baseLostItem, anotherLost);
    expect(match.typeMatch).toBe(false);
    expect(match.totalScore).toBe(0);
  });

  it('awards full category points for matching category', () => {
    const match = calculateItemMatch(baseLostItem, baseFoundItem);
    expect(match.typeMatch).toBe(true);
    expect(match.categoryScore).toBe(35);
  });

  it('gives 0 category points if categories differ', () => {
    const differentCategoryFound: Item = {
      ...baseFoundItem,
      category: 'Clothing & Accessories',
    };
    const match = calculateItemMatch(baseLostItem, differentCategoryFound);
    expect(match.categoryScore).toBe(0);
  });

  it('scores high confidence for similar laptop reports in the same location and date', () => {
    const match = calculateItemMatch(baseLostItem, baseFoundItem);
    expect(match.totalScore).toBeGreaterThanOrEqual(70);
    expect(match.explanation.length).toBeGreaterThan(0);
  });

  it('ranks higher similarity items first in candidate pool', () => {
    const farFoundItem: Item = {
      id: 'found-far',
      type: 'found',
      title: 'Water Bottle',
      category: 'Other',
      description: 'Blue metal bottle',
      incident_date: '2026-09-01',
      location: 'Gym',
      status: 'open',
      reporter_id: 'user-3',
      contact_email_public: false,
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-09-01T10:00:00Z',
    };

    const matches = findMatchesForItem(baseLostItem, [farFoundItem, baseFoundItem]);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].item.id).toBe('found-1');
  });
});
