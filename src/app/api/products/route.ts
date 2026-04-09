import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';

const staticProducts = [
  { id: 1, name: 'Bedside Table', image: '/images/product-1.jpg', price: 4999, originalPrice: 6999, rating: 4.5, category: 'bedroom', description: 'Elegant wooden bedside table with 2 drawers, perfect for modern bedrooms.' },
  { id: 2, name: 'Sofa & Chair', image: '/images/product-2.jpg', price: 24999, originalPrice: 34999, rating: 4.8, category: 'living-room', description: 'Luxurious fabric sofa with matching chair, comfortable seating for family gatherings.' },
  { id: 3, name: 'TV Unit', image: '/images/product-3.jpg', price: 12999, originalPrice: 17999, rating: 4.3, category: 'living-room', description: 'Modern TV unit with storage compartments and sleek finish.' },
  { id: 4, name: 'Dining Table Set', image: '/images/product-4.jpg', price: 18999, originalPrice: 24999, rating: 4.6, category: 'dining-room', description: '6-seater dining table set with comfortable chairs, perfect for family meals.' },
  { id: 5, name: 'Study Desk', image: '/images/product-5.jpg', price: 7999, originalPrice: 9999, rating: 4.2, category: 'office', description: 'Compact study desk with drawer storage, ideal for home office.' },
  { id: 6, name: 'Shoe Rack', image: '/images/product-6.jpg', price: 3999, originalPrice: 5999, rating: 4.4, category: 'entryway', description: 'Wooden shoe rack with multiple shelves, keeps your entryway organized.' },
  { id: 7, name: 'Kids Bed', image: '/images/product-7.jpg', price: 14999, originalPrice: 19999, rating: 4.7, category: 'kids-room', description: 'Colorful kids bed with safety rails, perfect for childrens bedroom.' },
  { id: 8, name: 'Wardrobe', image: '/images/product-8.png', price: 22999, originalPrice: 29999, rating: 4.5, category: 'bedroom', description: 'Spacious 3-door wardrobe with mirror and internal shelves.' },
  { id: 9, name: 'Pooja Unit', image: '/images/product-9.png', price: 9999, originalPrice: 13999, rating: 4.6, category: 'pooja-unit', description: 'Traditional pooja unit with compartments for idols and incense.' },
  { id: 10, name: 'Modular Kitchen', image: '/images/product-10.png', price: 59999, originalPrice: 79999, rating: 4.8, category: 'kitchen', description: 'L-shaped modular kitchen with premium finish and ample storage.' },
  { id: 11, name: 'Crockery Unit', image: '/images/product-11.png', price: 8999, originalPrice: 11999, rating: 4.3, category: 'dining-room', description: 'Elegant crockery unit with glass doors to display your collection.' },
  { id: 12, name: 'Almirah', image: '/images/product.jpg', price: 15999, originalPrice: 21999, rating: 4.4, category: 'bedroom', description: 'Sturdy almirah with locker compartment and adjustable shelves.' },
];

export async function GET() {
  try {
    await dbConnect();
    const dbProducts = await Product.find().lean();
    const dbFormatted = dbProducts.map(p => ({
      id: p._id.toString(),
      name: p.name,
      image: p.image,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      category: p.category,
      description: p.description,
    }));
    return NextResponse.json({ products: [...staticProducts, ...dbFormatted] });
  } catch {
    return NextResponse.json({ products: staticProducts });
  }
}
