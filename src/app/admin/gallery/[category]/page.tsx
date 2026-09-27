'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ModuleShell, LoadingList } from '@/components/admin/ModuleBits';
import { AdminToast } from '@/components/admin/AdminUI';

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

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [preview, setPreview] = useState<GalleryImage | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmOpen(true);
  };

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/admin/gallery?category=${category}`, { cache: 'no-store' });
      if (res.status === 401) {
        setAuthError('Your session expired. Please log in again.');
        return;
      }
      if (res.status === 403) {
        setAuthError('You do not have permission to manage gallery images.');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setImages(data);
      } else if (Array.isArray(data.images)) {
        setImages(data.images);
      }
      setAuthError('');
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            url: reader.result,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
        fetchImages();
        showToast('Image uploaded successfully! It is now visible in this category and the public gallery.');
      } catch (error) {
        console.error('Upload failed:', error);
        showToast(error instanceof Error ? error.message : 'Failed to upload image');
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
    openConfirm('Are you sure you want to delete this image?', async () => {
      try {
        const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Delete failed (${res.status})`);
        fetchImages();
        showToast('Image deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        showToast(error instanceof Error ? error.message : 'Failed to delete image');
      }
    });
  };

  if (loading) {
    return (
      <ModuleShell title={categoryName} sub="Loading images…">
        <LoadingList rows={4} />
      </ModuleShell>
    );
  }

  if (authError) {
    return (
      <ModuleShell title={categoryName} sub="Restricted area">
        <div className="ahf-panel">
          <div className="ahf-panel-body" style={{ textAlign: 'center', padding: 40 }}>
            <div className="ahf-denied-ic" style={{ marginBottom: 14 }}>
              <i className="fas fa-lock"></i>
            </div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--ahf-serif)' }}>{authError}</h3>
            <p style={{ color: 'var(--ahf-muted)', fontSize: 13.5, margin: '0 0 18px' }}>
              You need an admin session to manage gallery images.
            </p>
            <button className="ahf-btn ahf-btn-primary" onClick={() => window.location.href = '/login?next=/admin/gallery'}>Go to Login</button>
          </div>
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title={categoryName}
      sub={`${images.length} image${images.length === 1 ? '' : 's'} in this category`}
      action={(
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin/gallery" className="ahf-btn ahf-btn-ghost ahf-btn-sm">
            <i className="fas fa-arrow-left"></i> Categories
          </Link>
          <label className="ahf-btn ahf-btn-primary ahf-btn-sm" style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
            <i className="fas fa-upload"></i> {uploading ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              hidden
            />
          </label>
        </div>
      )}
    >
      <AdminToast message={toast || ''} />

      <div className="ahf-panel" style={{ marginBottom: 16 }}>
        <div className="ahf-panel-body">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: dragOver ? '1.5px dashed #a27341' : '1.5px dashed #e2d5bd',
              background: dragOver ? '#faf3e3' : '#fffdf8',
              borderRadius: 16,
              padding: '28px 20px',
              textAlign: 'center',
              color: '#8a7a66',
              fontSize: 13,
            }}
          >
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: 32, color: '#a27341', display: 'block', marginBottom: 8 }}></i>
            Drag &amp; drop images here or click Upload above
          </div>
        </div>
      </div>

      <div className="ahf-panel">
        <div className="ahf-panel-head">
            <div>
              <h3>{categoryName} ({images.length})</h3>
              <p>Click an image to view it full size · hover to delete</p>
            </div>
        </div>
        <div className="ahf-panel-body">
          {images.length === 0 ? (
            <p style={{ padding: 18, color: 'var(--ahf-muted)', fontSize: 13, textAlign: 'center' }}>
              No images in this category yet. Upload some!
            </p>
          ) : (
            <div className="ahf-pgrid">
              {images.map((img) => (
                <div key={img._id} className="ahf-pcard">
                  <img
                    src={img.url}
                    alt={img.category}
                    onClick={() => setPreview(img)}
                    title="Click to view full image"
                    style={{ cursor: 'zoom-in' }}
                  />
                  <div className="ahf-pcard-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--ahf-muted)' }}>{img.isUploaded ? 'Uploaded' : 'Linked'}</span>
                    <button
                      className="ahf-mini-btn danger"
                      onClick={() => deleteImage(img._id)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full-image preview */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.category} full image`}
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 30,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
          <img
            src={preview.url}
            alt={`${preview.category} full size`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '94vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 12 }}
          />
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmOpen}
        message={confirmMessage}
        confirmText="Yes, Delete"
        confirmButtonVariant="danger"
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </ModuleShell>
  );
}
