
'use server';

import { suggestImprovements, SuggestImprovementsOutput } from '@/ai/flows/suggest-improvements';
import type { LifeArea } from '@/types';

export async function getAISuggestions(
  areas: LifeArea[]
): Promise<{ success: true; data: SuggestImprovementsOutput } | { success: false; error: string }> {
  try {
    const input = {
      areas: areas.map((a) => ({ name: a.name, score: a.score })),
    };
    const result = await suggestImprovements(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { success: false, error: 'Failed to get AI suggestions. Please try again.' };
  }
}
