'use client';
import { useState, useEffect, useRef } from 'react';

interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo?: string;
  date: string;
  approved: boolean;
  propertyType?: string;
  services?: string[];
  completedDate?: string;
}

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

interface Order {
  _id: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  items: { name: string; price: number; quantity: number }[];
  total: number;
  paymentMethod: string;
  status: string;
  date: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  description: string;
  image: string;
}

interface Contact {
  _id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  message: string;
  status: string;
  createdAt: string;
}

const galleryCategories = [
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-hat-chef' },
  { id: 'pooja-room', name: 'Pooja Room', icon: 'fa-praying-hands' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'entryway', name: 'Entryway', icon: 'fa-door-open' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
  { id: 'outdoor', name: 'Outdoor', icon: 'fa-tree' },
  { id: 'decor', name: 'Decor', icon: 'fa-spa' },
  // Subcategories - original gallery names
  { id: 'sofas', name: 'Sofas', icon: 'fa-couch' },
  { id: 'sofa-cum-beds', name: 'Sofa Cum Beds', icon: 'fa-bed' },
  { id: 'coffee-tables', name: 'Coffee Tables', icon: 'fa-mug-hot' },
  { id: 'tv-cabinets', name: 'TV Cabinets', icon: 'fa-tv' },
  { id: 'tv-unit', name: 'TV Unit', icon: 'fa-tv' },
  { id: 'recliners', name: 'Recliners', icon: 'fa-chair' },
  { id: 'bookshelves', name: 'Bookshelves', icon: 'fa-book' },
  { id: 'almirah', name: 'Almirah', icon: 'fa-door-open' },
  { id: 'mirrors', name: 'Mirrors', icon: 'fa-mirror' },
  { id: 'beds', name: 'Beds', icon: 'fa-bed' },
  { id: 'wardrobes', name: 'Wardrobes', icon: 'fa-door-open' },
  { id: 'mattresses', name: 'Mattresses', icon: 'fa-bed' },
  { id: 'bedside-tables', name: 'Bedside Tables', icon: 'fa-table' },
  { id: 'dressers', name: 'Dressers & Mirrors', icon: 'fa-mirror' },
  { id: 'bed-panelling', name: 'Bed Panelling', icon: 'fa-border-all' },
  { id: 'dining-tables', name: 'Dining Tables', icon: 'fa-utensils' },
  { id: 'dining-table', name: 'Dining Table', icon: 'fa-utensils' },
  { id: 'dining-chairs', name: 'Dining Chairs', icon: 'fa-chair' },
  { id: 'bar-units', name: 'Bar Units', icon: 'fa-glass-martini-alt' },
  { id: 'bar-unit', name: 'Bar Unit', icon: 'fa-glass-martini-alt' },
  { id: 'crockery-units', name: 'Crockery Units', icon: 'fa-box' },
  { id: 'crockery-unit', name: 'Crockery Unit', icon: 'fa-box' },
  { id: 'kitchen-cabinets', name: 'Kitchen Cabinets', icon: 'fa-cabinet-filing' },
  { id: 'storage-units', name: 'Storage Units', icon: 'fa-archive' },
  { id: 'storage-solution', name: 'Storage Solution', icon: 'fa-archive' },
  { id: 'pooja-units', name: 'Pooja Units', icon: 'fa-praying-hands' },
  { id: 'pooja-unit', name: 'Pooja Unit', icon: 'fa-praying-hands' },
  { id: 'office-tables', name: 'Office Tables', icon: 'fa-laptop' },
  { id: 'office-chairs', name: 'Office Chairs', icon: 'fa-chair' },
  { id: 'filing-cabinets', name: 'Filing Cabinets', icon: 'fa-folder' },
  { id: 'study-tables', name: 'Study Tables', icon: 'fa-book' },
  { id: 'shoe-racks', name: 'Shoe Racks', icon: 'fa-shoe-prints' },
  { id: 'shoe-rack', name: 'Shoe Rack', icon: 'fa-shoe-prints' },
  { id: 'console-tables', name: 'Console Tables', icon: 'fa-table' },
  { id: 'coat-racks', name: 'Coat Racks', icon: 'fa-tshirt' },
  { id: 'kids-beds', name: 'Kids Beds', icon: 'fa-bed' },
  { id: 'study-desks', name: 'Study Desks', icon: 'fa-book' },
  { id: 'toy-storage', name: 'Toy Storage', icon: 'fa-box' },
  { id: 'kids-chairs', name: 'Kids Chairs', icon: 'fa-chair' },
  { id: 'garden-chairs', name: 'Garden Chairs', icon: 'fa-chair' },
  { id: 'balcony-sets', name: 'Balcony Sets', icon: 'fa-leaf' },
  { id: 'outdoor-tables', name: 'Outdoor Tables', icon: 'fa-table' },
  { id: 'swing-chairs', name: 'Swing Chairs', icon: 'fa-chair' },
  { id: 'wall-shelves', name: 'Wall Shelves', icon: 'fa-border-all' },
  { id: 'home-decor', name: 'Home Decor', icon: 'fa-spa' },
  { id: 'plant-stands', name: 'Plant Stands', icon: 'fa-leaf' },
  { id: 'ceiling', name: 'Ceiling', icon: 'fa-home' },
  { id: 'door', name: 'Door', icon: 'fa-door-open' },
];

const roomCategories = [
  { id: 'bedroom', name: 'Bedroom', icon: 'fa-bed' },
  { id: 'living-room', name: 'Living Room', icon: 'fa-couch' },
  { id: 'dining-room', name: 'Dining Room', icon: 'fa-utensils' },
  { id: 'kitchen', name: 'Kitchen', icon: 'fa-hat-chef' },
  { id: 'office', name: 'Office', icon: 'fa-briefcase' },
  { id: 'entryway', name: 'Entryway', icon: 'fa-door-open' },
  { id: 'kids-room', name: 'Kids Room', icon: 'fa-child' },
  { id: 'pooja-room', name: 'Pooja Room', icon: 'fa-praying-hands' },
  { id: 'outdoor', name: 'Outdoor', icon: 'fa-tree' },
  { id: 'decor', name: 'Decor', icon: 'fa-spa' },
];

const subCategories: Record<string, { id: string; name: string }[]> = {
  bedroom: [
    { id: 'beds', name: 'Beds' },
    { id: 'wardrobes', name: 'Wardrobes' },
    { id: 'mattresses', name: 'Mattresses' },
    { id: 'bedside-tables', name: 'Bedside Tables' },
    { id: 'dressers', name: 'Dressers & Mirrors' },
    { id: 'bedroom benches', name: 'Benches' },
  ],
  'living-room': [
    { id: 'sofas', name: 'Sofas' },
    { id: 'sofa-cum-beds', name: 'Sofa Cum Beds' },
    { id: 'coffee-tables', name: 'Coffee Tables' },
    { id: 'tv-cabinets', name: 'TV Cabinets' },
    { id: 'recliners', name: 'Recliners' },
    { id: 'bookshelves', name: 'Bookshelves' },
    { id: 'living-room benches', name: 'Benches' },
    { id: 'side-tables', name: 'Side Tables' },
  ],
  'dining-room': [
    { id: 'dining-tables', name: 'Dining Tables' },
    { id: 'dining-chairs', name: 'Dining Chairs' },
    { id: 'bar-units', name: 'Bar Units' },
    { id: 'crockery-units', name: 'Crockery Units' },
    { id: 'dining-room benches', name: 'Benches' },
  ],
  kitchen: [
    { id: 'kitchen-cabinets', name: 'Kitchen Cabinets' },
    { id: 'kitchen-tables', name: 'Kitchen Tables' },
    { id: 'kitchen-chairs', name: 'Kitchen Chairs' },
    { id: 'storage-units', name: 'Storage Units' },
    { id: 'kitchen-trolleys', name: 'Trolleys' },
  ],
  office: [
    { id: 'office-tables', name: 'Office Tables' },
    { id: 'office-chairs', name: 'Office Chairs' },
    { id: 'filing-cabinets', name: 'Filing Cabinets' },
    { id: 'study-tables', name: 'Study Tables' },
    { id: 'bookshelves', name: 'Bookshelves' },
    { id: 'office-storage', name: 'Storage Cabinets' },
  ],
  entryway: [
    { id: 'shoe-racks', name: 'Shoe Racks' },
    { id: 'console-tables', name: 'Console Tables' },
    { id: 'coat-racks', name: 'Coat Racks' },
    { id: 'benches', name: 'Entryway Benches' },
  ],
  'kids-room': [
    { id: 'kids-beds', name: 'Kids Beds' },
    { id: 'study-desks', name: 'Study Desks' },
    { id: 'toy-storage', name: 'Toy Storage' },
    { id: 'kids-chairs', name: 'Kids Chairs' },
    { id: 'bookshelves', name: 'Bookshelves' },
  ],
  'pooja-room': [
    { id: 'pooja-units', name: 'Pooja Units' },
    { id: 'temple-cabinets', name: 'Temple Cabinets' },
  ],
  outdoor: [
    { id: 'garden-chairs', name: 'Garden Chairs' },
    { id: 'balcony-sets', name: 'Balcony Sets' },
    { id: 'outdoor-tables', name: 'Outdoor Tables' },
    { id: 'swing-chairs', name: 'Swing Chairs' },
  ],
  decor: [
    { id: 'mirrors', name: 'Mirrors' },
    { id: 'wall-shelves', name: 'Wall Shelves' },
    { id: 'home-decor', name: 'Home Decor Items' },
    { id: 'plant-stands', name: 'Plant Stands' },
  ],
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('pooja-room');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryDropdownOpen, setGalleryDropdownOpen] = useState(false);
  const gallerySearchRef = useRef<HTMLDivElement>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    rating: '4.0',
    category: 'pooja-units',
    description: '',
  });
  const [selectedRoom, setSelectedRoom] = useState('pooja-room');
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const roomDropdownRef = useRef<HTMLDivElement>(null);
  const [productImage, setProductImage] = useState<string>('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmOpen(true);
  };

  const fetchTabData = async () => {
    try {
      if (activeTab === 'reviews') {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : (data.reviews || []));
      } else if (activeTab === 'gallery') {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        setGalleryImages(Array.isArray(data) ? data : (data.images || []));
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data.orders || []));
      } else if (activeTab === 'products') {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : (data.products || []));
      } else if (activeTab === 'contacts') {
        const res = await fetch('/api/contacts');
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : (data.contacts || []));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // Check if user is admin and load all data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user?.isAdmin) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.log('Auth check failed');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(e.target as Node)) {
        setRoomDropdownOpen(false);
        setSubDropdownOpen(false);
        setGalleryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAdmin) return;
    fetchTabData();
  }, [activeTab, isAdmin]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.log('Logout failed');
    }
    window.location.replace('/');
  };

  const approveReview = async (id: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true }),
    });
    fetchTabData();
  };

  const deleteReview = async (id: string) => {
    openConfirm('Are you sure you want to delete this review?', async () => {
      await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      fetchTabData();
      showToast('Review deleted successfully!');
    });
  };

  const deleteGalleryImage = async (id: string) => {
    openConfirm('Are you sure you want to delete this image?', async () => {
      await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      fetchTabData();
      showToast('Image deleted successfully!');
    });
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async () => {
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: selectedCategory,
            url: reader.result,
          }),
        });
        fetchTabData();
        showToast('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 4MB.');
      return;
    }
    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageData = productImage;
    if (!imageData && productImageFile) {
      imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(productImageFile);
      });
    }

    if (!imageData) {
      alert('Please select a product image');
      return;
    }

    setUploadingProduct(true);
    try {
      const body: Record<string, unknown> = {
        name: productForm.name,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice) || Number(productForm.price),
        rating: Number(productForm.rating),
        category: productForm.category,
        description: productForm.description,
        image: imageData,
      };

      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      if (editingProduct) {
        body.id = editingProduct._id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setProductForm({ name: '', price: '', originalPrice: '', rating: '4.0', category: subCategories[selectedRoom][0].id, description: '' });
        setProductImage('');
        setProductImageFile(null);
        setEditingProduct(null);
        fetchTabData();
        showToast(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        alert(data.details || data.error || 'Failed to save product');
      }
    } catch {
      alert('Failed to save product. Please try again.');
    } finally {
      setUploadingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    openConfirm('Are you sure you want to delete this product?', async () => {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      fetchTabData();
      showToast('Product deleted successfully!');
    });
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      rating: String(product.rating),
      category: product.category,
      description: product.description || '',
    });
    setProductImage(product.image);
    // Find which room this subcategory belongs to
    const foundRoom = roomCategories.find(room =>
      subCategories[room.id]?.some(sub => sub.id === product.category)
    );
    setSelectedRoom(foundRoom?.id || roomCategories[0].id);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', originalPrice: '', rating: '4.0', category: subCategories['pooja-room'][0].id, description: '' });
    setProductImage('');
    setProductImageFile(null);
    setSelectedRoom('pooja-room');
  };

  const filteredImages = galleryImages.filter(img => img.category === selectedCategory);
  const filteredGalleryCats = galleryCategories.filter(cat =>
    cat.name.toLowerCase().includes(gallerySearch.toLowerCase())
  );
  const pendingReviews = reviews.filter(r => !r.approved);

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1><i className="fas fa-chair"></i> Ananya Admin</h1>
          <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1><i className="fas fa-lock"></i> Access Denied</h1>
          <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>
            You do not have admin privileges to access this page.
          </p>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '1.2rem' }}>
            <a href="/" style={{ color: '#a27341' }}>Go back to homepage</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast && (
        <div className="admin-toast">
          <i className="fas fa-check-circle"></i> {toast}
        </div>
      )}
      <div className="admin-header">
        <h1><i className="fas fa-chair"></i> Ananya Admin Panel</h1>
        <div className="header-actions">
          <a href="/" className="btn-back"><i className="fas fa-arrow-left"></i> Back to Website</a>
          <button className="btn-logout" onClick={logout}><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
          <i className="fas fa-star"></i> Reviews ({pendingReviews.length})
        </button>
        <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>
          <i className="fas fa-images"></i> Gallery ({galleryImages.length})
        </button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          <i className="fas fa-box"></i> Products ({products.length})
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          <i className="fas fa-shopping-cart"></i> Orders ({orders.length})
        </button>
        <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>
          <i className="fas fa-envelope"></i> Contacts ({contacts.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <div className="reviews-section-header">
              <h2>Customer Reviews</h2>
              <span className="badge-pending">{pendingReviews.length} Pending</span>
            </div>
            {pendingReviews.length === 0 ? (
              <div className="reviews-empty">
                <i className="fas fa-check-circle"></i>
                <p>No pending reviews — all caught up!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {pendingReviews.map(review => (
                  <div key={review._id} className="review-admin-card">
                    <div className="review-admin-left">
                      {review.photo ? (
                        <img src={review.photo} alt={review.name} className="review-admin-photo" />
                      ) : (
                        <div className="review-admin-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="review-admin-body">
                      <div className="review-admin-meta">
                        <h3>{review.name}</h3>
                        <span className="review-location"><i className="fas fa-map-marker-alt"></i> {review.location}</span>
                        <span className="review-date"><i className="fas fa-calendar"></i> {review.date}</span>
                      </div>
                      {review.propertyType && (
                        <div className="review-project-info">
                          <span className="review-property-badge">
                            <i className="fas fa-home"></i> {review.propertyType?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {review.services && review.services.length > 0 && (
                        <div className="review-services">
                          {review.services.map((service, idx) => (
                            <span key={idx} className="review-service-tag">{service}</span>
                          ))}
                        </div>
                      )}
                      <div className="review-admin-stars">
                        {[1,2,3,4,5].map(i => (
                          <i key={i} className={`fas fa-star ${i <= review.rating ? 'filled' : 'empty'}`}></i>
                        ))}
                        <span className="rating-text">{review.rating}/5</span>
                      </div>
                      <p className="review-admin-text">"{review.text}"</p>
                    </div>
                    <div className="review-admin-actions">
                      <button className="btn-approve" onClick={() => approveReview(review._id)}>
                        <i className="fas fa-check"></i> Approve
                      </button>
                      <button className="btn-delete" onClick={() => deleteReview(review._id)}>
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-section">
            <h2>Design Gallery</h2>
            <div className="gallery-upload-row">
              <div className="gallery-search-wrap">
                <i className="fas fa-search gallery-search-icon"></i>
                <input
                  type="text"
                  className="gallery-search-input"
                  placeholder="Search category..."
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  onFocus={() => setGalleryDropdownOpen(true)}
                />
                {galleryDropdownOpen && (
                  <div className="gallery-search-dropdown">
                    {filteredGalleryCats.length === 0 ? (
                      <div className="gallery-search-empty">No category found</div>
                    ) : (
                      filteredGalleryCats.map(cat => (
                        <button
                          key={cat.id}
                          className={`gallery-search-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setGallerySearch(cat.name);
                            setGalleryDropdownOpen(false);
                          }}
                        >
                          <i className={`fas ${cat.icon}`}></i>
                          <span>{cat.name}</span>
                          {selectedCategory === cat.id && <i className="fas fa-check gallery-search-check"></i>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <label className="upload-btn gallery-upload-btn">
                <i className="fas fa-cloud-upload-alt"></i> Upload Image
                <input type="file" multiple accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="gallery-admin-meta">
              <span className="gallery-admin-count">
                <i className="fas fa-images"></i>
                {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
                in <strong>{galleryCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}</strong>
              </span>
            </div>

            <div className="gallery-grid-admin">
              {filteredImages.map(img => (
                <div key={img._id} className="gallery-item-admin">
                  <img src={img.url} alt={img.category} />
                  <div className="gallery-item-overlay">
                    <span className="gallery-item-cat">{galleryCategories.find(c => c.id === img.category)?.name || img.category}</span>
                    <button className="delete-btn" onClick={() => deleteGalleryImage(img._id)}>
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filteredImages.length === 0 && (
              <div className="gallery-empty-state">
                <i className="fas fa-image"></i>
                <p>No images in this category</p>
                <span>Upload images using the button above</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <form className="product-upload-form" onSubmit={handleProductSubmit}>

              {/* Header */}
              <h2>
                <i className="fas fa-plus-circle"></i>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              {/* Basic Info Section */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fas fa-info-circle"></i>
                  Basic Information
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className="box"
                      placeholder="e.g. Premium Pooja Unit"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating (out of 5)</label>
                    <input
                      type="number"
                      className="box"
                      placeholder="4.5"
                      value={productForm.rating}
                      onChange={e => setProductForm({ ...productForm, rating: e.target.value })}
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="box"
                      placeholder="Describe the product features, material, dimensions..."
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Category Section */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fas fa-tag"></i>
                  Category & Pricing
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <div className="room-sub-picker" ref={roomDropdownRef}>
                      <div className="cat-stack">
                        <div className="cat-row">
                          <span className="cat-label">Category</span>
                          <button
                            type="button"
                            className={`room-btn ${roomDropdownOpen ? 'active' : ''}`}
                            onClick={() => { setRoomDropdownOpen(o => !o); setSubDropdownOpen(false); }}
                          >
                            <i className={`fas ${roomCategories.find(r => r.id === selectedRoom)?.icon || 'fa-home'}`}></i>
                            <span>{roomCategories.find(r => r.id === selectedRoom)?.name || 'Select Category'}</span>
                            <i className={`fas fa-chevron-down chevron ${roomDropdownOpen ? 'open' : ''}`}></i>
                          </button>
                        </div>

                        {roomDropdownOpen && (
                          <div className="room-panel">
                            {roomCategories.map(room => (
                              <button
                                key={room.id}
                                type="button"
                                className={`room-option ${selectedRoom === room.id ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedRoom(room.id);
                                  setProductForm(f => ({
                                    ...f,
                                    category: subCategories[room.id]?.[0]?.id || room.id,
                                  }));
                                  setRoomDropdownOpen(false);
                                }}
                              >
                                <i className={`fas ${room.icon}`}></i>
                                <span>{room.name}</span>
                                {selectedRoom === room.id && <i className="fas fa-check check"></i>}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="cat-row">
                          <span className="cat-label">Subcategory</span>
                          <button
                            type="button"
                            className={`room-btn sub-btn ${subDropdownOpen ? 'active' : ''}`}
                            onClick={() => { setSubDropdownOpen(o => !o); setRoomDropdownOpen(false); }}
                          >
                            <i className="fas fa-th-large"></i>
                            <span>{subCategories[selectedRoom]?.find(s => s.id === productForm.category)?.name || 'Select Subcategory'}</span>
                            <i className={`fas fa-chevron-down chevron ${subDropdownOpen ? 'open' : ''}`}></i>
                          </button>
                        </div>

                        {subDropdownOpen && (
                          <div className="room-panel sub">
                            {subCategories[selectedRoom]?.map(sub => (
                              <button
                                key={sub.id}
                                type="button"
                                className={`room-option ${productForm.category === sub.id ? 'selected' : ''}`}
                                onClick={() => {
                                  setProductForm(f => ({ ...f, category: sub.id }));
                                  setSubDropdownOpen(false);
                                }}
                              >
                                <span>{sub.name}</span>
                                {productForm.category === sub.id && <i className="fas fa-check check"></i>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      className="box"
                      placeholder="9999"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Original Price (₹)</label>
                    <input
                      type="number"
                      className="box"
                      placeholder="13999"
                      value={productForm.originalPrice}
                      onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="form-section">
                <div className="form-section-title">
                  <i className="fas fa-image"></i>
                  Product Image
                </div>
                <div className="image-upload-area">
                  <label className="upload-btn">
                    <i className="fas fa-cloud-upload-alt"></i>
                    {productImage ? 'Change Image' : 'Select Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      style={{ display: 'none' }}
                      required={!editingProduct && !productImage}
                    />
                  </label>
                  {productImage && (
                    <div className="image-preview">
                      <img src={productImage} alt="Product preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => { setProductImage(''); setProductImageFile(null); }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions">
                {editingProduct && (
                  <button type="button" className="btn-cancel" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn" disabled={uploadingProduct}>
                  {uploadingProduct ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-check"></i> {editingProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
              </div>
            </form>

            {/* Product List */}
            {products.length > 0 && (
              <>
                <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>
                  <i className="fas fa-list"></i> Product List ({products.length})
                </h2>
                <div className="product-cards-admin">
                  {products.map(product => (
                    <div key={product._id} className="product-card-admin">
                      <img src={product.image} alt={product.name} />
                      <div className="product-card-info">
                        <h3>{product.name}</h3>
                        <p className="product-category">{product.category}</p>
                        <p className="product-price">
                          <span className="current-price">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <div className="product-card-actions">
                        <button className="btn-edit" onClick={() => startEditProduct(product)}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteProduct(product._id)}>
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Orders</h2>
            {orders.length === 0 ? (
              <p className="empty-msg">No orders yet</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order.date}</td>
                      <td>{order.customerInfo?.name}</td>
                      <td>{order.customerInfo?.phone}</td>
                      <td>{order.items?.length}</td>
                      <td>Rs.{order.total?.toLocaleString()}</td>
                      <td>{order.paymentMethod}</td>
                      <td><span className="status-badge">{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="contacts-section">
            <h2>Contact Form Submissions</h2>
            {contacts.length === 0 ? (
              <p className="empty-msg">No contact submissions yet</p>
            ) : (
              <div className="contacts-list">
                {contacts.map(contact => (
                  <div key={contact._id} className="contact-admin-card">
                    <div className="contact-admin-header">
                      <div className="contact-admin-info">
                        <h3>{contact.name}</h3>
                        <span className={`contact-status ${contact.status || 'new'}`}>
                          {contact.status || 'new'}
                        </span>
                      </div>
                      <span className="contact-date">{new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="contact-admin-details">
                      <p><i className="fas fa-phone"></i> {contact.phone}</p>
                      <p><i className="fas fa-envelope"></i> {contact.email}</p>
                      <p><i className="fas fa-tag"></i> {contact.projectType}</p>
                    </div>
                    <div className="contact-admin-message">
                      <p>{contact.message}</p>
                    </div>
                    <div className="contact-admin-actions">
                      <a href={`tel:${contact.phone}`} className="btn-call">
                        <i className="fas fa-phone"></i> Call
                      </a>
                      <a href={`mailto:${contact.email}`} className="btn-email">
                        <i className="fas fa-envelope"></i> Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="confirm-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3>Confirm Delete</h3>
            <p>{confirmMessage}</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button
                className="confirm-delete"
                onClick={() => {
                  if (confirmAction) confirmAction();
                  setConfirmOpen(false);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
