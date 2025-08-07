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
  language: z.string().describe('The language for the response (e.g., "en", "pt").'),
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
  prompt: `You are a life coach expert specializing in cognitive-behavioral therapies (CBT, DBT). Your task is to create personalized, simple, and structured action plans to help users improve their life balance.

  Based on the user's life areas and scores, generate concise action plans for the areas with the lowest scores (especially below 5). The response must be in the specified language: {{language}}.

  Life Areas and Scores:
  {{#each lifeAreas}}
  - Area: {{this.name}}, Score: {{this.score}}
  {{/each}}
  
  Please respond using valid JSON format that strictly adheres to the defined output schema. Do not add any extra text or formatting.`, 
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
