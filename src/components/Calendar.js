import { useState, useRef, useEffect } from 'react';

import '../styles/Calendar.css';

import calendarEmpty from '../assets/images/calendar-empty.png';
import calendarSelected from '../assets/images/calendar-selected.png';
import arrowUp from '../assets/images/arrow-up.png';
import calArrowUp from '../assets/images/calendar-arrow-up.png';
import calArrowDown from '../assets/images/calendar-arrow-down.png';
import calArrowUpGray from '../assets/images/calendar-arrow-up-gray.png';
import calArrowDownGray from '../assets/images/calendar-arrow-down-gray.png';

import { createPortal } from 'react-dom';

function CalendarModal({ children }) {
  return createPortal(children, document.body);
}

const getTodayObj = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

const Calendar = ({ value, onChange }) => {
  const minYear = getTodayObj().year - 4;
  const maxYear = getTodayObj().year;
  const todayObj = getTodayObj();
  const calRef = useRef(null);

  // date state를 props.value를 따라가도록
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('yearMonth');
  const [selectedYear, setSelectedYear] = useState(todayObj.year);
  const [selectedMonth, setSelectedMonth] = useState(todayObj.month);
  const [selectedDay, setSelectedDay] = useState(todayObj.day);

  const btnRef = useRef(null);
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

  // props에서 value가 오면, 연/월/일도 동기화
  useEffect(() => {
    if (value) {
      const [yy, mm, dd] = value.split('-').map(Number);
      setSelectedYear(yy);
      setSelectedMonth(mm);
      setSelectedDay(dd);
    }
  }, [value]);

  // 창 밖 클릭 시 닫힘 로직
  useEffect(() => {
    function handleClickOutside(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 날짜 선택 로직
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedMonth(todayObj.year === year ? todayObj.month : 1);
    setStep('yearMonth');
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setStep('day');
  };

  const handleDayClick = (day, isDisabled = false) => {
    if (isDisabled) return;
    const newValue = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(day);
    if (onChange) onChange(newValue);   // ⭐ LookToday로 반영!
    setOpen(false);
    setStep('yearMonth');
  };

  // 화살표 월 전후 이동
  const monthMove = (dir) => {
    let y = selectedYear;
    let m = selectedMonth;
    if (dir === -1) {
      m--;
      if (m < 1) {
        if (y > minYear) {
          y--;
          m = 12;
        }
      }
    } else {
      m++;
      if (m > 12) {
        if (y < maxYear) {
          y++;
          m = 1;
        }
      }
    }
    setSelectedYear(y);
    setSelectedMonth(m);
  };

  const handleToday = () => {
    const todayStr = `${todayObj.year}-${String(todayObj.month).padStart(2, '0')}-${String(todayObj.day).padStart(2, '0')}`;
    if (onChange) onChange(todayStr);
    setOpen(false);
    setStep('yearMonth');
  };
  const handleDelete = () => {
    if (onChange) onChange('');
    setOpen(false);
    setStep('yearMonth');
  };

  // 버튼 아래 위치 계산하여 모달 위치 지정
  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();

      setModalPos({
        top: rect.bottom + window.scrollY + 10, // 버튼 아래 10px
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
    setOpen(!open);
  };


  // 달력 날짜 그리기 함수
  const getCalGrid = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const prevLastDay = new Date(selectedYear, selectedMonth - 1, 0);
    const startDOW = firstDay.getDay();
    let days = [];
    // 이전 달
    for (let i = startDOW - 1; i >= 0; i--) {
      days.push({ day: prevLastDay.getDate() - i, isOther: true });
    }
    // 이번 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ day: i, isOther: false });
    }
    // 다음 달
    for (let i = 1; days.length % 7 !== 0 || days.length < 42; i++) {
      days.push({ day: i, isOther: true });
    }
    return days;
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* 달력버튼 */}
      <div
        className={`calendar-btn ${!value ? 'empty' : 'selected'}`}
        ref={btnRef}
        onClick={handleToggle}
      >
        <span className="calendar-btn-date">
          {value || '날짜 선택'}
        </span>
        <img src={!value ? calendarEmpty : calendarSelected} alt="calendar" />
      </div>

      {open && (
        <CalendarModal>
          <div
            className="calendar-modal"
            ref={calRef}
            style={{
              position: 'absolute',
              top: modalPos.top,
              left: modalPos.left,
              zIndex: 9999
            }}
          >
            {step === 'yearMonth' && (
              <>
                <div className="calendar-ym-selected-box">
                  <span className="calendar-ym-selected-txt">{selectedYear}년 {selectedMonth}월</span>
                  <img src={arrowUp} alt="" style={{ marginLeft: 5 }} />
                </div>
                <div className="calendar-yearlist">
                  {[...Array(5)].map((_, idx) => {
                      const y = maxYear - idx;
                      const isActive = y === selectedYear;
                      return (
                          <div
                              className={`calendar-year-item${isActive ? ' active' : ''}`}
                              key={y}
                              onClick={() => handleYearClick(y)}
                          >
                              <div className="calendar-year-label">{y}</div>
                              {isActive && (
                                  <div className="calendar-month-boxes">
                                      {[...Array(12)].map((_, mon) => {
                                          const isActiveMonth = mon + 1 === selectedMonth;
                                          return (
                                              <div
                                                  key={mon + 1}
                                                  className={`calendar-month-item${isActiveMonth ? ' active' : ''}`}
                                                  onClick={e => { e.stopPropagation(); handleMonthClick(mon + 1); }}
                                              >
                                                  {mon + 1}
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  
                </div>
              </>
            )}
            {step === 'day' && (
              <>
                <div className="calendar-day-header" style={{ position: 'relative' }}>
                  <div
                    className="calendar-day-yearmonth-box"
                    onClick={() => setStep('yearMonth')}
                  >
                    <span>{selectedYear}년 {selectedMonth}월</span>
                    <img src={arrowUp} alt="" style={{ marginLeft: 5, width: 11.405, height: 11.405 }} />
                  </div>

                  {/* 화살표를 감싸는 래퍼 추가 */}
                  <div className="calendar-arrow-wrapper">
                      <img
                      src={selectedYear === minYear && selectedMonth === 1 ? calArrowUpGray : calArrowUp}
                      alt="prev"
                      className="calendar-arrow"
                      onClick={() => selectedYear !== minYear || selectedMonth !== 1 ? monthMove(-1) : undefined}
                      style={{
                          pointerEvents: selectedYear === minYear && selectedMonth === 1 ? 'none' : 'auto'
                      }}
                      />
                      <img
                      src={selectedYear === maxYear && selectedMonth === 12 ? calArrowDownGray : calArrowDown}
                      alt="next"
                      className="calendar-arrow"
                      onClick={() => selectedYear !== maxYear || selectedMonth !== 12 ? monthMove(1) : undefined}
                      style={{
                          pointerEvents: selectedYear === maxYear && selectedMonth === 12 ? 'none' : 'auto'
                      }}
                      />
                    </div>
                </div>
                {/* 요일 */}
                <div className="calendar-day-weekdays">
                  {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                    <div className="calendar-day-weekday" key={i}>{w}</div>
                  ))}
                </div>
                {/* 일박스 */}
                <div className="calendar-day-grid">
                  {getCalGrid().map((d, idx) => (
                    <div
                      key={idx}
                      className={`calendar-day-cell${d.isOther ? ' other' : ''}${!d.isOther && d.day === selectedDay ? ' active' : ''}`}
                      onClick={() => !d.isOther && handleDayClick(d.day)}
                    >
                      {d.day}
                    </div>
                  ))}
                </div>
                {/* 삭제/오늘 */}
                <div className="calendar-footer">
                  <span className="calendar-footer-del" onClick={handleDelete}>삭제</span>
                  <span className="calendar-footer-today" onClick={handleToday}>오늘</span>
                </div>
              </>
            )}
          </div>
        </CalendarModal>
      )}
    </div>
  );
};

export default Calendar;
