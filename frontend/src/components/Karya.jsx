// frontend/src/components/Karya.jsx
import { useState, useEffect } from 'react';
import { GetKarya, AddKarya, UpdateKarya, DeleteKarya, delay } from '../api/backendApi';
import Modal from './Modal';
import Alert from './Alert';
import Loading from './Loading';
import { useAuth } from '../context/AuthContext';
import { formatGoogleDriveImage } from '../utils/helpers';
import { FolderGit2, Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

const Karya = ({ token: propsToken }) => {
  const { token: contextToken } = useAuth();
  const token = propsToken || contextToken;

  const [list, setList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ nama_karya: '', deskripsi: '', url: '', gambar: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // 1. Ambil data dari server
  const fetchData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetKarya(token), delay(200)]);
      if (res.data.status === 'success') {
        setList(res.data.karya_terbaik || []);
      }
    } catch (err) {
      setAlert({ show: true, message: 'Gagal memuat data project', type: 'error' });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // 2. Tombol Tambah Baru
  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm({ nama_karya: '', deskripsi: '', url: '', gambar: '' });
    setIsOpen(true);
  };

  // 3. Tombol Edit
  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setForm({
      nama_karya: item.nama_karya || '',
      deskripsi: item.deskripsi || '',
      url: item.url || '',
      gambar: item.gambar || ''
    });
    setIsOpen(true);
  };

  // 4. Simpan Form (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_karya.trim() || !form.deskripsi.trim()) {
      setAlert({ show: true, message: 'Nama project dan deskripsi wajib diisi', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nama_karya: form.nama_karya.trim(),
        deskripsi: form.deskripsi.trim(),
        url: form.url.trim(),
        gambar: form.gambar.trim(),
        token
      };

      if (isEdit) {
        payload.id = currentId;
        await UpdateKarya(payload);
        setAlert({ show: true, message: 'Project berhasil diperbarui!', type: 'success' });
      } else {
        await AddKarya(payload);
        setAlert({ show: true, message: 'Project berhasil ditambahkan!', type: 'success' });
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: 'Gagal menyimpan project', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Hapus Data (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus project ini?')) return;
    try {
      await DeleteKarya(id, token);
      setAlert({ show: true, message: 'Project berhasil dihapus!', type: 'success' });
      fetchData();
    } catch (err) {
      setAlert({ show: true, message: 'Gagal menghapus project', type: 'error' });
    }
  };

  return (
    <div className="modern-card">
      <Alert alert={alert} setAlert={setAlert} />

      {/* Header Bagian */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderGit2 size={20} color="var(--accent-primary)" /> Kelola Daftar Project
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Daftar karya dan portofolio project yang dilengkapi tangkapan layar dan tautan demonstrasi.
          </p>
        </div>

        <button className="btn-primary-add" onClick={handleOpenAdd} type="button">
          <Plus size={16} /> Tambah Project
        </button>
      </div>

      {isLoadingData ? (
        <Loading type="inline" title="Memuat project..." />
      ) : (
        <div className="data-list">
          {list.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '36px 20px',
              border: '1px dashed var(--border)',
              borderRadius: '14px',
              color: 'var(--text-secondary)'
            }}>
              Belum ada data project. Tambahkan project unggulan Anda sekarang.
            </div>
          ) : (
            list.map((item) => {
              const displayImg = formatGoogleDriveImage(item.gambar);
              return (
                <div key={item.id} className="data-card-item">
                  <div className="data-card-left">
                    {/* Thumbnail Project */}
                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={item.nama_karya}
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          flexShrink: 0
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="data-icon-circle" style={{ width: '56px', height: '56px', borderRadius: '10px' }}>
                        <ImageIcon size={22} />
                      </div>
                    )}

                    <div className="data-card-content">
                      <div className="data-card-title">{item.nama_karya}</div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '140%' }}>
                        {item.deskripsi}
                      </p>
                      {item.url && (
                        <div className="data-card-subtitle">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--accent-primary)',
                              textDecoration: 'none',
                              fontSize: '13px',
                              fontWeight: '500'
                            }}
                          >
                            Kunjungi Tautan <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Redesign */}
                  <div className="data-actions">
                    <button
                      className="btn-ghost"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit project"
                    >
                      <Pencil size={14} /> <span>Edit</span>
                    </button>
                    <button
                      className="btn-danger-subtle"
                      onClick={() => handleDelete(item.id)}
                      title="Hapus project"
                    >
                      <Trash2 size={14} /> <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEdit ? 'Edit Project' : 'Tambah Project Baru'}
        isLoading={isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nama Project</label>
            <input
              type="text"
              required
              value={form.nama_karya}
              onChange={(e) => setForm({ ...form, nama_karya: e.target.value })}
              placeholder="Contoh: E-Commerce Storefront, Sistem Presensi, dll"
            />
          </div>

          <div>
            <label>Deskripsi Project</label>
            <textarea
              required
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Jelaskan ringkas mengenai project, fitur unggulan, dan teknologi yang dipakai..."
            />
          </div>

          <div>
            <label>Link Gambar / Screenshot (Mendukung Link Google Drive)</label>
            <input
              type="text"
              value={form.gambar}
              onChange={(e) => setForm({ ...form, gambar: e.target.value })}
              placeholder="https://drive.google.com/file/d/... atau https://..."
            />
            <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '14px', fontSize: '12px' }}>
              Bisa langsung paste link Google Drive (pastikan opsi berbagi 'Siapa saja yang memiliki link').
            </small>

            {form.gambar && (
              <div style={{ marginBottom: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Preview Gambar:</p>
                <img
                  src={formatGoogleDriveImage(form.gambar)}
                  alt="Preview"
                  style={{ maxHeight: '130px', maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'cover' }}
                  onError={(e) => { e.target.alt = 'Gagal memuat gambar'; }}
                />
              </div>
            )}
          </div>

          <div>
            <label>Tautan / URL Project (Website Demo atau GitHub)</label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://github.com/username/project atau https://website.com"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn-ghost" onClick={() => setIsOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary-add" disabled={isSubmitting}>
              {isEdit ? 'Simpan Perubahan' : 'Tambah Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Karya;