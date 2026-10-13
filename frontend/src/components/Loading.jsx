// frontend/src/components/Loading.jsx
const Loading = ({ type = 'fixed', title = 'Loading...' }) => {
  return (
    <div className={`loading-container ${type}`}>
      <div className="loading"></div>
      {title && <p style={{ marginTop: '10px' }}>{title}</p>}
    </div>
  );
};

export default Loading;