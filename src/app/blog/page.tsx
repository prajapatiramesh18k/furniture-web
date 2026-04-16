'use client';
import { useEffect } from 'react';
import Link from 'next/link';
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
    category: 'Buying Guide',
    readTime: '5 min read',
    date: '5th July, 2023',
    author: 'Ananya Design Team',
  },
  {
    id: 2,
    slug: 'furniture-care-101-tips-maintain-wooden-furniture',
    title: 'Furniture Care 101: Tips to Maintain Wooden Furniture',
    image: '/images/blog-2.jpg',
    excerpt:
      'Helps clients keep their furniture in top condition with easy maintenance tips, enhancing the longevity of their investment.',
    category: 'Maintenance',
    readTime: '4 min read',
    date: '10th March, 2023',
    author: 'Ananya Design Team',
  },
  {
    id: 3,
    slug: '5-simple-ways-make-small-space-look-bigger-furniture',
    title: '5 Simple Ways to Make a Small Space Look Bigger with Furniture',
    image: '/images/blog-3.jpg',
    excerpt:
      'Provides smart furniture arrangement ideas that maximize space, ideal for clients with smaller homes or apartments.',
    category: 'Interior Design',
    readTime: '3 min read',
    date: '11th April, 2023',
    author: 'Ananya Design Team',
  },
];

export const metadata = {
  title: 'Blog | Ananya House of Furniture',
  description: 'Read our latest articles on furniture buying guides, maintenance tips, and interior design ideas.',
};

export default function BlogPage() {
  useEffect(() => {
    document.title = 'Ananya House of Furniture | Blog';
  }, []);
  return (
    <>
      <NavbarWrapper />
      <div className="blog-page">
        <div className="blog-page-hero">
          <CloseButton href="/" />
          <h1>Our <span>Blog</span></h1>
          <p>Expert tips, guides, and inspiration for your home furniture needs.</p>
        </div>

        <div className="blog-page-grid">
          {blogData.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="blog-page-card">
              <div className="blog-page-card-img">
                <img src={post.image} alt={post.title} />
                <span className="blog-page-category">{post.category}</span>
              </div>
              <div className="blog-page-card-body">
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <div className="blog-page-card-meta">
                  <span><i className="fas fa-calendar"></i> {post.date}</span>
                  <span><i className="fas fa-clock"></i> {post.readTime}</span>
                </div>
                <span className="btn">Read More</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
