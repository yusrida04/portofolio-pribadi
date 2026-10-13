// frontend/src/components/CustomSelect.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Pilih opsi...",
  disabled = false,
  className = "",
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalisasi opsi ke { label, value }
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" && opt !== null
      ? { label: opt.label || opt.value, value: opt.value }
      : { label: String(opt), value: String(opt) }
  );

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Menutup popup saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: "relative", width: "100%", ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          margin: "6px 0 14px 0",
          borderRadius: "8px",
          border: `1px solid ${isOpen ? "var(--accent-primary)" : "var(--border)"}`,
          backgroundColor: "var(--bg-primary)",
          color: selectedOption ? "var(--text-primary)" : "var(--text-secondary)",
          fontSize: "14px",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          outline: "none",
          boxShadow: isOpen ? "0 0 0 3px rgba(37, 99, 235, 0.15)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-secondary)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            marginLeft: "8px"
          }}
        />
      </button>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% - 6px)",
            left: 0,
            width: "100%",
            maxHeight: "220px",
            overflowY: "auto",
            backgroundColor: "var(--bg-card, #ffffff)",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
            zIndex: 9999,
            padding: "5px"
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div style={{ padding: "10px 14px", fontSize: "13px", color: "var(--text-secondary)" }}>
              Tidak ada opsi
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="custom-select-option"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                    fontWeight: isSelected ? "600" : "400",
                    backgroundColor: isSelected ? "var(--accent-light, #eff6ff)" : "transparent",
                    transition: "background-color 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--accent-light, #eff6ff)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={15} color="var(--accent-primary)" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
