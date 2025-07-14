import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { debtorAPI, enforcementAPI, paymentAPI, formatCurrency, formatDate } from '../utils/api';

const DebtorDetail = () => {
  const { id } = useParams();
  const [debtor, setDebtor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 모달 상태
  const [showEnforcementModal, setShowEnforcementModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // 폼 데이터
  const [enforcementForm, setEnforcementForm] = useState({
    procedure_type: '통장압류',
    case_number: '',
    application_date: '',
    status: '진행중',
    notes: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '계좌입금',
    notes: ''
  });

  const loadDebtorDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await debtorAPI.getById(id);
      setDebtor(response.data);
    } catch (err) {
      setError('채무자 정보를 불러오는데 실패했습니다.');
      console.error('Load debtor detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDebtorDetail();
  }, [loadDebtorDetail]);

  const handleEnforcementSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        debtor_id: parseInt(id),
        ...enforcementForm
      };
      
      await enforcementAPI.create(submitData);
      alert('강제집행 절차가 성공적으로 추가되었습니다.');
      setShowEnforcementModal(false);
      setEnforcementForm({
        procedure_type: '통장압류',
        case_number: '',
        application_date: '',
        status: '진행중',
        notes: ''
      });
      loadDebtorDetail();
    } catch (error) {
      console.error('Add enforcement error:', error);
      alert('강제집행 절차 추가에 실패했습니다.');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        debtor_id: parseInt(id),
        amount: parseInt(paymentForm.amount.replace(/,/g, ''), 10),
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes
      };
      
      await paymentAPI.create(submitData);
      alert('상환 기록이 성공적으로 추가되었습니다.');
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: '계좌입금',
        notes: ''
      });
      loadDebtorDetail();
    } catch (error) {
      console.error('Add payment error:', error);
      alert('상환 기록 추가에 실패했습니다.');
    }
  };

  const formatNumber = (value) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      '진행중': 'bg-blue-100 text-blue-800',
      '완료': 'bg-green-100 text-green-800',
      '중단': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getProcedureIcon = (type) => {
    const icons = {
      '통장압류': '🏦',
      '재산명시': '📋',
      '급여압류': '💼'
    };
    return icons[type] || '⚖️';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !debtor) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error || '채무자를 찾을 수 없습니다.'}</div>
          <Link to="/debtors" className="btn-primary">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const repaymentRate = debtor.debt_amount > 0 ? (debtor.paid_amount / debtor.debt_amount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link to="/debtors" className="text-gray-500 hover:text-gray-700">
              ← 목록으로
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{debtor.name}</h1>
          <p className="text-gray-600 mt-2">채무자 상세 정보 및 진행 현황</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <span>💰</span>
            <span>상환 추가</span>
          </button>
          <button
            onClick={() => setShowEnforcementModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>⚖️</span>
            <span>강제집행 추가</span>
          </button>
        </div>
      </div>

      {/* 기본 정보 및 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 기본 정보 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 기본 정보</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">이름</span>
              <p className="text-gray-900">{debtor.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">전화번호</span>
              <p className="text-gray-900">{debtor.phone || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">주소</span>
              <p className="text-gray-900">{debtor.address || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">등록일</span>
              <p className="text-gray-900">{formatDate(debtor.created_at)}</p>
            </div>
          </div>
        </div>

        {/* 채무 현황 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 채무 현황</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">총 채무금액</span>
              <p className="text-xl font-bold text-red-600">{formatCurrency(debtor.debt_amount)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">상환금액</span>
              <p className="text-xl font-bold text-green-600">{formatCurrency(debtor.paid_amount)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">잔여금액</span>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(debtor.remaining_amount)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">상환률</span>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(repaymentRate, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{Math.round(repaymentRate)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 소송 정보 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ 소송 정보</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">원 소송 사건번호</span>
              <p className="text-gray-900">{debtor.original_case_number || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">승소 확정일</span>
              <p className="text-gray-900">{formatDate(debtor.victory_date) || '-'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">강제집행 건수</span>
              <p className="text-gray-900">{debtor.procedures?.length || 0}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* 강제집행 절차 */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">⚖️ 강제집행 절차</h3>
          <button
            onClick={() => setShowEnforcementModal(true)}
            className="btn-secondary text-sm"
          >
            + 절차 추가
          </button>
        </div>
        
        {debtor.procedures && debtor.procedures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debtor.procedures.map((procedure) => (
              <div key={procedure.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getProcedureIcon(procedure.procedure_type)}</span>
                    <h4 className="font-semibold text-gray-900">{procedure.procedure_type}</h4>
                  </div>
                  {getStatusBadge(procedure.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">사건번호:</span>
                    <span className="ml-2 text-gray-900">{procedure.case_number}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">신청일:</span>
                    <span className="ml-2 text-gray-900">{formatDate(procedure.application_date)}</span>
                  </div>
                  {procedure.notes && (
                    <div>
                      <span className="font-medium text-gray-500">메모:</span>
                      <p className="ml-2 text-gray-900 text-xs">{procedure.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">⚖️</span>
            <p>등록된 강제집행 절차가 없습니다</p>
            <button
              onClick={() => setShowEnforcementModal(true)}
              className="btn-primary mt-2 text-sm"
            >
              첫 절차 추가하기
            </button>
          </div>
        )}
      </div>

      {/* 상환 기록 */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">💰 상환 기록</h3>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-secondary text-sm"
          >
            + 상환 추가
          </button>
        </div>
        
        {debtor.payments && debtor.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">상환일</th>
                  <th className="table-header">금액</th>
                  <th className="table-header">방법</th>
                  <th className="table-header">메모</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {debtor.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="table-cell">{formatDate(payment.payment_date)}</td>
                    <td className="table-cell">
                      <span className="font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="table-cell">{payment.payment_method}</td>
                    <td className="table-cell">{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">💰</span>
            <p>상환 기록이 없습니다</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary mt-2 text-sm"
            >
              첫 상환 기록하기
            </button>
          </div>
        )}
      </div>

      {/* 강제집행 절차 추가 모달 */}
      {showEnforcementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">강제집행 절차 추가</h3>
            <form onSubmit={handleEnforcementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">절차 유형</label>
                <select
                  value={enforcementForm.procedure_type}
                  onChange={(e) => setEnforcementForm(prev => ({ ...prev, procedure_type: e.target.value }))}
                  className="input-field"
                >
                  <option value="통장압류">통장압류</option>
                  <option value="재산명시">재산명시</option>
                  <option value="급여압류">급여압류</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사건번호</label>
                <input
                  type="text"
                  value={enforcementForm.case_number}
                  onChange={(e) => setEnforcementForm(prev => ({ ...prev, case_number: e.target.value }))}
                  className="input-field"
                  placeholder="예: 2023타경12345"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신청일</label>
                <input
                  type="date"
                  value={enforcementForm.application_date}
                  onChange={(e) => setEnforcementForm(prev => ({ ...prev, application_date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={enforcementForm.status}
                  onChange={(e) => setEnforcementForm(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                  <option value="중단">중단</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={enforcementForm.notes}
                  onChange={(e) => setEnforcementForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="추가 메모"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEnforcementModal(false)}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상환 기록 추가 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">상환 기록 추가</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상환금액</label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: formatNumber(e.target.value) }))}
                    className="input-field pr-12"
                    placeholder="1,000,000"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">원</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상환일</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상환방법</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="input-field"
                >
                  <option value="계좌입금">계좌입금</option>
                  <option value="현금">현금</option>
                  <option value="수표">수표</option>
                  <option value="강제집행">강제집행</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="상환 관련 메모"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary"
                >
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtorDetail; 