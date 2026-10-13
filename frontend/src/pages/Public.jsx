// frontend/src/pages/Public.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GetPublic, BASE_URL, delay } from "../api/backendApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import nofoto from "../assets/yusrida.png";
import Loading from "../components/Loading";
import { formatGoogleDriveImage } from "../utils/helpers";
import { get2DContactIcon } from "../components/Kontak";
import {
  Sun,
  Moon,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Sparkles,
  FolderGit2,
  Share2,
  ExternalLink,
  Calendar,
  ShieldCheck,
  LogIn,
  Image as ImageIcon,
  User,
  ArrowRight,
  Code2
} from "lucide-react";

const Public = () => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Portofolio Pribadi";
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const [response] = await Promise.all([GetPublic(), delay(200)]);
        if (response.data.status === "success") {
          setPortfolioData(response.data.data);
        } else {
          setError("Gagal memuat data portofolio");
        }
      } catch (err) {
        console.error(err);
        setError("Tidak dapat terhubung ke server backend");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  if (loading) return <Loading title="Memuat Portofolio..." />;

  if (error) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "80px", padding: "40px" }}>
        <h2>Terjadi Kesalahan</h2>
        <p style={{ color: "#dc2626", margin: "16px 0" }}>{error}</p>
        <button className="button primary" onClick={() => window.location.reload()}>
          Coba Lagi
        </button>
      </div>
    );
  }

  const profil = portfolioData?.profil || {};
  const pendidikan = portfolioData?.riwayat_pendidikan || [];
  const pengalaman = portfolioData?.pengalaman || [];
  const keahlian = portfolioData?.keahlian || [];
  const kontak = portfolioData?.kontak_aktif || [];
  const projectList = portfolioData?.karya_terbaik || [];

  const getFotoUrl = () => {
    if (!profil.foto) return nofoto;
    if (profil.foto.startsWith("http")) return profil.foto;
    return `${BASE_URL}/uploads/${profil.foto}`;
  };

  const getProgressPercentage = (lvl) => {
    if (!lvl) return 50;
    const l = lvl.toLowerCase();
    if (l.includes("mahir") || l.includes("advanced")) return 85;
    if (l.includes("menengah") || l.includes("intermediate")) return 65;
    if (l.includes("pemula") || l.includes("beginner")) return 35;
    const match = lvl.match(/(\d+)%/);
    if (match) return parseInt(match[1]);
    return 60;
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. NAVBAR STANDAR SITUS WEB (Sticky Top) */}
      <header className="app-navbar">
        <div className="navbar-container">
          <a href="#tentang" className="navbar-brand">
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}>
              <User size={18} />
            </div>
            <span>{profil.nama_lengkap || "Portofolio"}</span>
          </a>

          {/* Nav Links ke Semua Bagian Scroll */}
          <nav>
            <ul className="navbar-links">
              <li><a href="#tentang" className="nav-link">Tentang</a></li>
              <li><a href="#pendidikan" className="nav-link">Pendidikan</a></li>
              <li><a href="#pengalaman" className="nav-link">Pengalaman</a></li>
              <li><a href="#keahlian" className="nav-link">Keahlian</a></li>
              <li><a href="#project" className="nav-link">Project</a></li>
              <li><a href="#kontak" className="nav-link">Kontak</a></li>
            </ul>
          </nav>

          <div className="navbar-actions">
            <button
              className="btn-ghost"
              onClick={toggleTheme}
              title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
              style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 10px" }}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {token ? (
              <Link to="/dashboard" className="btn-primary-add" style={{ textDecoration: "none", padding: "8px 16px" }}>
                <ShieldCheck size={16} /> Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-primary-add" style={{ textDecoration: "none", padding: "8px 16px" }}>
                <LogIn size={16} /> Login Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. AREA KONTEN UTAMA DENGAN CONTAINER 1200px */}
      <main className="container" style={{ flex: "1 0 auto" }}>

        {/* SECTION 1: HERO SECTION 2-KOLOM RESPONSIVE */}
        <section id="tentang" className="hero-grid">
          {/* Kolom Kiri: Teks Menyapa, Nama Besar, Deskripsi, Pills Keahlian, CTA */}
          <div>

            <h1 className="hero-name">
              {profil.nama_lengkap || "Nama Lengkap"}
            </h1>

            <p className="hero-bio">
              Mahasiswa dan Web Developer yang bersemangat dalam membangun aplikasi web modern, fungsional, dan memiliki pengalaman pengguna yang mulus.
            </p>

            {/* Quick Skills Pill Highlights */}
            {keahlian.length > 0 && (
              <div className="hero-tags-group">
                {keahlian.slice(0, 5).map((item, idx) => (
                  <span key={idx} className="hero-tag">
                    {item.nama_keahlian}
                  </span>
                ))}
              </div>
            )}

            {/* Tombol Call-To-Action */}
            <div className="hero-cta-group">
              <a href="#project" className="button primary">
                Lihat Project Saya <ArrowRight size={16} />
              </a>
              <a href="#kontak" className="button">
                Hubungi Saya <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Kolom Kanan: Foto Profil Lingkaran Besar dengan Ring Gradient Halus */}
          <div className="hero-avatar-side">
            <div className="hero-avatar-ring">
              <img
                src={getFotoUrl()}
                alt={profil.nama_lengkap || "Foto Profil"}
                className="hero-avatar-img"
                onError={(e) => { e.target.src = nofoto; }}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: PENDIDIKAN & PENGALAMAN (INTERACTIVE VERTICAL TIMELINE) */}
        <section className="public-section" id="pendidikan">
          <div className="public-section-header">
            <h2 className="public-section-title">Pendidikan & Pengalaman</h2>
            <p className="public-section-subtitle">
              Linimasa rekam jejak akademis dan pengalaman kerja profesional yang telah ditempuh.
            </p>
          </div>

          <div className="timeline-grid">
            {/* Timeline Pendidikan */}
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <GraduationCap size={20} color="var(--accent-primary)" /> Riwayat Pendidikan
              </h3>

              <div className="timeline-wrapper">
                <div className="timeline-vertical-line" />
                {pendidikan.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Belum ada data riwayat pendidikan.</p>
                ) : (
                  pendidikan.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-node">
                        <GraduationCap size={16} />
                      </div>
                      <div className="timeline-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                          <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{item.nama_institusi}</strong>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "var(--bg-secondary)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)"
                          }}>
                            <Calendar size={12} /> {item.tahun_mulai} - {item.tahun_selesai || "Sekarang"}
                          </span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                          <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{item.tingkat}</span>
                          {item.jurusan ? ` • ${item.jurusan}` : ""}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline Pengalaman Kerja */}
            <div id="pengalaman">
              <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                <Briefcase size={20} color="var(--accent-primary)" /> Pengalaman Kerja
              </h3>

              <div className="timeline-wrapper">
                <div className="timeline-vertical-line" />
                {pengalaman.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Belum ada data pengalaman kerja.</p>
                ) : (
                  pengalaman.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-node">
                        <Briefcase size={16} />
                      </div>
                      <div className="timeline-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                          <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>{item.jabatan}</strong>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "var(--bg-secondary)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)"
                          }}>
                            <Calendar size={12} /> {item.tahun_mulai} - {item.tahun_selesai || "Sekarang"}
                          </span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                          {item.nama_perusahaan}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: KEAHLIAN (GLASSMORPHISM GRID CARDS DENGAN MINIMALIST PROGRESS BAR) */}
        <section className="public-section" id="keahlian">
          <div className="public-section-header">
            <h2 className="public-section-title">Keahlian & Kemampuan</h2>
            <p className="public-section-subtitle">
              Penguasaan bahasa pemrograman, kerangka kerja, dan teknologi yang saya gunakan dalam pengembangan perangkat lunak.
            </p>
          </div>

          <div className="skills-glass-grid">
            {keahlian.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", gridColumn: "1 / -1" }}>
                Belum ada data keahlian.
              </p>
            ) : (
              keahlian.map((item, idx) => {
                const percent = getProgressPercentage(item.level);
                return (
                  <div key={idx} className="skill-glass-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)" }}>
                        {item.nama_keahlian}
                      </span>
                      <span style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "var(--accent-light)",
                        color: "var(--accent-primary)",
                        border: "1px solid rgba(37, 99, 235, 0.15)"
                      }}>
                        {item.level}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
                      {percent}%
                    </div>

                    {/* Progress Bar Minimalis */}
                    <div className="skill-progress-track">
                      <div className="skill-progress-bar" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 4: PROJECT (2-COLUMN / MASONRY CARD GRID DENGAN HOVER-ZOOM & TECH BADGES) */}
        <section className="public-section" id="project">
          <div className="public-section-header">
            <h2 className="public-section-title">Project Unggulan</h2>
            <p className="public-section-subtitle">
              Koleksi project terpilih yang telah saya rancang dan kembangkan dengan fokus pada performa serta kemudahan penggunaan.
            </p>
          </div>

          <div className="project-masonry-grid">
            {projectList.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", gridColumn: "1 / -1" }}>
                Belum ada project ditampilkan.
              </p>
            ) : (
              projectList.map((item, idx) => {
                const displayImg = formatGoogleDriveImage(item.gambar);
                return (
                  <div key={idx} className="project-card-modern">
                    {/* Container Gambar dengan Efek Hover Zoom */}
                    <div className="project-image-container">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={item.nama_karya}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                          }}
                        />
                      ) : null}

                      <div style={{
                        display: displayImg ? "none" : "flex",
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "6px",
                        color: "var(--text-secondary)"
                      }}>
                        <ImageIcon size={36} />
                        <span style={{ fontSize: "13px" }}>Preview Project</span>
                      </div>
                    </div>

                    {/* Konten Project */}
                    <div className="project-content-body">
                      <div>
                        {/* Tech Badge */}
                        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                          <span className="tech-badge">Web Application</span>
                          <span className="tech-badge">Fullstack</span>
                        </div>

                        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.2px" }}>
                          {item.nama_karya}
                        </h4>

                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "160%", marginBottom: "20px" }}>
                          {item.deskripsi}
                        </p>
                      </div>

                      {item.url && (
                        <div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button primary"
                            style={{ width: "100%", textDecoration: "none", fontSize: "13px", padding: "10px 16px" }}
                          >
                            Buka Project <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SECTION 5: KONTAK (MODERN CLEAN FOOTER CARD) */}
        <section className="public-section" id="kontak">
          <div className="contact-footer-card">

            <h2 style={{ fontSize: "30px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "10px" }}>
              Tertarik Bekerja Sama?
            </h2>

            <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto 16px auto", lineHeight: "1.6" }}>
              Saya selalu terbuka untuk diskusi mengenai project baru, peluang karier, atau sekadar bertukar wawasan seputar teknologi.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "18px", flexWrap: "wrap", fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              {profil.email && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={15} color="var(--accent-primary)" /> {profil.email}
                </span>
              )}
              {profil.nomor_hp && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={15} color="var(--accent-primary)" /> {profil.nomor_hp}
                </span>
              )}
            </div>

            {/* Interactive Contact Link Chips */}
            <div className="contact-links-row">
              {kontak.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>Belum ada kontak aktif.</p>
              ) : (
                kontak.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="template-chip"
                    style={{ textDecoration: "none", padding: "10px 18px", fontSize: "14px" }}
                  >
                    {get2DContactIcon(item.nama_media, 18)}
                    <span>{item.nama_media}</span>
                    <ExternalLink size={13} style={{ opacity: 0.6 }} />
                  </a>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 3. FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 24px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
        <p>© {new Date().getFullYear()} {profil.nama_lengkap || "Portofolio"}. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
};

export default Public;