import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_KEY });

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Product catalog for context
const PRODUCT_CATALOG = `
ANANYA HOUSE OF FURNITURE - Product Information

PRODUCTS:
1. Bedside Table - Rs.4,999 (original Rs.6,999) - Bedroom category - Elegant wooden bedside table with 2 drawers, perfect for modern bedrooms
2. Sofa & Chair - Rs.19,999 (original Rs.24,999) - Living Room category - Luxurious fabric sofa with matching chair
3. TV Unit - Rs.12,999 (original Rs.17,999) - Living Room category - Modern TV unit with storage compartments
4. Dining Table Set - Rs.18,999 (original Rs.24,999) - Dining Room category - 6-seater dining table with chairs
5. Study Desk - Rs.7,999 (original Rs.9,999) - Office category - Compact study desk with drawer storage
6. Shoe Rack - Rs.3,999 (original Rs.5,999) - Entryway category - Wooden shoe rack with multiple shelves
7. Kids Bed - Rs.14,999 (original Rs.19,999) - Kids Room category - Colorful kids bed with safety rails
8. Wardrobe - Rs.22,999 (original Rs.29,999) - Bedroom category - Spacious 3-door wardrobe with mirror
9. Pooja Unit - Rs.9,999 (original Rs.13,999) - Pooja Unit category - Traditional pooja unit with compartments
10. Modular Kitchen - Rs.59,999 (original Rs.79,999) - Kitchen category - L-shaped modular kitchen with premium finish
11. Crockery Unit - Rs.8,999 (original Rs.11,999) - Dining Room category - Elegant crockery unit with glass doors
12. Almirah - Rs.15,999 (original Rs.21,999) - Bedroom category - Sturdy almirah with locker compartment
13. Bookshelf - Rs.8,999 (original Rs.12,999) - Dining Room category

SERVICES:
- Custom Furniture Design
- Home Office Furniture
- Interior Design Consultation

CONTACT:
- Phone: +91-9321812823, +91-8318727813
- Email: contact@ananyahouseoffurniture.com
- Address: Diva-Shil Road, Khardipada, Thane, Maharashtra, India - 400612

DELIVERY:
- Free delivery on orders above Rs.5,000
- Pan-India shipping available
- 5 Year Warranty on all furniture
- Easy Assembly with manual included
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: UIMessage[] };

    const modelMessages = await convertToModelMessages(
      messages.map(({ id: _id, ...rest }) => rest as Omit<UIMessage, 'id'>),
    );

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a helpful AI assistant for Ananya House of Furniture, a custom furniture store in Thane, Maharashtra, India.

IMPORTANT RULES:
- Only answer questions related to furniture, home decor, interior design, or this business
- For product inquiries, recommend products from the catalog
- For pricing questions, use the exact prices from the catalog
- Be polite, helpful, and concise
- If you don't know something, say you don't know and suggest calling +91-9321812823
- Never make up product names, prices, or features
- Always be honest about delivery times - say you need to check with the team
- DO NOT mention that you are an AI or chatbot

PRODUCT CATALOG:
${PRODUCT_CATALOG}

Start every response as a friendly furniture expert. Keep responses short and helpful.`,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(`Error processing chat request: ${error instanceof Error ? error.message : error}`, { status: 500 });
  }
}

