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

// 모달을 Portal로 body에 렌더링하는 컴포넌트
function CalendarModal({ children }) {
  return createPortal(children, document.body);
}

// 오늘 날짜 정보를 객체로 반환 (연,월,일)
const getTodayObj = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

const Calendar = ({ value, onChange }) => {
  // 연도 범위(최소: 올해-4, 최대: 올해)
  const minYear = getTodayObj().year - 4;
  const maxYear = getTodayObj().year;
  const todayObj = getTodayObj();
  const calRef = useRef(null); // 모달 감지를 위한 DOM 참조

  // 달력 UI 상태 관리
  const [open, setOpen] = useState(false); // 달력 모달 open/close
  const [step, setStep] = useState('yearMonth'); // 현재 단계 (연/월 or 일 선택)
  const [selectedYear, setSelectedYear] = useState(todayObj.year); // 선택한 연도
  const [selectedMonth, setSelectedMonth] = useState(todayObj.month); // 선택한 월
  const [selectedDay, setSelectedDay] = useState(todayObj.day); // 선택한 일

  const btnRef = useRef(null); // 버튼 위치 계산용 ref
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 }); // 모달 좌표

  // value prop이 바뀌면 date state 동기화
  useEffect(() => {
    if (value) {
      const [yy, mm, dd] = value.split('-').map(Number);
      setSelectedYear(yy);
      setSelectedMonth(mm);
      setSelectedDay(dd);
    }
  }, [value]);

  // 모달 외부 클릭 시 닫기 이벤트 등록
  useEffect(() => {
    function handleClickOutside(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 연도 클릭 시 연도 선택, 월 자동 세팅(현재 연도는 이번 달, 그 외엔 1월)
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedMonth(todayObj.year === year ? todayObj.month : 1);
    setSelectedDay(todayObj.year === year ? todayObj.day : 1);
    setStep('yearMonth');
  };
  // 월 클릭 시 월 선택, '일' 선택단계로 이동
  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setStep('day');
  };
  // 일 클릭 시(혹은 비활성화 일 아니면) 선택/콜백 호출 및 모달 닫기
  const handleDayClick = (day, isDisabled = false) => {
    if (isDisabled) return;
    const newValue = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(day);
    if (onChange) onChange(newValue); // 선택값 부모로 전달
    setOpen(false);
    setStep('yearMonth');
  };

  // 월 앞/뒤 이동(경계 처리 포함)
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

  // '오늘' 클릭 시 오늘 날짜 선택 및 close
  const handleToday = () => {
    const todayStr = `${todayObj.year}-${String(todayObj.month).padStart(2, '0')}-${String(todayObj.day).padStart(2, '0')}`;
    if (onChange) onChange(todayStr);
    setOpen(false);
    setStep('yearMonth');
  };
  // '삭제' 클릭 시 날짜 초기화
  const handleDelete = () => {
    if (onChange) onChange('');
    setOpen(false);
    setStep('yearMonth');
  };

  // 달력버튼 클릭 시(열기) 모달 위치 계산
  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();

      setModalPos({
        top: rect.bottom + window.scrollY + 10, // 버튼 아래 10px 띄움
        left: rect.left + window.scrollX + rect.width / 2
      });
    }
    setOpen(!open);
  };

  // 달력 그리드(일 배열) 생성: 이전달, 이번달, 다음달 일자 표시
  const getCalGrid = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const prevLastDay = new Date(selectedYear, selectedMonth - 1, 0);
    const startDOW = firstDay.getDay();
    let days = [];
    // 이전 달 일자 채우기
    for (let i = startDOW - 1; i >= 0; i--) {
      days.push({ day: prevLastDay.getDate() - i, isOther: true });
    }
    // 이번 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ day: i, isOther: false });
    }
    // 다음 달(빈칸 채우기)
    for (let i = 1; days.length % 7 !== 0 || days.length < 42; i++) {
      days.push({ day: i, isOther: true });
    }
    return days;
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* 캘린더 버튼 */}
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

      {/* 달력 모달 */}
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
            {/* 연도/월 선택 */}
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
                              {/* 연도 활성화 시, 월 박스 노출 */}
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
            {/* 일 선택 */}
            {step === 'day' && (
              <>
                <div className="calendar-day-header" style={{ position: 'relative' }}>
                  {/* 연/월 표시 (클릭하면 연/월 선택단계로 복귀) */}
                  <div
                    className="calendar-day-yearmonth-box"
                    onClick={() => setStep('yearMonth')}
                  >
                    <span>{selectedYear}년 {selectedMonth}월</span>
                    <img src={arrowUp} alt="" style={{ marginLeft: 5, width: 11.405, height: 11.405 }} />
                  </div>

                  {/* 월 이동용 화살표 (경계값 제어) */}
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
                {/* 요일 표시 */}
                <div className="calendar-day-weekdays">
                  {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                    <div className="calendar-day-weekday" key={i}>{w}</div>
                  ))}
                </div>
                {/* 일(day) 격자 */}
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
                {/* 하단 '삭제' '오늘' 버튼 */}
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
