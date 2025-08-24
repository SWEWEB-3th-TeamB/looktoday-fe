import ReactDOM from 'react-dom';

const DeletePopup = ({ onCancel, onDelete }) => {
  return ReactDOM.createPortal(
    <>
      <div className="delete-popup-overlay" onClick={onCancel} />
      <div className="delete-popup">
        <h2 className="delete-popup-title">
          <span className="title-english">LOOK TODAY</span>
          <span className="title-korean">게시물을 삭제합니다</span>
        </h2>
        <div className="delete-popup-desc">
          삭제하면 복구할 수 없습니다{'\n'}정말로 삭제할까요?
        </div>
        <div className="delete-popup-btns">
          <button className="delete-popup-cancel-btn" onClick={onCancel}>취소</button>
          <button className="delete-popup-delete-btn" onClick={onDelete}>삭제</button>
        </div>
      </div>
    </>,
    document.body // 혹은 document.getElementById('root')
  );
};

export default DeletePopup;
