'use server';
/**
 * @fileOverview A chatbot flow that recommends camping equipment.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { getProducts } from '@/lib/products';
import { z } from 'zod';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  message: z.string().describe('The user\'s latest message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// Helper function to get the product list dynamically for the prompt.
async function getProductListForPrompt() {
    try {
        const { products } = await getProducts();
        if (!products || products.length === 0) return 'Tidak ada produk yang tersedia saat ini.';
        
        // Format the product list into a simple string for the AI.
        return products.map(p => 
            `- ${p.name} (Kategori: ${p.category}, Deskripsi: ${p.description})`
        ).join('\n');
    } catch (error) {
        console.error("Error fetching products for chat prompt:", error);
        return 'Saat ini saya tidak dapat mengakses daftar produk.';
    }
}

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  // Define a new input schema for the prompt itself that includes the product list.
  input: { schema: ChatInputSchema.extend({ productList: z.string() }) },
  output: { schema: ChatOutputSchema },
  system: `Anda adalah asisten virtual "BDA.Camp", sebuah layanan penyewaan perlengkapan kemah. 
Tugas Anda adalah membantu pengguna menemukan peralatan yang mereka butuhkan.
Anda ramah, membantu, dan sedikit santai.
Jawab pertanyaan pengguna dan rekomendasikan produk dari daftar di bawah ini jika relevan.
Jangan merekomendasikan produk yang tidak ada dalam daftar.
Selalu jawab dalam Bahasa Indonesia.

Berikut adalah daftar produk yang tersedia:
{{{productList}}}
`,
  prompt: `
{{#each history}}
  {{{role}}}: {{{content}}}
{{/each}}
User: {{{message}}}
Assistant: 
`
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // Fetch the product list dynamically every time the flow is called.
    const currentProductList = await getProductListForPrompt();
    
    // Call the prompt with the user's message history AND the dynamic product list.
    const { output } = await prompt({
        history: input.history,
        message: input.message,
        productList: currentProductList
    });
    
    // Return the AI's response.
    return { response: output!.response };
  }
);
