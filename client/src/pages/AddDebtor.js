import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { debtorAPI } from '../utils/api';

const AddDebtor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    debt_amount: '',
    original_case_number: '',
    victory_date: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('채무자 이름을 입력해주세요.');
      return;
    }
    
    if (!formData.debt_amount || formData.debt_amount <= 0) {
      alert('올바른 채무금액을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        debt_amount: parseInt(formData.debt_amount.replace(/,/g, ''), 10),
        victory_date: formData.victory_date || null
      };

      await debtorAPI.create(submitData);
      alert('채무자가 성공적으로 등록되었습니다.');
      navigate('/debtors');
    } catch (error) {
      console.error('Add debtor error:', error);
      alert('채무자 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e) => {
    const formattedValue = formatNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      debt_amount: formattedValue
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* 페이지 헤더 */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">새 채무자 등록</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">채무자 정보를 입력하여 등록하세요</p>
      </div>

      {/* 등록 폼 */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 기본 정보</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field text-base"
                  placeholder="채무자 이름"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field text-base"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="채무자 주소"
              />
            </div>
          </div>

          {/* 채무 정보 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 채무 정보</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                채무금액 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="debt_amount"
                  value={formData.debt_amount}
                  onChange={handleAmountChange}
                  className="input-field pr-12"
                  placeholder="1,000,000"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">원</span>
                </div>
              </div>
            </div>
          </div>

          {/* 법원 소송 정보 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ 법원 소송 정보</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  원 소송 사건번호
                </label>
                <input
                  type="text"
                  name="original_case_number"
                  value={formData.original_case_number}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="예: 2023가합10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  승소 확정일
                </label>
                <input
                  type="date"
                  name="victory_date"
                  value={formData.victory_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* 메모 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 메모</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 메모
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="채무자 관련 추가 정보나 메모를 입력하세요"
              />
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/debtors')}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto order-1 sm:order-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>등록 중...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>등록하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 도움말 */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 등록 가이드</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 이름과 채무금액은 필수 입력 항목입니다</li>
          <li>• 채무금액은 숫자만 입력하면 자동으로 쉼표가 추가됩니다</li>
          <li>• 등록 후에는 상세 페이지에서 강제집행 절차를 추가할 수 있습니다</li>
          <li>• 모든 정보는 나중에 수정할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default AddDebtor; 