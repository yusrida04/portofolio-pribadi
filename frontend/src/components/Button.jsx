// frontend/src/components/Button.jsx
const Button = ({ 
  type = "submit", 
  primary = true, 
  text, 
  disabled = false, 
  onClick, 
  className = "" 
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`button ${primary ? "primary" : ""} ${className}`.trim()}
    >
      {text}
    </button>
  );
};

export default Button;