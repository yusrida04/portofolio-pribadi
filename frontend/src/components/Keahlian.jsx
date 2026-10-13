// frontend/src/components/Keahlian.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GetKeahlian, AddKeahlian, UpdateKeahlian, DeleteKeahlian } from "../api/backendApi";
import Alert from "./Alert";
import Modal from "./Modal";
import Loading from "./Loading";
import CustomSelect from "./CustomSelect";
import { LEVEL_KEAHLIAN } from "../utils/helpers";
import { Sparkles, Plus, Pencil, Trash2 } from "lucide-react";

const Keahlian = () => {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ nama_keahlian: "", level: "" });
  const [isCustom, setIsCustom] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await GetKeahlian(token);
      if (res.data.status === "success") setList(res.data.keahlian);
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal mengambil data keahlian" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const isStandardLevel = (lvl) =>
    LEVEL_KEAHLIAN.some((item) => item.value.toLowerCase() === (lvl || "").trim().toLowerCase());

  const handleOpenModal = (item = null) => {
    setEditData(item);
    if (item) {
      setFormData({ nama_keahlian: item.nama_keahlian, level: item.level });
      // Kalau level bukan salah satu level standar, anggap kustom
      setIsCustom(!isStandardLevel(item.level));
    } else {
      setFormData({ nama_keahlian: "", level: "" });
      setIsCustom(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_keahlian.trim() || !formData.level.trim() || formData.level === "Kustom") {
      setAlert({ show: true, type: "error", message: "Nama keahlian dan level harus diisi" });
      return;
    }

    try {
      const payload = {
        id: editData ? editData.id : undefined,
        nama_keahlian: formData.nama_keahlian.trim(),
        level: formData.level.trim(),
        token
      };
      let res = editData ? await UpdateKeahlian(payload) : await AddKeahlian(payload);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menyimpan data keahlian" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data keahlian ini?")) return;
    try {
      const res = await DeleteKeahlian(id, token);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: res.data.message });
        fetchData();
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: "Gagal menghapus keahlian" });
    }
  };

  const getProgressPercentage = (lvl) => {
    if (!lvl) return 50;

    // Cocokkan dengan level standar dari helpers
    const found = LEVEL_KEAHLIAN.find(
      (item) => item.value.toLowerCase() === lvl.trim().toLowerCase()
    );
    if (found) return found.percent;

    // Data lama yang masih "Ahli" / "Expert" dianggap Mahir
    const l = lvl.toLowerCase();
    if (l.includes("ahli") || l.includes("expert")) return 95;

    // Level kustom, contoh: "90%"
    const match = lvl.match(/(\d+)%/);
    if (match) return Math.min(parseInt(match[1]), 100);

    return 60;
  };

  // Nilai yang ditampilkan di dropdown
  const selectValue = isCustom ? "Kustom" : formData.level;

  if (loading) return <Loading title="Memuat Keahlian..." />;

  return (
    <div className="modern-card">
      <Alert alert={alert} setAlert={setAlert} />

      {/* Header Bagian */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="var(--accent-primary)" /> Kelola Keahlian (Skills & Level)
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Daftar kompetensi teknis, penguasaan alat, dan indikator persentase kemahiran Anda.
          </p>
        </div>

        <button className="btn-primary-add" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Tambah Keahlian
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
            Belum ada data keahlian. Tambahkan skill teknis Anda.
          </div>
        ) : (
          list.map((item) => {
            const percent = getProgressPercentage(item.level);
            return (
              <div key={item.id} className="data-card-item">
                <div className="data-card-left">
                  <div className="data-icon-circle">
                    <Sparkles size={20} />
                  </div>
                  <div className="data-card-content">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span className="data-card-title">{item.nama_keahlian}</span>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent-primary)"
                      }}>
                        {item.level}
                      </span>
                    </div>

                    {/* Level Progress Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", maxWidth: "320px" }}>
                      <div style={{ flex: 1, height: "6px", backgroundColor: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            backgroundColor: "var(--accent-primary)",
                            borderRadius: "4px",
                            transition: "width 0.4s ease"
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>{percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="data-actions">
                  <button
                    className="btn-ghost"
                    onClick={() => handleOpenModal(item)}
                    title="Edit keahlian"
                  >
                    <Pencil size={14} /> <span>Edit</span>
                  </button>
                  <button
                    className="btn-danger-subtle"
                    onClick={() => handleDelete(item.id)}
                    title="Hapus keahlian"
                  >
                    <Trash2 size={14} /> <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editData ? "Edit Keahlian" : "Tambah Keahlian"}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nama Keahlian</label>
            <input
              type="text"
              value={formData.nama_keahlian}
              onChange={(e) => setFormData({ ...formData, nama_keahlian: e.target.value })}
              placeholder="Contoh: React.js, PHP, Tailwind CSS, UI/UX"
              required
            />
          </div>

          <div>
            <label>Tingkat Kemahiran (Level)</label>
            <CustomSelect
              value={selectValue}
              onChange={(val) => {
                if (val === "Kustom") {
                  setIsCustom(true);
                  setFormData({ ...formData, level: "" });
                } else {
                  setIsCustom(false);
                  setFormData({ ...formData, level: val });
                }
              }}
              options={[
                ...LEVEL_KEAHLIAN.map((lvl) => ({ label: lvl.label, value: lvl.value })),
                { label: "Kustom / Lainnya", value: "Kustom" }
              ]}
              placeholder="Pilih Level Keahlian..."
            />

            {isCustom && (
              <input
                type="text"
                value={formData.level}
                placeholder="Tulis level kustom (contoh: 90%)"
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
              />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn-primary-add">
              Simpan Keahlian
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Keahlian;