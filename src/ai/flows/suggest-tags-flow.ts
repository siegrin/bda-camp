'use server';
/**
 * @fileOverview An AI flow to suggest image search tags for a product.
 *
 * - suggestTags - A function that suggests tags based on product info.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestTagsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.string().describe('A space-separated string of 2-3 relevant English keywords for image search, with a maximum of two words.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: { schema: SuggestTagsInputSchema },
  output: { schema: SuggestTagsOutputSchema },
  system: `You are an expert in SEO and image tagging. 
Your task is to generate a short, space-separated string of 2-3 relevant English keywords based on a product's name and description.
These keywords will be used for an AI image search hint.
The keywords must be concise and in English.
The entire output string should have a maximum of two words.

Example:
Product Name: Tenda Dome 4 Orang
Description: Tenda kemah tahan air untuk 4 orang, cocok untuk keluarga.
Output: camping tent

Product Name: Kompor Camping Portable
Description: Kompor gas mini untuk memasak saat mendaki gunung.
Output: camping stove
`,
  prompt: `
Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return { tags: output!.tags };
  }
);
