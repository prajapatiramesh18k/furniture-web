import { convertToModelMessages, streamText, UIMessage, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { createGroq } from '@ai-sdk/groq';

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  if (!apiKey) return null;
  return createGroq({ apiKey });
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// `llama-3.3-70b-versatile` was decommissioned by Groq and now returns
// "The model does not exist" -> chat silently never replies.
// `openai/gpt-oss-20b` is verified working with this project's key.
const CHAT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

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

/** Local FAQ answers so "Hi" / "Delivery charges?" always get a reply, even if the LLM is down. */
function matchFaq(input: string): string | null {
  const text = input.toLowerCase().trim();
  if (!text) return null;
  if (/^(hi|hii+|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(text) || text === 'hi') {
    return 'Hi there! Welcome to Ananya House of Furniture. Ask me about our sofas, beds, dining sets, prices, delivery or custom furniture design!';
  }
  if (text.includes('deliver') || text.includes('shipping') || text.includes('charge')) {
    return 'We offer FREE delivery on orders above Rs.5,000, with pan-India shipping available. Delivery time depends on your location — call us on +91-9321812823 and we will confirm for your pincode!';
  }
  if (text.includes('warranty')) {
    return 'All our furniture comes with a 5 Year Warranty. Easy assembly with manual included!';
  }
  if (text.includes('contact') || text.includes('phone') || text.includes('address') || text.includes('location') || text.includes('where')) {
    return 'You can reach us on +91-9321812823 / +91-8318727813 or email contact@ananyahouseoffurniture.com. Visit us at Diva-Shil Road, Khardipada, Thane, Maharashtra - 400612.';
  }
  if (text.includes('custom')) {
    return 'Yes! We specialise in custom furniture design, home office furniture and interior design consultation. Call +91-9321812823 for a free quote!';
  }
  if (text.includes('sofa')) {
    return 'Our Sofa & Chair set is Rs.19,999 (was Rs.24,999) — luxurious fabric sofa with matching chair for your living room. Want delivery details or photos? Call +91-9321812823!';
  }
  if (text.includes('price') || text.includes('cost') || text.includes('rate')) {
    return 'Prices start from Rs.3,999 (Shoe Rack) up to Rs.59,999 (Modular Kitchen). Tell me which product you like — e.g. sofa, bed, wardrobe — and I will share the exact price!';
  }
  return null;
}

/** Send a plain-text reply through the UIMessage SSE protocol so useChat always renders it. */
function replyStream(text: string) {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: 'start' });
      writer.write({ type: 'text-start', id: 'text-1' });
      writer.write({ type: 'text-delta', id: 'text-1', delta: text });
      writer.write({ type: 'text-end', id: 'text-1' });
      writer.write({ type: 'finish' });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== 'user' || !Array.isArray(m.parts)) continue;
    const text = m.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as { text: string }).text)
      .join(' ');
    if (text) return text;
  }
  return '';
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: UIMessage[] };

    if (!messages || messages.length === 0) {
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const userText = lastUserText(messages);
    const faqReply = matchFaq(userText);

    const groq = getGroq();
    if (!groq) {
      // No API key configured — still reply instead of a silent failure.
      return replyStream(
        faqReply ??
          'Thanks for reaching out to Ananya House of Furniture! Please call us on +91-9321812823 and we will help you right away.',
      );
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: groq(CHAT_MODEL),
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

Keep responses short and helpful.`,
      messages: modelMessages,
    });

    // If the LLM call fails (bad key, retired model, network), convert the
    // error into a readable chat reply instead of a blank/500 response
    // that the widget silently swallows.
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('Chat stream error:', error);
        if (faqReply) return faqReply;
        return 'Sorry, I am having trouble right now. Please call us on +91-9321812823 and we will help you immediately!';
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    // Return a stream the chat widget can render instead of plain-text 500.
    return replyStream(
      'Sorry, something went wrong. Please try again or call us on +91-9321812823!',
    );
  }
}
