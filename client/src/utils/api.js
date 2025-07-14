import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 채무자 관련 API
export const debtorAPI = {
  // 모든 채무자 조회
  getAll: () => api.get('/api/debtors'),
  
  // 특정 채무자 상세 조회
  getById: (id) => api.get(`/api/debtors/${id}`),
  
  // 새 채무자 추가
  create: (debtorData) => api.post('/api/debtors', debtorData),
  
  // 채무자 정보 수정
  update: (id, debtorData) => api.put(`/api/debtors/${id}`, debtorData),
  
  // 채무자 삭제
  delete: (id) => api.delete(`/api/debtors/${id}`),
};

// 강제집행 절차 관련 API
export const enforcementAPI = {
  // 강제집행 절차 추가
  create: (procedureData) => api.post('/api/enforcement-procedures', procedureData),
  
  // 강제집행 절차 수정
  update: (id, procedureData) => api.put(`/api/enforcement-procedures/${id}`, procedureData),
  
  // 강제집행 절차 삭제
  delete: (id) => api.delete(`/api/enforcement-procedures/${id}`),
};

// 상환 기록 관련 API
export const paymentAPI = {
  // 상환 기록 추가
  create: (paymentData) => api.post('/api/payments', paymentData),
  
  // 상환 기록 수정
  update: (id, paymentData) => api.put(`/api/payments/${id}`, paymentData),
  
  // 상환 기록 삭제
  delete: (id) => api.delete(`/api/payments/${id}`),
};

// 대시보드 통계 API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard-stats'),
};

// 유틸리티 함수들
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ko-KR');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ko-KR');
};

export default api; 