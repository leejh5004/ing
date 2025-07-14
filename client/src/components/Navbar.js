import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚖️</span>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              <span className="hidden sm:inline">채무자 관리 시스템</span>
              <span className="sm:hidden">채무관리</span>
            </h1>
          </div>

          {/* 데스크톱 네비게이션 메뉴 */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* 모바일 네비게이션 메뉴 */}
          <div className="md:hidden flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium mt-1 leading-none">
                  {item.label === '대시보드' ? '홈' : 
                   item.label === '채무자 목록' ? '목록' : 
                   item.label === '채무자 추가' ? '추가' : item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 