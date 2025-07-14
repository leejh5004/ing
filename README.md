# 채무자 관리 시스템

승소한 법원 소송의 채무자들을 관리하고 강제집행 절차를 추적하는 개인용 웹 애플리케이션입니다.

## 주요 기능

- 📋 채무자 정보 관리 (이름, 연락처, 채무금액 등)
- ⚖️ 강제집행 절차 추적 (통장압류, 재산명시, 급여압류)
- 💰 상환 기록 및 진행 상황 관리
- 📊 대시보드를 통한 전체 현황 파악
- 📱 모바일 완전 대응

## 기술 스택

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: SQLite
- **UI**: Tailwind CSS
- **Deploy**: Railway

## 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- npm

### 설치 및 실행
```bash
# 저장소 클론
git clone <repository-url>
cd debt-management-system

# 의존성 설치
npm install

# 개발 서버 실행 (백엔드: 5000, 프론트엔드: 3000)
npm run dev

# 또는 프로덕션 빌드 후 실행
npm run build
npm start
```

## 배포

이 프로젝트는 Railway에 배포되어 있습니다. GitHub와 자동 연동되어 main 브랜치에 푸시하면 자동으로 배포됩니다.

## 프로젝트 구조

```
├── server.js              # Express 서버
├── package.json           # 루트 패키지 설정
├── railway.json           # Railway 배포 설정
├── client/                # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   └── utils/         # API 및 유틸리티
│   └── package.json       # 클라이언트 패키지 설정
└── database.sqlite        # SQLite 데이터베이스 (자동 생성)
```

## API 엔드포인트

- `GET /api/debtors` - 채무자 목록 조회
- `POST /api/debtors` - 새 채무자 추가
- `GET /api/debtors/:id` - 특정 채무자 상세 조회
- `PUT /api/debtors/:id` - 채무자 정보 수정
- `DELETE /api/debtors/:id` - 채무자 삭제
- `GET /api/dashboard/stats` - 대시보드 통계 데이터
- `POST /api/enforcement-procedures` - 강제집행 절차 추가
- `POST /api/payments` - 상환 기록 추가

## 라이선스

이 프로젝트는 개인용으로 제작되었습니다. 