// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Biodata from "../components/Biodata";
import Pendidikan from "../components/Pendidikan";
import Pengalaman from "../components/Pengalaman";
import Keahlian from "../components/Keahlian";
import Kontak from "../components/Kontak";
import Karya from "../components/Karya";
import {
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  Share2,
  FolderGit2,
  Eye,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab aktif saat ini (default: 'biodata')
  const [activeTab, setActiveTab] = useState("biodata");

  useEffect(() => {
    document.title = "Dashboard - Editor Portofolio";
  }, []);

  // Proteksi Rute: Jika tidak memiliki token, langsung lempar ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { id: "biodata", label: "Biodata", icon: User },
    { id: "pendidikan", label: "Pendidikan", icon: GraduationCap },
    { id: "pengalaman", label: "Pengalaman", icon: Briefcase },
    { id: "keahlian", label: "Keahlian", icon: Sparkles },
    { id: "karya", label: "Project", icon: FolderGit2 },
    { id: "kontak", label: "Kontak", icon: Share2 },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 1. Header / Navbar SaaS Dashboard */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}>
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.2px" }}>
                Admin Console
              </h2>
              <small style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                Pemilik: <strong style={{ color: "var(--text-primary)" }}>{user?.nama_lengkap || user?.email || user?.username || "Admin"}</strong>
              </small>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link
              to="/"
              className="btn-ghost"
              style={{ textDecoration: "none", border: "1px solid var(--border)", borderRadius: "8px" }}
              title="Lihat Website Publik"
            >
              <Eye size={15} /> <span>Lihat Situs</span>
            </Link>

            <button
              className="btn-ghost"
              onClick={toggleTheme}
              style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 10px" }}
              title={theme === "light" ? "Ganti ke Mode Gelap" : "Ganti ke Mode Terang"}
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            <button
              className="btn-danger-subtle"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Keluar dari sesi"
            >
              <LogOut size={15} /> <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Konten Utama Dashboard */}
      <main className="container" style={{ flex: "1 0 auto", paddingTop: "28px" }}>
        {/* TAB NAVIGATION: Segmented Control Container */}
        <div style={{ marginBottom: "26px", overflowX: "auto", paddingBottom: "4px" }}>
          <div className="segmented-container">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`segmented-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Area Komponen Aktif */}
        <div className="tab-content">
          {activeTab === "biodata" && <Biodata />}
          {activeTab === "pendidikan" && <Pendidikan />}
          {activeTab === "pengalaman" && <Pengalaman />}
          {activeTab === "keahlian" && <Keahlian />}
          {activeTab === "karya" && <Karya />}
          {activeTab === "kontak" && <Kontak />}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "18px 20px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
        Dashboard Pemilik Portofolio • Hak Akses Tunggal
      </footer>
    </div>
  );
};

export default Dashboard;