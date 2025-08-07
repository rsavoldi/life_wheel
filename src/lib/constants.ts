import type { LifeArea } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_LIFE_AREAS: LifeArea[] = [
  { id: uuidv4(), name: 'Career', score: 7, color: '#FF6384' },
  { id: uuidv4(), name: 'Finances', score: 5, color: '#36A2EB' },
  { id: uuidv4(), name: 'Health', score: 8, color: '#FFCE56' },
  { id: uuidv4(), name: 'Friends & Family', score: 9, color: '#4BC0C0' },
  { id: uuidv4(), name: 'Romance', score: 6, color: '#9966FF' },
  { id: uuidv4(), name: 'Personal Growth', score: 7, color: '#FF9F40' },
  { id: uuidv4(), name: 'Fun & Recreation', score: 4, color: '#FF6384' },
  { id: uuidv4(), name: 'Environment', score: 8, color: '#36A2EB' },
];

// Simple uuid v4 implementation to avoid adding a dependency
function v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
