import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';

import RegionSelector from '../../components/RegionSelector';
import Calendar from '../../components/Calendar';

import '../../styles/FilterPopup.css';

import close from '../../assets/images/popup-close.png';

const PRESETS = [
    { id: "all", label: "전체" },
    { id: "m16", label: "-16℃ 이하" },
    { id: "m15to11", label: "-15 ~ -11℃" },
    { id: "m10to6", label: "-10 ~ -6℃" },
    { id: "m5to1", label: "-5 ~ -1℃" },
    { id: "0to5", label: "0 ~ 5℃" },
    { id: "6to11", label: "6 ~ 11℃" },
    { id: "12to16", label: "12 ~ 16℃" },
    { id: "17to20", label: "17 ~ 20℃" },
    { id: "20to26", label: "20 ~ 26℃" },
    { id: "27to33", label: "27 ~ 33℃" },
    { id: "34p", label: "34℃ 이상" },
];

const FilterPopup = ({ onClose, defaultItem, onApply }) => {
    const [selectItem, setSelectItem] = useState(defaultItem || '지역');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selected, setSelected] = useState('all');
    const [custom, setCustom] = useState({ min: '', max: '' });
    const [startDateValue, setStartDateValue] = useState(null);
    const [endDateValue, setEndDateValue] = useState(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handlePreset = (id) => setSelected(id);
    const handleCustomRadio = () => setSelected('custom');

    const handleApply = () => {
        const weatherValue =
            selected === 'custom'
                ? { type: 'custom', min: custom.min, max: custom.max }
                : { type: 'preset', id: selected };

        const appliedFilters = {
            tab: selectItem,
            region: selectedRegion,
            weather: weatherValue,
            startDate: startDateValue,
            endDate: endDateValue,
        };

        console.log("[FilterPopup] handleApply 호출됨:", appliedFilters);

        if (onApply) {
            console.log("[FilterPopup] onApply 존재함, 호출 시작!");
            onApply(appliedFilters);
        } else {
            console.error("[FilterPopup] onApply 없음!");
        }

        setTimeout(() => {
            onClose();
        }, 0);
    };

    useEffect(() => {
        console.log("[FilterPopup] 받은 props:", {
            onApply,
            onClose,
            defaultItem
        });
    }, [])

    return ReactDOM.createPortal(
        <div className='filter-popup-overlay' onClick={onClose}>
            <div className='filter-popup-content' onClick={(e) => e.stopPropagation()}>
                <img src={close} className='filter-popup-close' onClick={onClose} alt="close" />

                <div className='filter-popup-select'>
                    <div
                        className={`filter-popup-select-item ${selectItem === '지역' ? 'active' : ''}`}
                        onClick={() => setSelectItem('지역')}
                    >지역</div>
                    <div
                        className={`filter-popup-select-item ${selectItem === '날씨' ? 'active' : ''}`}
                        onClick={() => setSelectItem('날씨')}
                    >날씨</div>
                    <div
                        className={`filter-popup-select-item ${selectItem === '날짜' ? 'active' : ''}`}
                        onClick={() => setSelectItem('날짜')}
                    >날짜</div>
                </div>

                {selectItem === '지역' && (
                    <div className='filter-popup-region'>
                        <RegionSelector
                            onRegionChange={(value, type) => {
                                if (type === 'sido') {
                                    // 시/도 변경 시
                                    setSelectedRegion({
                                        si: value,
                                        gungu: '' // 군/구 초기화
                                    });
                                } else if (type === 'gugun') {
                                    // 군/구 변경 시
                                    setSelectedRegion((prev) => ({
                                        ...prev,
                                        gungu: value
                                    }));
                                }
                            }}
                        />
                    </div>
                )}

                {selectItem === '날씨' && (
                    <div className="temp-selector">
                        <div className="temp-grid">
                            {PRESETS.map((opt) => (
                                <label key={opt.id} className="temp-item">
                                    <input
                                        type="radio"
                                        name="weather-temp"
                                        value={opt.id}
                                        checked={selected === opt.id}
                                        onChange={() => handlePreset(opt.id)}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}

                            <div className="custom-row" style={{ gridColumn: '1 / -1' }}>
                                <label className="temp-item custom-radio">
                                    <input
                                        type="radio"
                                        name="weather-temp"
                                        value="custom"
                                        checked={selected === 'custom'}
                                        onChange={handleCustomRadio}
                                    />
                                    <span>직접입력</span>
                                </label>

                                <div className="temp-custom-inputs">
                                    <input
                                        type="number"
                                        placeholder="최저"
                                        value={custom.min}
                                        onChange={(e) => setCustom((c) => ({ ...c, min: e.target.value }))}
                                        disabled={selected !== 'custom'}
                                    />
                                    <span className="tilde">~</span>
                                    <input
                                        type="number"
                                        placeholder="최고"
                                        value={custom.max}
                                        onChange={(e) => setCustom((c) => ({ ...c, max: e.target.value }))}
                                        disabled={selected !== 'custom'}
                                    />
                                    <span className="unit">℃</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectItem === '날짜' && (
                    <div className='filter-popup-date'>
                        <div className="calendar-field">
                            <Calendar value={startDateValue} onChange={setStartDateValue} className="custom-calendar" />
                        </div>
                        <span className="tilde">~</span>
                        <div className="calendar-field">
                            <Calendar value={endDateValue} onChange={setEndDateValue} className="custom-calendar" />
                        </div>
                    </div>
                )}

                <div className='filter-popup-btn' onClick={handleApply}>확인</div>
            </div>
        </div>,
        document.body
    );
};

export default FilterPopup;
