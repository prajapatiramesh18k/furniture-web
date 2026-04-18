'use client';
import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo?: string;
  date: string;
  approved: boolean;
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
  { id: 'pooja-unit', name: 'Pooja Unit' },
  { id: 'tv-unit', name: 'TV Unit' },
  { id: 'bed-panelling', name: 'Bed Panelling' },
  { id: 'dining-table', name: 'Dining Table' },
  { id: 'bar-unit', name: 'Bar Unit' },
  { id: 'almirah', name: 'Almirah' },
  { id: 'crockery-unit', name: 'Crockery Unit' },
  { id: 'shoe-rack', name: 'Shoe Rack' },
  { id: 'ceiling', name: 'Ceiling' },
  { id: 'door', name: 'Door' },
  { id: 'office', name: 'Office' },
  { id: 'living-room', name: 'Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'dining-room', name: 'Dining Room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'entryway', name: 'Entryway' },
  { id: 'kids-room', name: 'Kids Room' },
];

const productCategories = [
  { id: 'pooja-unit', name: 'Pooja Unit' },
  { id: 'tv-unit', name: 'TV Unit' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'living-room', name: 'Living Room' },
  { id: 'dining-room', name: 'Dining Room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'office', name: 'Office' },
  { id: 'entryway', name: 'Entryway' },
  { id: 'kids-room', name: 'Kids Room' },
];

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('pooja-unit');
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    rating: '4.0',
    category: 'pooja-unit',
    description: '',
  });
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
        const reviewsArray = Array.isArray(data) ? data : (data.reviews || []);
        setReviews(reviewsArray);
      } else if (activeTab === 'gallery') {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        const galleryArray = Array.isArray(data) ? data : (data.images || []);
        setGalleryImages(galleryArray);
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/orders');
        const data = await res.json();
        const ordersArray = Array.isArray(data) ? data : (data.orders || []);
        setOrders(ordersArray);
      } else if (activeTab === 'products') {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
      } else if (activeTab === 'contacts') {
        const res = await fetch('/api/contacts');
        const data = await res.json();
        const contactsArray = Array.isArray(data) ? data : (data.contacts || []);
        setContacts(contactsArray);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // Check if user is admin
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

  // Fetch data only for the active tab
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
    setProductImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productImage && !productImageFile) {
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
      };

      if (productImage) {
        body.image = productImage;
      }

      const url = editingProduct
        ? '/api/admin/products'
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      if (editingProduct) {
        body.id = editingProduct._id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setProductForm({ name: '', price: '', originalPrice: '', rating: '4.0', category: 'pooja-unit', description: '' });
        setProductImage('');
        setProductImageFile(null);
        setEditingProduct(null);
        fetchTabData();
      } else {
        alert('Failed to save product');
      }
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
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', originalPrice: '', rating: '4.0', category: 'pooja-unit', description: '' });
    setProductImage('');
    setProductImageFile(null);
  };

  const filteredImages = galleryImages.filter(img => img.category === selectedCategory);
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
            <div className="upload-area">
              <label className="upload-btn">
                <i className="fas fa-upload"></i> Upload Images
                <input type="file" multiple accept="image/*" onChange={uploadImage} style={{ display: 'none' }} />
              </label>
            </div>
            <div className="admin-category-grid">
              {galleryCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`admin-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="gallery-grid-admin">
              {filteredImages.map(img => (
                <div key={img._id} className="gallery-item-admin">
                  <img src={img.url} alt={img.category} />
                  <button className="delete-btn" onClick={() => deleteGalleryImage(img._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
            {filteredImages.length === 0 && (
              <p className="empty-msg">No images in this category</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form className="product-upload-form" onSubmit={handleProductSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    className="box"
                    placeholder="e.g. Pooja Unit Premium"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="box"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    {productCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label>Rating</label>
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

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="box"
                  placeholder="Product description..."
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Product Image *</label>
                <div className="image-upload-area">
                  <label className="upload-btn">
                    <i className="fas fa-image"></i> {productImage ? 'Change Image' : 'Select Image'}
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

              <div className="form-actions">
                <button type="submit" className="btn" disabled={uploadingProduct}>
                  {uploadingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                {editingProduct && (
                  <button type="button" className="btn-cancel" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2 style={{ marginTop: '3rem' }}>Existing Products ({products.length})</h2>
            {products.length === 0 ? (
              <p className="empty-msg">No products yet</p>
            ) : (
              <div className="products-grid-admin">
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
