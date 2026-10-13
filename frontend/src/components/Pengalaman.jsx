// frontend/src/components/Pengalaman.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GetPengalaman, AddPengalaman, UpdatePengalaman, DeletePengalaman } from "../api/backendApi";
import Alert from "./Alert";
import Modal from "./Modal";
import Loading from "./Loading";
import CustomSelect from "./CustomSelect";
import { DAFTAR_BULAN } from "../utils/helpers";
import { Briefcase, Calendar, Plus, Pencil, Trash2 } from "lucide-react";

const Pengalaman = () => {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Form data terpisah untuk bulan dan tahun
  const [formData, setFormData] = useState({
    nama_perusahaan: "",
    jabatan: "",
    bulan_mulai: "",
    tahun_mulai_num: "",
    bulan_selesai: "",
    tahun_selesai_num: "",
    masih_bekerja: false
  });

  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await GetPengalaman(token);
      if (res.data.status === "success") setList(res.data.pengalaman);
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal mengambil data pengalaman" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const parseDateString = (str) => {
    if (!str) return { bulan: "", tahun: "" };
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return { bulan: parts[0], tahun: parts[1] };
    }
    return { bulan: "", tahun: str.trim() };
  };

  const handleOpenModal = (item = null) => {
    setEditData(item);
    if (item) {
      const start = parseDateString(item.tahun_mulai);
      const isSekarang = item.tahun_selesai?.toLowerCase() === "sekarang" || item.tahun_selesai?.toLowerCase() === "saat ini";
      const end = isSekarang ? { bulan: "", tahun: "" } : parseDateString(item.tahun_selesai);

      setFormData({
        nama_perusahaan: item.nama_perusahaan || "",
        jabatan: item.jabatan || "",
        bulan_mulai: start.bulan,
        tahun_mulai_num: start.tahun,
        bulan_selesai: end.bulan,
        tahun_selesai_num: end.tahun,
        masih_bekerja: isSekarang
      });
    } else {
      setFormData({
        nama_perusahaan: "",
        jabatan: "",
        bulan_mulai: "",
        tahun_mulai_num: "",
        bulan_selesai: "",
        tahun_selesai_num: "",
        masih_bekerja: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tahunMulaiFormatted = formData.bulan_mulai
      ? `${formData.bulan_mulai} ${formData.tahun_mulai_num}`.trim()
      : formData.tahun_mulai_num.trim();

    let tahunSelesaiFormatted = "Sekarang";
    if (!formData.masih_bekerja) {
      tahunSelesaiFormatted = formData.bulan_selesai
        ? `${formData.bulan_selesai} ${formData.tahun_selesai_num}`.trim()
        : formData.tahun_selesai_num.trim();
    }

    try {
      const payload = {
        id: editData ? editData.id : undefined,
        nama_perusahaan: formData.nama_perusahaan.trim(),
        jabatan: formData.jabatan.trim(),
        tahun_mulai: tahunMulaiFormatted,
        tahun_selesai: tahunSelesaiFormatted,
        token
      };

      let res = editData ? await UpdatePengalaman(payload) : await AddPengalaman(payload);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menyimpan pengalaman" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data pengalaman ini?")) return;
    try {
      const res = await DeletePengalaman(id, token);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menghapus data" });
    }
  };

  if (loading) return <Loading title="Memuat Pengalaman..." />;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 45 }, (_, i) => currentYear + 5 - i);

  return (
    <div className="modern-card">
      <Alert alert={alert} setAlert={setAlert} />

      {/* Header Bagian */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Briefcase size={20} color="var(--accent-primary)" /> Kelola Pengalaman Kerja
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Rekam jejak karier profesional, nama instansi/perusahaan, posisi, dan masa bakti kerja.
          </p>
        </div>

        <button className="btn-primary-add" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Tambah Pengalaman
        </button>
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
            Belum ada data pengalaman kerja. Tambahkan riwayat kerja Anda.
          </div>
        ) : (
          list.map((item) => (
            <div key={item.id} className="data-card-item">
              <div className="data-card-left">
                <div className="data-icon-circle">
                  <Briefcase size={20} />
                </div>
                <div className="data-card-content">
                  <div className="data-card-title">{item.jabatan}</div>
                  <div className="data-card-subtitle">
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{item.nama_perusahaan}</span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "var(--bg-secondary)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      border: "1px solid var(--border)"
                    }}>
                      <Calendar size={12} /> {item.tahun_mulai} - {item.tahun_selesai || "Sekarang"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Redesign */}
              <div className="data-actions">
                <button
                  className="btn-ghost"
                  onClick={() => handleOpenModal(item)}
                  title="Edit pengalaman"
                >
                  <Pencil size={14} /> <span>Edit</span>
                </button>
                <button
                  className="btn-danger-subtle"
                  onClick={() => handleDelete(item.id)}
                  title="Hapus pengalaman"
                >
                  <Trash2 size={14} /> <span>Hapus</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Pengalaman" : "Tambah Pengalaman"}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nama Perusahaan / Instansi</label>
            <input
              type="text"
              value={formData.nama_perusahaan}
              onChange={(e) => setFormData({ ...formData, nama_perusahaan: e.target.value })}
              placeholder="Contoh: PT Teknologi Indonesia / Startup XYZ"
              required
            />
          </div>

          <div>
            <label>Posisi / Jabatan</label>
            <input
              type="text"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              placeholder="Contoh: Web Developer / UI Designer"
              required
            />
          </div>

          {/* Opsi Bulan dan Tahun Mulai */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Waktu Mulai</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <CustomSelect
                value={formData.bulan_mulai}
                onChange={(val) => setFormData({ ...formData, bulan_mulai: val })}
                options={DAFTAR_BULAN}
                placeholder="Pilih Bulan Mulai"
              />

              <CustomSelect
                value={formData.tahun_mulai_num}
                onChange={(val) => setFormData({ ...formData, tahun_mulai_num: val })}
                options={yearOptions}
                placeholder="Pilih Tahun Mulai"
              />
            </div>
          </div>

          {/* Opsi Bulan dan Tahun Selesai */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label>Waktu Selesai</label>
              <label style={{ fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <input
                  type="checkbox"
                  checked={formData.masih_bekerja}
                  onChange={(e) => setFormData({ ...formData, masih_bekerja: e.target.checked })}
                />
                Masih Bekerja di Sini (Sekarang)
              </label>
            </div>

            {!formData.masih_bekerja && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <CustomSelect
                  value={formData.bulan_selesai}
                  onChange={(val) => setFormData({ ...formData, bulan_selesai: val })}
                  options={DAFTAR_BULAN}
                  placeholder="Pilih Bulan Selesai"
                />

                <CustomSelect
                  value={formData.tahun_selesai_num}
                  onChange={(val) => setFormData({ ...formData, tahun_selesai_num: val })}
                  options={yearOptions}
                  placeholder="Pilih Tahun Selesai"
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary-add">
              Simpan Pengalaman
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pengalaman;