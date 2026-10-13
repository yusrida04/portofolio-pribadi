// frontend/src/components/Biodata.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { GetUser, UpdateUser, BASE_URL } from "../api/backendApi";
import Alert from "./Alert";
import Loading from "./Loading";
import nofoto from "../assets/yusrida.png";
import { User, Mail, Phone, Lock, Camera, Save } from "lucide-react";

const Biodata = () => {
  const { token, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    nama_lengkap: "",
    nomor_hp: "",
    password: "",
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await GetUser(token);
        if (res.data.status === "success") {
          const u = res.data.user;
          setFormData({
            username: u.username || "",
            email: u.email || "",
            nama_lengkap: u.nama_lengkap || "",
            nomor_hp: u.nomor_hp || "",
            password: "",
          });
          if (u.foto) {
            setPreviewUrl(u.foto.startsWith("http") ? u.foto : `${BASE_URL}/uploads/${u.foto}`);
          }
        }
      } catch (err) {
        setAlert({ show: true, type: "error", message: "Gagal mengambil data profil pemilik" });
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.nama_lengkap.trim()) {
      setAlert({ show: true, type: "error", message: "Email dan nama lengkap tidak boleh kosong" });
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("token", token);
      data.append("username", formData.username.trim() || "admin");
      data.append("email", formData.email.trim());
      data.append("nama_lengkap", formData.nama_lengkap.trim());
      data.append("nomor_hp", formData.nomor_hp.trim());
      if (formData.password.trim()) data.append("password", formData.password.trim());
      if (fotoFile) data.append("foto", fotoFile);

      const res = await UpdateUser(data);
      if (res.data.status === "success") {
        setAlert({ show: true, type: "success", message: "Profil pemilik portofolio berhasil disimpan!" });
        setUser({ username: formData.username, nama_lengkap: formData.nama_lengkap, email: formData.email });
        setFormData((prev) => ({ ...prev, password: "" }));
      } else {
        setAlert({ show: true, type: "error", message: res.data.message });
      }
    } catch (err) {
      setAlert({ show: true, type: "error", message: err.response?.data?.message || "Gagal memperbarui profil" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading title="Memuat Biodata Pemilik..." />;

  return (
    <div className="modern-card">
      <Alert alert={alert} setAlert={setAlert} />

      {/* Header Bagian */}
      <div style={{ marginBottom: "22px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <User size={20} color="var(--accent-primary)" /> Kelola Profil Pemilik Portofolio
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Atur informasi identitas utama, kredensial login, dan foto profil yang tampil di halaman beranda.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Foto Profil Avatar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "16px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          marginBottom: "24px",
          flexWrap: "wrap"
        }}>
          <img
            src={previewUrl || nofoto}
            alt="Profil Pemilik"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--accent-primary)",
              boxShadow: "var(--shadow-sm)"
            }}
            onError={(e) => { e.target.src = nofoto; }}
          />

          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
              Foto Profil Utama
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Mendukung file JPG, PNG, atau WEBP (Maksimal 5 MB).
            </p>
            <label className="btn-ghost" style={{ border: "1px solid var(--border)", cursor: "pointer", display: "inline-flex" }}>
              <Camera size={14} /> Ganti Foto
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
              <User size={15} /> Nama Lengkap
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              placeholder="Contoh: Nama Lengkap Anda"
              required
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
              <Mail size={15} /> Email Utama (Untuk Login Admin)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Contoh: pemilik@portofolio.com"
              required
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
              <Phone size={15} /> Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              name="nomor_hp"
              value={formData.nomor_hp}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              required
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600" }}>
              <Lock size={15} /> Password Baru Admin
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Kosongkan jika tidak ingin mengubah password"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            type="submit"
            className="btn-primary-add"
            disabled={submitting}
          >
            <Save size={16} /> {submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan Profil"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Biodata;