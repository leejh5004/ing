import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { debtorAPI, formatCurrency, formatDate } from '../utils/api';

const DebtorList = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDebtors();
  }, []);

  const loadDebtors = async () => {
    try {
      setLoading(true);
      const response = await debtorAPI.getAll();
      setDebtors(response.data);
    } catch (err) {
      setError('채무자 목록을 불러오는데 실패했습니다.');
      console.error('Load debtors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDebtors = debtors.filter(debtor =>
    debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (debtor.phone && debtor.phone.includes(searchTerm)) ||
    (debtor.original_case_number && debtor.original_case_number.includes(searchTerm))
  );

  const getStatusBadge = (debtor) => {
    const repaymentRate = debtor.debt_amount > 0 ? (debtor.paid_amount / debtor.debt_amount) * 100 : 0;
    
    if (repaymentRate >= 100) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
    } else if (repaymentRate >= 50) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">진행중</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">미진행</span>;
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

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">채무자 목록</h1>
          <p className="text-gray-600 mt-2">총 {debtors.length}명의 채무자가 등록되어 있습니다</p>
        </div>
        <Link
          to="/add-debtor"
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>새 채무자 추가</span>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="이름, 전화번호, 사건번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            onClick={loadDebtors}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 채무자 목록 */}
      {filteredDebtors.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-6xl">👥</span>
          <h3 className="text-xl font-semibold text-gray-900 mt-4">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 채무자가 없습니다'}
          </h3>
          <p className="text-gray-600 mt-2">
            {searchTerm ? '다른 검색어를 시도해보세요' : '새로운 채무자를 추가해보세요'}
          </p>
          {!searchTerm && (
            <Link to="/add-debtor" className="btn-primary mt-4 inline-flex items-center space-x-2">
              <span>➕</span>
              <span>첫 채무자 추가하기</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">이름</th>
                    <th className="table-header">강제집행 절차</th>
                    <th className="table-header">사건번호</th>
                    <th className="table-header">채무금액</th>
                    <th className="table-header">상환금액</th>
                    <th className="table-header">잔여금액</th>
                    <th className="table-header">상태</th>
                    <th className="table-header">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDebtors.map((debtor) => {
                    // 강제집행 절차가 없는 경우 기본 행 표시
                    if (!debtor.procedures || debtor.procedures.length === 0) {
                      return (
                        <tr key={`debtor-${debtor.id}`} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <div className="font-medium text-gray-900">{debtor.name}</div>
                            <div className="text-sm text-gray-500">{debtor.phone || ''}</div>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-400 text-sm">절차 없음</span>
                          </td>
                          <td className="table-cell">
                            <div className="text-sm text-gray-600">
                              {debtor.original_case_number || '-'}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium text-red-600">
                              {formatCurrency(debtor.debt_amount)}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium text-green-600">
                              {formatCurrency(debtor.paid_amount)}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium text-orange-600">
                              {formatCurrency(debtor.remaining_amount)}
                            </div>
                          </td>
                          <td className="table-cell">
                            {getStatusBadge(debtor)}
                          </td>
                          <td className="table-cell">
                            <Link
                              to={`/debtors/${debtor.id}`}
                              className="text-primary-600 hover:text-primary-800 font-medium"
                            >
                              상세보기
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                    
                    // 강제집행 절차별로 행 생성
                    return debtor.procedures.map((procedure, index) => (
                      <tr key={`${debtor.id}-${procedure.id}`} className="hover:bg-gray-50">
                        <td className="table-cell">
                          {index === 0 ? (
                            <div>
                              <div className="font-medium text-gray-900">{debtor.name}</div>
                              <div className="text-sm text-gray-500">{debtor.phone || ''}</div>
                            </div>
                          ) : (
                            <div className="text-gray-300">〃</div>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {procedure.procedure_type === '통장압류' ? '🏦' : 
                               procedure.procedure_type === '재산명시' ? '📋' : 
                               procedure.procedure_type === '급여압류' ? '💼' : '⚖️'}
                            </span>
                            <span className="font-medium">{procedure.procedure_type}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(procedure.application_date)}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm font-mono text-gray-900">
                            {procedure.case_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {procedure.status === '진행중' ? '🔄 진행중' : 
                             procedure.status === '완료' ? '✅ 완료' : 
                             procedure.status === '중단' ? '⏸️ 중단' : procedure.status}
                          </div>
                        </td>
                        <td className="table-cell">
                          {index === 0 ? (
                            <div className="font-medium text-red-600">
                              {formatCurrency(debtor.debt_amount)}
                            </div>
                          ) : (
                            <div className="text-gray-300">〃</div>
                          )}
                        </td>
                        <td className="table-cell">
                          {index === 0 ? (
                            <div className="font-medium text-green-600">
                              {formatCurrency(debtor.paid_amount)}
                            </div>
                          ) : (
                            <div className="text-gray-300">〃</div>
                          )}
                        </td>
                        <td className="table-cell">
                          {index === 0 ? (
                            <div className="font-medium text-orange-600">
                              {formatCurrency(debtor.remaining_amount)}
                            </div>
                          ) : (
                            <div className="text-gray-300">〃</div>
                          )}
                        </td>
                        <td className="table-cell">
                          {index === 0 ? getStatusBadge(debtor) : null}
                        </td>
                        <td className="table-cell">
                          {index === 0 ? (
                            <Link
                              to={`/debtors/${debtor.id}`}
                              className="text-primary-600 hover:text-primary-800 font-medium"
                            >
                              상세보기
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="lg:hidden space-y-4">
            {filteredDebtors.map((debtor) => (
              <div key={debtor.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{debtor.name}</h3>
                    {debtor.phone && (
                      <p className="text-sm text-gray-600">{debtor.phone}</p>
                    )}
                  </div>
                  {getStatusBadge(debtor)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">채무금액</span>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(debtor.debt_amount)}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">잔여금액</span>
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(debtor.remaining_amount)}</p>
                  </div>
                </div>

                {/* 강제집행 절차 */}
                {debtor.procedures && debtor.procedures.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">강제집행 절차</h4>
                    <div className="space-y-2">
                      {debtor.procedures.map((procedure) => (
                        <div key={procedure.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {procedure.procedure_type === '통장압류' ? '🏦' : 
                                 procedure.procedure_type === '재산명시' ? '📋' : 
                                 procedure.procedure_type === '급여압류' ? '💼' : '⚖️'}
                              </span>
                              <span className="font-medium text-gray-900">{procedure.procedure_type}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              procedure.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                              procedure.status === '완료' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {procedure.status}
                            </span>
                          </div>
                          <p className="text-sm font-mono text-gray-700">{procedure.case_number}</p>
                          <p className="text-xs text-gray-500">{formatDate(procedure.application_date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">강제집행 절차 없음</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    상환: {formatCurrency(debtor.paid_amount)}
                  </div>
                  <Link
                    to={`/debtors/${debtor.id}`}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 요약 통계 */}
      {filteredDebtors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredDebtors.length}
            </div>
            <div className="text-sm text-gray-600">총 채무자</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(filteredDebtors.reduce((sum, debtor) => sum + debtor.debt_amount, 0))}
            </div>
            <div className="text-sm text-gray-600">총 채무금액</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(filteredDebtors.reduce((sum, debtor) => sum + debtor.paid_amount, 0))}
            </div>
            <div className="text-sm text-gray-600">총 상환금액</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(filteredDebtors.reduce((sum, debtor) => sum + debtor.remaining_amount, 0))}
            </div>
            <div className="text-sm text-gray-600">총 잔여금액</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtorList; 