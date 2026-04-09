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
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('pooja-unit');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Product form state
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
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('adminLoggedIn');
    if (logged === 'true') setLoggedIn(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchData();
    }
  }, [loggedIn]);

  const fetchData = async () => {
    const [reviewsRes, galleryRes, ordersRes, productsRes] = await Promise.all([
      fetch('/api/admin/reviews'),
      fetch('/api/admin/gallery'),
      fetch('/api/orders'),
      fetch('/api/admin/products'),
    ]);
    const reviewsData = await reviewsRes.json();
    const galleryData = await galleryRes.json();
    const ordersData = await ordersRes.json();
    const productsData = await productsRes.json();
    setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || []);
    setGalleryImages(Array.isArray(galleryData) ? galleryData : galleryData.images || []);
    setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders || []);
    setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUsername', email);
      setLoggedIn(true);
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.replace('/');
  };

  const approveReview = async (id: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true }),
    });
    fetchData();
  };

  const deleteReview = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      onConfirm: async () => {
        await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
        setConfirmDialog(prev => ({ ...prev, open: false }));
        fetchData();
      },
    });
  };

  const deleteGalleryImage = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Image',
      message: 'Are you sure you want to delete this gallery image? This action cannot be undone.',
      onConfirm: async () => {
        await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
        setConfirmDialog(prev => ({ ...prev, open: false }));
        fetchData();
      },
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
        fetchData();
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
        fetchData();
      } else {
        alert('Failed to save product');
      }
    } finally {
      setUploadingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        setConfirmDialog(prev => ({ ...prev, open: false }));
        fetchData();
      },
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

  if (!mounted) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1><i className="fas fa-chair"></i> Ananya Admin</h1>
          <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1><i className="fas fa-chair"></i> Ananya Admin</h1>
          <form onSubmit={handleLogin}>
            <input type="email" name="email" placeholder="Email" className="box" required />
            <input type="password" name="password" placeholder="Password" className="box" required />
            {loginError && <p style={{ color: 'red', fontSize: '1.3rem', margin: '0.5rem 0' }}>{loginError}</p>}
            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredImages = galleryImages.filter(img => img.category === selectedCategory);
  const pendingReviews = reviews.filter(r => !r.approved);

  return (
    <div className="admin-container" style={{ display: loggedIn ? 'block' : 'none' }}>
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
          <i className="fas fa-images"></i> Gallery
        </button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          <i className="fas fa-box"></i> Products ({products.length})
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          <i className="fas fa-shopping-cart"></i> Orders ({orders.length})
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
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="confirm-overlay" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              >
                Cancel
              </button>
              <button className="confirm-delete" onClick={confirmDialog.onConfirm}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
