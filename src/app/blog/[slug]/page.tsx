import Link from 'next/link';
import { notFound } from 'next/navigation';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CloseButton from '@/components/CloseButton';

const blogData = [
  {
    id: 1,
    slug: 'complete-guide-buying-right-bed-bedroom',
    title: 'Complete Guide to Buying the Right Bed for Your Bedroom',
    image: '/images/blog-1.jpg',
    excerpt:
      'Offers practical advice on selecting the perfect bed size, material, and design based on client needs and space.',
    fullContent:
      "Choosing the right bed is one of the most important decisions when furnishing your home. A good bed is an investment in your health and comfort, as we spend nearly one-third of our lives sleeping.\n\nFirst, consider the room size. Measure your bedroom and leave at least 2 feet of walking space on each side of the bed. For smaller rooms, consider a king-size bed with a low-profile frame to create an illusion of space.\n\nMaterial matters. Solid wood beds offer durability and timeless appeal. Metal beds are lightweight and often more affordable. Upholstered beds add a touch of luxury with padded headboards.\n\nThe mattress is just as important as the frame. Invest in a quality mattress that supports your spine. Memory foam, latex, and pocket spring mattresses each have unique benefits.\n\nFinally, think about storage. Beds with built-in drawers or hydraulic lifting mechanisms are perfect for maximizing space in smaller homes.",
    category: 'Buying Guide',
    readTime: '5 min read',
    date: '5th July, 2023',
    author: 'Ananya Design Team',
    authorImage: '/images/team-2.jpg',
    tags: ['Beds', 'Bedroom', 'Buying Guide'],
  },
  {
    id: 2,
    slug: 'furniture-care-101-tips-maintain-wooden-furniture',
    title: 'Furniture Care 101: Tips to Maintain Wooden Furniture',
    image: '/images/blog-2.jpg',
    excerpt:
      'Helps clients keep their furniture in top condition with easy maintenance tips, enhancing the longevity of their investment.',
    fullContent:
      "Wooden furniture adds warmth and character to any space, but it requires proper care to maintain its beauty for years to come.\n\nDust regularly with a soft, lint-free cloth. Avoid using feather dusters as they can scratch the surface. For deeper cleaning, use a damp cloth followed immediately by a dry cloth.\n\nKeep wooden furniture away from direct sunlight. UV rays can cause fading and wood to crack over time. Use curtains or blinds to protect your pieces.\n\nMaintain optimal humidity levels. Wood expands and contracts with humidity changes. Using a humidifier in dry seasons and a dehumidifier in humid weather helps prevent cracking and warping.\n\nUse coasters and placemats to prevent water rings and heat damage. Immediately wipe up spills with a soft cloth.\n\nApply furniture polish or beeswax every few months to maintain the natural shine. Avoid silicone-based polishes as they can damage the finish over time.\n\nFor scratches, use a touch-up marker or walnut meat to rub into the scratch. Deep scratches may require professional refinishing.",
    category: 'Maintenance',
    readTime: '4 min read',
    date: '10th March, 2023',
    author: 'Ananya Design Team',
    authorImage: '/images/team-5.png',
    tags: ['Wooden Furniture', 'Maintenance', 'Care Tips'],
  },
  {
    id: 3,
    slug: '5-simple-ways-make-small-space-look-bigger-furniture',
    title: '5 Simple Ways to Make a Small Space Look Bigger with Furniture',
    image: '/images/blog-3.jpg',
    excerpt:
      'Provides smart furniture arrangement ideas that maximize space, ideal for clients with smaller homes or apartments.',
    fullContent:
      "Living in a compact space doesn't mean compromising on style or functionality. With the right furniture choices, you can make any room feel spacious and inviting.\n\n1. Go Vertical: Use tall shelving units and wardrobes instead of wide, low pieces. This draws the eye upward and frees up floor space. Wall-mounted shelves above eye level utilize unused vertical space.\n\n2. Multi-Functional Furniture: Invest in pieces that serve double duty. A sofa bed, ottomans with storage, a dining table with leaves, or a coffee table that converts to a desk. Every piece should earn its place.\n\n3. Glass and Mirrors: Transparent glass tables and mirrored surfaces reflect light and create an open feel. A large mirror on one wall can make a room appear twice its size.\n\n4. Light Colors: Choose furniture in light, neutral tones. White, beige, light gray, and pastels create an airy feel. Dark furniture tends to make spaces feel smaller and more enclosed.\n\n5. Floating Furniture: Leave space around the perimeter of the room. Avoid pushing all furniture against walls. Creating a floating arrangement in the center of the room actually makes the space feel larger.\n\nBonus Tip: Use furniture with exposed legs. Pieces that touch the floor visually block space, while exposed legs create a sense of openness underneath.",
    category: 'Interior Design',
    readTime: '3 min read',
    date: '11th April, 2023',
    author: 'Ananya Design Team',
    authorImage: '/images/team-6.png',
    tags: ['Small Spaces', 'Interior Design', 'Space Saving'],
  },
];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogData.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Ananya House of Furniture`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);
  if (!post) notFound();

  const paragraphs = post.fullContent.split('\n').filter((p) => p.trim() !== '');

  return (
    <>
      <NavbarWrapper />
      <div className="blog-post-page">
        <div className="blog-post-header">
          <div className="blog-post-hero">
            <img src={post.image} alt={post.title} className="blog-post-hero-img" />
            <div className="blog-post-hero-overlay">
              <CloseButton href="/blog" />
            </div>
          </div>
        </div>

        <div className="blog-post-container">
          <div className="blog-post-meta">
            <span className="blog-post-category">{post.category}</span>
            <span className="blog-post-date"><i className="fas fa-calendar"></i> {post.date}</span>
            <span className="blog-post-readtime"><i className="fas fa-clock"></i> {post.readTime}</span>
          </div>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="blog-post-author">
            <img src={post.authorImage} alt={post.author} />
            <span>By {post.author}</span>
          </div>

          <div className="blog-post-content">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="blog-post-tags">
              {post.tags.map((tag, index) => (
                <span key={index} className="blog-tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="blog-post-actions">
            <Link href="/contact" className="btn"><i className="fas fa-phone"></i> Get in Touch</Link>
            <Link href="/blog" className="btn btn-outline">More Articles</Link>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
