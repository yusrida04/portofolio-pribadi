// frontend/src/pages/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { LoginApi } from "../api/backendApi";
import Alert from "../components/Alert";
import { Mail, Lock, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "success", message: "" });
  const [loading, setLoading] = useState(false);

  // Jika sudah login, langsung alihkan ke Dashboard
  useEffect(() => {
    document.title = "Login Admin Portofolio";
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAlert({ show: true, type: "error", message: "Email dan Password pemilik admin harus diisi" });
      return;
    }

    try {
      setLoading(true);
      const response = await LoginApi(email.trim(), password.trim());
      if (response.data.status === 'success') {
        login(response.data.token, response.data.user);
        navigate("/dashboard");
      } else {
        setAlert({ show: true, type: "error", message: response.data.message });
      }
    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message: error.response?.data?.message || "Login gagal, periksa email & password Anda"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "420px", marginTop: "70px" }}>
      <Alert alert={alert} setAlert={setAlert} />

      <div className="card" style={{ padding: "32px", boxShadow: "var(--shadow)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-bg, rgba(59, 130, 246, 0.1))",
            color: "var(--accent-primary)",
            marginBottom: "12px"
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ marginBottom: "6px" }}>Login Pemilik Portofolio</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Masuk menggunakan email dan password pemilik
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
              <Mail size={16} /> Email Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: admin@portofolio.com"
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
              <Lock size={16} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            text={loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
            primary={true}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            disabled={loading}
          />
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={16} /> Kembali ke Beranda Publik
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;