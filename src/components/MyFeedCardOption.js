import { useState, useRef, useEffect } from 'react';
import optionIcon from '../assets/images/option.png';
import editIcon from '../assets/images/edit.png';
import trashCanIcon from '../assets/images/trash-can.png';

const MyFeedCardOption = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // 옵션창 바깥 클릭시 닫기
  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, [open]);

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
            onClick={() => alert("수정 클릭")}
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
            onClick={() => alert("삭제 클릭")}
          >
            <img src={trashCanIcon} alt="삭제" style={{ width: "100%", height: "100%" }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyFeedCardOption;
