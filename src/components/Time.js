import React, { useState, useRef, useEffect } from 'react';

import regionArrow from '../assets/images/region-arrow.png';
import arrowUp from '../assets/images/arrow-up.png';

import '../styles/Time.css';

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

const Time = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const optionsRef = useRef(null);
  const scrollbarRef = useRef(null);

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  // 외부 상태 value를 내부 상태처럼 동기화
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setSelectedTime(value);
    }
  }, [value]);

  // 외부 클릭 시 dropdown 닫기
  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    if (onChange) onChange(time);
    setOpen(false);
  };

  // 스크롤 시 커스텀 스크롤바 위치 업데이트
  const onScroll = () => {
    const options = optionsRef.current;
    const scrollbar = scrollbarRef.current;
    if (!options || !scrollbar) return;

    const scrollbarHeight = 50; // 원하는 고정 높이(px)
    scrollbar.style.height = `${scrollbarHeight}px`;

    const scrollTop = options.scrollTop;
    const scrollHeight = options.scrollHeight;
    const clientHeight = options.clientHeight;

    const maxScrollTop = scrollHeight - clientHeight;
    const maxScrollbarTop = clientHeight - scrollbarHeight;
    const scrollbarTop = maxScrollTop > 0
      ? (scrollTop / maxScrollTop) * maxScrollbarTop
      : 0;
    scrollbar.style.transform = `translateY(${scrollbarTop}px)`;
  };

  useEffect(() => {
    if (open) {
      onScroll(); // 드롭다운 열릴 때 초기 위치 설정
    }
  }, [open]);

  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const initialScrollTop = useRef(0);

  const handleScrollbarMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartY.current = e.clientY;
    initialScrollTop.current = optionsRef.current.scrollTop;
    document.addEventListener('mousemove', handleScrollbarMouseMove);
    document.addEventListener('mouseup', handleScrollbarMouseUp);
  };

  const handleScrollbarMouseMove = (e) => {
    if (!isDragging.current) return;
    const options = optionsRef.current;
    const scrollbarHeight = 50;
    const clientHeight = options.clientHeight;
    const scrollHeight = options.scrollHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const maxScrollbarTop = clientHeight - scrollbarHeight;

    // 마우스 이동 거리 계산
    const deltaY = e.clientY - dragStartY.current;
    let newScrollbarTop = ((initialScrollTop.current / maxScrollTop) * maxScrollbarTop) + deltaY;
    newScrollbarTop = Math.max(0, Math.min(maxScrollbarTop, newScrollbarTop));

    // 스크롤 위치 계산 및 적용
    const newScrollTop = maxScrollTop > 0
      ? (newScrollbarTop / maxScrollbarTop) * maxScrollTop
      : 0;
    options.scrollTop = newScrollTop;
    onScroll(); // 위치 최신화
  };

  const handleScrollbarMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleScrollbarMouseMove);
    document.removeEventListener('mouseup', handleScrollbarMouseUp);
  };

  return (
    <div
      className={`time-box ${selectedTime === null ? 'empty' : 'selected'}`}
      ref={containerRef}
      style={{ top: 259, left: 763.5, position: 'absolute' }}
    >
      <div className="time-display" onClick={() => setOpen(!open)}>
        <span className="time-text">
          {selectedTime === null ? '시간 선택' : selectedTime.toString().padStart(2, '0')}
        </span>
        <img
          src={selectedTime === null ? regionArrow : arrowUp}
          alt="arrow"
          className={`time-arrow ${open ? 'rotate' : ''}`}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div className="time-dropdown">
          <div 
            className="time-options"
            ref={optionsRef}
            onScroll={onScroll}
          >
            {TIME_OPTIONS.map((time) => (
              <div
                key={time}
                className={`time-option${selectedTime === time ? ' active' : ''}`}
                onClick={() => handleSelectTime(time)}
              >
                <span>{time.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
          <div className="time-scrollbar-track">
            <div 
              className="time-scrollbar"
              ref={scrollbarRef}
              onMouseDown={handleScrollbarMouseDown}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Time;
