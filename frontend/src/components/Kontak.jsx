// frontend/src/components/Kontak.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GetKontak, AddKontak, UpdateKontak, DeleteKontak } from "../api/backendApi";
import Alert from "./Alert";
import Modal from "./Modal";
import Loading from "./Loading";
import { TEMPLATE_KONTAK } from "../utils/helpers";
import {
  Share2,
  Pencil,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  Link2,
  Plus
} from "lucide-react";

// Icon 2D Vektor untuk Brand Populer
export const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Helper memilih 2D icon berdasarkan nama media
export const get2DContactIcon = (namaMedia, size = 18) => {
  if (!namaMedia) return <Globe size={size} />;
  const n = namaMedia.toLowerCase();
  if (n.includes("wa") || n.includes("whatsapp")) return <MessageCircle size={size} />;
  if (n.includes("email") || n.includes("mail")) return <Mail size={size} />;
  if (n.includes("linkedin")) return <LinkedinIcon size={size} />;
  if (n.includes("github")) return <GithubIcon size={size} />;
  if (n.includes("instagram")) return <InstagramIcon size={size} />;
  if (n.includes("other") || n.includes("link")) return <Link2 size={size} />;
  if (n.includes("telepon") || n.includes("phone") || n.includes("hp")) return <Phone size={size} />;
  return <Globe size={size} />;
};

const Kontak = () => {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ nama_media: "", url: "" });
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await GetKontak(token);
      if (res.data.status === "success") setList(res.data.kontak_aktif);
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal mengambil data kontak" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenModal = (item = null) => {
    setEditData(item);
    setFormData(item ? { nama_media: item.nama_media, url: item.url } : { nama_media: "", url: "" });
    setIsModalOpen(true);
  };

  // Pilih template kontak siap pakai
  const handleSelectTemplate = (template) => {
    setEditData(null);
    setFormData({
      nama_media: template.nama,
      url: template.prefix
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_media.trim() || !formData.url.trim()) {
      setAlert({ show: true, type: "error", message: "Nama media dan URL harus diisi" });
      return;
    }

    try {
      const payload = {
        id: editData ? editData.id : undefined,
        nama_media: formData.nama_media.trim(),
        url: formData.url.trim(),
        token
      };

      let res = editData ? await UpdateKontak(payload) : await AddKontak(payload);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menyimpan data kontak" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus kontak ini?")) return;
    try {
      const res = await DeleteKontak(id, token);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menghapus kontak" });
    }
  };

  if (loading) return <Loading title="Memuat Kontak..." />;

  return (
    <div className="modern-card">
      <Alert alert={alert} setAlert={setAlert} />

      {/* Header Bagian */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Share2 size={20} color="var(--accent-primary)" /> Kelola Kontak & Tautan
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Pilih template di bawah untuk menambahkan tautan komunikasi atau profil sosial.
          </p>
        </div>
      </div>

      {/* Template Kontak: WhatsApp, Email, LinkedIn, GitHub, Instagram, Other Link */}
      <div style={{ marginBottom: "20px" }}>
        <div className="quick-templates-grid">
          {TEMPLATE_KONTAK.map((tpl) => (
            <button
              key={tpl.nama}
              type="button"
              className="template-chip"
              onClick={() => handleSelectTemplate(tpl)}
            >
              {get2DContactIcon(tpl.nama, 16)}
              <span>+ {tpl.nama}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modern Interactive Data List Card */}
      <div className="data-list">
        {list.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "36px 20px",
            border: "1px dashed var(--border)",
            borderRadius: "14px",
            color: "var(--text-secondary)"
          }}>
            Belum ada data kontak aktif. Klik template di atas atau tambah kontak baru.
          </div>
        ) : (
          list.map((item) => (
            <div key={item.id} className="data-card-item">
              <div className="data-card-left">
                <div className="data-icon-circle">
                  {get2DContactIcon(item.nama_media, 20)}
                </div>
                <div className="data-card-content">
                  <div className="data-card-title">{item.nama_media}</div>
                  <div className="data-card-subtitle">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--accent-primary)",
                        textDecoration: "none",
                        wordBreak: "break-all"
                      }}
                    >
                      {item.url} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons Redesign (Ghost edit + subtle red delete) */}
              <div className="data-actions">
                <button
                  className="btn-ghost"
                  onClick={() => handleOpenModal(item)}
                  title="Edit data kontak"
                >
                  <Pencil size={14} /> <span>Edit</span>
                </button>
                <button
                  className="btn-danger-subtle"
                  onClick={() => handleDelete(item.id)}
                  title="Hapus kontak"
                >
                  <Trash2 size={14} /> <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Kontak" : "Tambah Kontak"}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nama Media / Platform</label>
            <input
              type="text"
              value={formData.nama_media}
              onChange={(e) => setFormData({ ...formData, nama_media: e.target.value })}
              placeholder="Contoh: WhatsApp, LinkedIn, GitHub, Email"
              required
            />
          </div>

          <div>
            <label>Tautan URL Lengkap</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="Contoh: https://wa.me/628123456789 atau https://linkedin.com/in/username"
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
            <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary-add">
              Simpan Kontak
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Kontak;