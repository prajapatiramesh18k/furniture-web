'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface GalleryImage {
  _id: string;
  category: string;
  url: string;
  isUploaded: boolean;
}

const categoryNames: Record<string, string> = {
  'pooja-unit': 'Pooja Unit',
  'tv-unit': 'TV Unit',
  'bed-panelling': 'Bed Panelling',
  'dining-table': 'Dining Table',
  'bar-unit': 'Bar Unit',
  'almirah': 'Almirah',
  'crockery-unit': 'Crockery Unit',
  'shoe-rack': 'Shoe Rack',
  'ceiling': 'Ceiling',
  'door': 'Door',
  'office': 'Office',
  'living-room': 'Living Room',
  'bedroom': 'Bedroom',
  'dining-room': 'Dining Room',
  'kitchen': 'Kitchen',
  'entryway': 'Entryway',
  'kids-room': 'Kids Room',
};

export default function AdminGalleryCategoryPage() {
  const params = useParams();
  const category = typeof params.category === 'string' ? params.category : '';
  const categoryName = categoryNames[category] || category;

  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem('adminLoggedIn');
    if (logged === 'true') setLoggedIn(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loggedIn && category) {
      fetchImages();
    }
  }, [loggedIn, category]);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/gallery?category=${category}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            url: reader.result,
          }),
        });
        fetchImages();
      } catch (error) {
        console.error('Upload failed:', error);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      uploadImage(files[i]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        uploadImage(files[i]);
      }
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      fetchImages();
    } catch (error) {
      console.error('Delete failed:', error);
    }
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
          <p style={{ textAlign: 'center', color: '#666' }}>Please login first.</p>
          <button className="btn" onClick={() => window.location.href = '/admin'}>Go to Admin</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="fas fa-images"></i> {categoryName} Gallery</h1>
        <div className="header-actions">
          <a href="/" className="btn-back"><i className="fas fa-arrow-left"></i> Back to Website</a>
          <a href="/admin" className="btn-back" style={{ background: 'var(--primary-color)' }}><i className="fas fa-cog"></i> Admin Panel</a>
        </div>
      </div>

      <div className="admin-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: 'var(--main-color)', margin: 0 }}>
              {categoryName} ({images.length} images)
            </h2>
          </div>
          <label className="upload-btn">
            <i className="fas fa-upload"></i> {uploading ? 'Uploading...' : 'Upload Images'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <i className="fas fa-cloud-upload-alt" style={{ fontSize: '4rem', color: 'var(--primary-color)' }}></i>
          <p style={{ fontSize: '1.6rem', color: 'var(--light-black)' }}>Drag & drop images here or click Upload above</p>
        </div>

        <div className="gallery-grid-admin">
          {images.map(img => (
            <div key={img._id} className="gallery-item-admin">
              <img src={img.url} alt={img.category} />
              <div className="gallery-item-overlay">
                <button
                  className="gallery-item-delete"
                  onClick={() => deleteImage(img._id)}
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="empty-msg">
            <i className="fas fa-images" style={{ fontSize: '5rem', color: 'var(--primary-color)' }}></i>
            <p>No images in this category yet. Upload some!</p>
          </div>
        )}
      </div>
    </div>
  );
}
