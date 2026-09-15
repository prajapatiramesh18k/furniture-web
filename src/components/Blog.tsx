import Link from 'next/link';

const blogData = [
  {
    id: 1,
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

const slugMap: Record<number, string> = {
  1: 'complete-guide-buying-right-bed-bedroom',
  2: 'furniture-care-101-tips-maintain-wooden-furniture',
  3: '5-simple-ways-make-small-space-look-bigger-furniture',
};

export default function Blog() {
  return (
    <section className="blog" id="blog">
      <h2 className="heading"> our <span> blogs</span></h2>

      <div className="box-container">
        {blogData.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${slugMap[post.id]}`}
            className="box"
          >
            <div className="image">
              <img src={post.image} alt={post.title} loading="lazy" decoding="async" />
              <span className="blog-category">{post.category}</span>
            </div>
            <div className="content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className="btn">read more</span>
              <div className="icons">
                <span>
                  <i className="fas fa-calendar"></i>
                  {post.date}
                </span>
                <span>
                  <i className="fas fa-user"></i>
                  {post.author}
                </span>
                <span>
                  <i className="fas fa-clock"></i>
                  {post.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
