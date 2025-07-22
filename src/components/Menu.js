import React, { useState } from 'react';
import '../styles/Menu.css';

import logo from '../assets/images/logo.png';

const Menu = () => {
    const [activeMenu, setActiveMenu] = useState('WEATHER');

    return (
        <div className='menu'>
            <div className='menu-gnb'>
                <img src={logo} alt="logo" />
                <div className='menu-group'>
                    <div
                        onClick={() => setActiveMenu('WEATHER')}
                        className={activeMenu === 'WEATHER' ? 'active-menu' : ''}
                    >
                        WEATHER
                    </div>
                    <div
                        onClick={() => setActiveMenu('LOOKTODAY')}
                        className={activeMenu === 'LOOKTODAY' ? 'active-menu' : ''}
                    >
                        LOOKTODAY
                    </div>
                    <div
                        onClick={() => setActiveMenu('LOOKBOOK')}
                        className={activeMenu === 'LOOKBOOK' ? 'active-menu' : ''}
                    >
                        LOOKBOOK
                    </div>
                    <div
                        onClick={() => setActiveMenu('LOGIN')}
                        className={activeMenu === 'LOGIN' ? 'active-menu' : ''}
                    >
                        LOGIN
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Menu;
