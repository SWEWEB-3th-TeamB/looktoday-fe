import { useState, useRef, useEffect } from 'react';

import DeletePopup from '../components/DeletePopup';

import optionIcon from '../assets/images/option.png';
import editIcon from '../assets/images/edit.png';
import trashCanIcon from '../assets/images/trash-can.png';

import '../../src/styles/MyFeedCardOption.css';

import { useNavigate } from 'react-router-dom'; // 수정

async function deletePost(postId, token) {
  try {
    const res = await fetch(`https://looktoday.kr/api/lookPost/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { success: false, message: '네트워크 에러가 발생했습니다.' };
  }
}

const MyFeedCardOption = ({ postData, onDeleteSuccess }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate(); // 수정

  const userToken = localStorage.getItem('access_token');

  // 옵션창 바깥 클릭시 닫기
  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, [open]);

  // 완료 버튼 클릭 핸들러
  const handleCompleteClick = () => {
    setIsCompletePopupOpen(true);
  };

  // 팝업 열림 상태
  const [isCompletePopupOpen, setIsCompletePopupOpen] = useState(false);

  // 팝업 닫기
  const closePopup = () => setIsCompletePopupOpen(false);

  const handleDelete = async () => {
    const postId = postData.id; 
    
    // 실제 삭제 로직
    if (!postId || !userToken) {
      alert("삭제에 필요한 정보가 없습니다.");
      closePopup(); // 팝업 닫기
      return;
    }
    const res = await deletePost(postId, userToken);
    if (res.success) {
      alert("게시물이 성공적으로 삭제되었습니다.");
      onDeleteSuccess && onDeleteSuccess(postId); // 상위에서 상태 제거 등 처리
    } else {
      alert(res.message || "삭제 중 오류가 발생했습니다.");
    }
    closePopup();
  };

  const handleEditClick = () => {
    navigate(`/mypage/looktoday-edit/${postData.id}`, {
      state: { initialData: postData }
    });
  };
  // 기존 코드 내 수정 버튼 onClick에서 handleEditClick 호출

  return (
    <div>
      {/* 옵션 버튼 */}
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
            onClick={handleCompleteClick}
          >
            <img src={trashCanIcon} alt="삭제" style={{ width: "100%", height: "100%" }} />
          </button>
        </div>
      )}

      {/* 팝업을 카드 내 추가가 아니라, Portal에서 페이지 전체에 렌더 */}
      {isCompletePopupOpen &&
        <DeletePopup onCancel={closePopup} onDelete={handleDelete} />
      }

    </div>
  );
};

export default MyFeedCardOption;
