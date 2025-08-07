import type { LifeArea } from '@/types';
import { TFunction } from '@/hooks/use-i18n';

// We remove the id from here, it will be generated on the client-side to avoid hydration issues.
export const getInitialLifeAreas = (t: TFunction): Omit<LifeArea, 'id'>[] => [
  { name: t('areas.career'), score: 7, color: '#FF6384' },
  { name: t('areas.finances'), score: 5, color: '#36A2EB' },
  { name: t('areas.health'), score: 8, color: '#FFCE56' },
  { name: t('areas.friendsFamily'), score: 9, color: '#4BC0C0' },
  { name: t('areas.romance'), score: 6, color: '#9966FF' },
  { name: t('areas.personalGrowth'), score: 7, color: '#FF9F40' },
  { name: t('areas.funRecreation'), score: 4, color: '#FF6384' },
  { name: t('areas.environment'), score: 8, color: '#36A2EB' },
];
