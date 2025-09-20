import { useState, useRef, useEffect } from 'react';

import DeletePopup from '../components/DeletePopup';

import optionIcon from '../assets/images/option.png';
import editIcon from '../assets/images/edit.png';
import trashCanIcon from '../assets/images/trash-can.png';

import '../../src/styles/MyFeedCardOption.css';

import { useNavigate } from 'react-router-dom';

async function deletePost(postId, token) {
  try {
    const res = await fetch(`/api/lookPost/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (res.ok) {
      try {
        const data = await res.json();
        return data.success ? data : { success: true, message: "삭제되었습니다."};
      } catch (e) {
        return { success: true, message: "삭제되었습니다."};
      }
    }
    const errorData = await res.json();
    return { success: false, message: errorData.message || '삭제에 실패했습니다.' };

  } catch (e) {
    return { success: false, message: '네트워크 에러가 발생했습니다.' };
  }
}

const MyFeedCardOption = ({ postData, onDeleteSuccess }) => {
  console.log("MyFeedCardOption이 받은 postData:", postData);

  const [open, setOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const userToken = localStorage.getItem('token');

  // 옵션창 바깥 클릭시 닫기
  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, [open]);

  const handleDeleteClick = () => {
    setOpen(false); // 옵션창 닫기
    setIsDeletePopupOpen(true); // 삭제 확인 팝업 열기
  };

  const closePopup = () => setIsDeletePopupOpen(false);

  const handleDeleteConfirm = async () => {
    const postId = postData.looktoday_id;

    if (!postId || !userToken) {
      alert("삭제에 필요한 정보가 없습니다.");
      closePopup();
      return;
    }

    const res = await deletePost(postId, userToken);
    if (res.success) {
      onDeleteSuccess(postId); // 부모 컴포넌트(MyFeed)에 삭제 알림
    } else {
      alert(res.message || "삭제 중 오류가 발생했습니다.");
    }
    closePopup();
  };

  const handleEditClick = () => {
    navigate(`/mypage/looktoday-edit/${postData.looktoday_id}`, {
      state: { initialData: postData }
    });
  };

  return (
    <div>
      <div
        className="option-btn"
        onClick={() => setOpen(!open)}
        style={{
          position: "absolute",
          top: "289px", // 276px(lcookbook img)
          left: "210.7px", // 224.5px(card width) - 9.8px - 4px
          width: "4px",
          height: "16px",
          flexShrink: 0,
          cursor: "pointer",
          zIndex: 10
        }}
      >
        <img src={optionIcon} alt="옵션" style={{ width: "100%", height: "100%" }} />
      </div>

      {/* 옵션 창 */}
      {open && (
        <div
          className="option-popup"
          ref={ref}
          style={{
            position: "absolute",
            top: "330px",
            transform: "translateX(0) rotate(90deg)",
            left: "181px",
            display: "flex",
            width: "59px",
            height: "26px",
            padding: "10px",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
            borderRadius: "7px",
            background: "#E2F4FF",
            zIndex: 20
          }}
        >
          <button
            style={{
              width: "22px",
              height: "22px",
              transform: "rotate(0deg) translateY(1px)",
              flexShrink: 0,
              aspectRatio: "1/1",
              marginBottom: "5px"
            }}
            onClick={handleEditClick}
          >
            <img src={editIcon} alt="수정" style={{ width: "100%", height: "100%"}} />
          </button>
          <button
            style={{
              width: "22px",
              height: "22px",
              transform: "rotate(0deg)",
              flexShrink: 0,
              aspectRatio: "1/1"
            }}
            onClick={handleDeleteClick}
          >
            <img src={trashCanIcon} alt="삭제" style={{ width: "100%", height: "100%" }} />
          </button>
        </div>
      )}

      {/* 팝업을 카드 내 추가가 아니라, Portal에서 페이지 전체에 렌더 */}
      {isDeletePopupOpen &&
        <DeletePopup onCancel={closePopup} onDelete={handleDeleteConfirm} />
      }
    </div>
  );
};

export default MyFeedCardOption;
