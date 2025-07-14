import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, formatCurrency } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDebtors: 0,
    totalDebtAmount: 0,
    totalPaidAmount: 0,
    remainingAmount: 0,
    activeProcedures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('통계 데이터를 불러오는데 실패했습니다.');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: '총 채무자 수',
      value: `${stats.totalDebtors}명`,
      icon: '👥',
      bgColor: 'bg-blue-500',
      clickable: true,
      onClick: () => navigate('/debtors'),
    },
    {
      title: '총 채무금액',
      value: formatCurrency(stats.totalDebtAmount),
      icon: '💰',
      bgColor: 'bg-green-500',
    },
    {
      title: '총 상환금액',
      value: formatCurrency(stats.totalPaidAmount),
      icon: '✅',
      bgColor: 'bg-indigo-500',
    },
    {
      title: '잔여 채무',
      value: formatCurrency(stats.remainingAmount),
      icon: '📊',
      bgColor: 'bg-orange-500',
    },
    {
      title: '상환률',
      value: stats.totalDebtAmount > 0 
        ? `${Math.round((stats.totalPaidAmount / stats.totalDebtAmount) * 100)}%`
        : '0%',
      icon: '📈',
      bgColor: 'bg-purple-500',
    },
    {
      title: '진행 중인 강제집행',
      value: `${stats.activeProcedures}건`,
      icon: '⚖️',
      bgColor: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">채무자 관리 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`card ${card.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{card.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                <span className="text-lg sm:text-2xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* 최근 활동 섹션 (향후 구현) */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 활동</h2>
        <p className="text-gray-500 text-center py-8">
          최근 활동 내역이 여기에 표시됩니다.
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 