// frontend/src/components/Modal.jsx
import Loading from "./Loading";

const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  isLoading = false,
  loadingTitle = "Memproses..."
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation agar klik di dalam kotak modal tidak menutup modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {title && <h3>{title}</h3>}
        
        <div style={{ marginTop: '15px' }}>
          {children}
        </div>

        {isLoading && <Loading type="inline" title={loadingTitle} />}
      </div>
    </div>
  );
};

export default Modal;