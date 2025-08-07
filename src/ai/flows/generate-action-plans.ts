'use server';

/**
 * @fileOverview A flow for generating personalized action plans based on user's life areas scores.
 *
 * - generateActionPlans - A function that generates personalized action plans.
 * - GenerateActionPlansInput - The input type for the generateActionPlans function.
 * - GenerateActionPlansOutput - The return type for the generateActionPlans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActionPlansInputSchema = z.object({
  lifeAreas: z.array(
    z.object({
      name: z.string().describe('The name of the life area.'),
      score: z.number().min(1).max(10).describe('The score of the life area.'),
    })
  ).describe('The list of life areas with their scores.'),
});
export type GenerateActionPlansInput = z.infer<typeof GenerateActionPlansInputSchema>;

const GenerateActionPlansOutputSchema = z.object({
  actionPlans: z.array(
    z.object({
      areaName: z.string().describe('The name of the life area.'),
      plan: z.string().describe('The personalized action plan for the life area.'),
    })
  ).describe('The list of personalized action plans.'),
});
export type GenerateActionPlansOutput = z.infer<typeof GenerateActionPlansOutputSchema>;

export async function generateActionPlans(input: GenerateActionPlansInput): Promise<GenerateActionPlansOutput> {
  return generateActionPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActionPlansPrompt',
  input: {schema: GenerateActionPlansInputSchema},
  output: {schema: GenerateActionPlansOutputSchema},
  prompt: `You are a life coach expert, skilled at creating personalized action plans to improve life balance.

  Based on the user's life areas and their corresponding scores, you will generate personalized action plans for the areas where the user scored the lowest. Prioritize generating plans for areas with scores below 5.

  Life Areas and Scores:
  {{#each lifeAreas}}
  - Area: {{this.name}}, Score: {{this.score}}
  {{/each}}

  Action Plans:
  Here are some personalized action plans for each of the mentioned area:
  Please respond using valid JSON format.  The keys of the JSON must match the output schema.
  `, 
});

const generateActionPlansFlow = ai.defineFlow(
  {
    name: 'generateActionPlansFlow',
    inputSchema: GenerateActionPlansInputSchema,
    outputSchema: GenerateActionPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
