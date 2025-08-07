// src/ai/flows/suggest-improvements.ts
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for improving scores in each area of the wheel of life.
 *
 * - suggestImprovements - A function that takes the wheel of life data and returns suggestions for improvement.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  areas: z.array(
    z.object({
      name: z.string().describe('The name of the life area.'),
      score: z.number().min(1).max(10).describe('The score for the life area (1-10).'),
    })
  ).describe('An array of life areas with their names and scores.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      area: z.string().describe('The life area for which the suggestion is provided.'),
      strategies: z.string().describe('Suggested strategies to improve the score in the area.'),
      activities: z.string().describe('Specific activities to implement the strategies.'),
    })
  ).describe('An array of suggestions for each life area.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are a life coach expert. Analyze the wheel of life data provided and provide suggestions for strategies and activities to improve the scores in each area.

Wheel of Life Data:
{{#each areas}}
- Area: {{name}}, Score: {{score}}
{{/each}}

Provide specific and actionable strategies and activities for each area to help the user improve their score. Focus on the areas with lower scores.

Output the suggestions in a structured format, specifying the area, strategies, and activities. 

Suggestions should be specific to each area and easy to implement.
`,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
