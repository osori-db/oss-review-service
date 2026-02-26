# OSS 리뷰 관리 - 프로젝트 구조

## 개요

외부 API(`https://olis.or.kr:16443`)와 연동하여 OSS(Open Source Software)의 버전별 리뷰 상태를 관리하는 Next.js 웹 애플리케이션.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| 검증 | Zod 4 |
| 테스트 | Vitest 4, Testing Library, happy-dom |

## 페이지 구조

```
/              → OSS 목록 (검색, 리뷰 상태 필터, 페이지네이션)
/oss/[id]      → OSS 상세 + 버전 목록 (개별/일괄 리뷰 상태 변경)
```

## 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (AuthProvider 래핑)
│   ├── page.tsx                  # OSS 목록 페이지
│   ├── globals.css               # 전역 스타일
│   ├── oss/
│   │   └── [id]/
│   │       └── page.tsx          # OSS 상세 + 버전 리뷰 페이지
│   └── api/                      # API 프록시 라우트 (서버사이드)
│       ├── oss/
│       │   ├── route.ts          # GET: OSS 목록
│       │   └── [id]/
│       │       └── route.ts      # GET: OSS 상세
│       └── oss-versions/
│           ├── route.ts          # GET: 버전 목록
│           ├── [id]/
│           │   └── route.ts      # GET/PUT: 버전 상세/수정
│           └── bulk-review/
│               └── route.ts      # POST: 일괄 리뷰 처리
├── components/                   # UI 컴포넌트
│   ├── AuthTokenInput.tsx        # 토큰 입력/로그아웃 UI
│   ├── ErrorMessage.tsx          # 에러 표시 + 재시도 버튼
│   ├── LoadingSkeleton.tsx       # 로딩 스켈레톤
│   ├── OssDetail.tsx             # OSS 마스터 정보 표시
│   ├── OssList.tsx               # OSS 목록 (검색 + 필터 + 리스트)
│   ├── OssListItem.tsx           # OSS 목록 항목
│   ├── Pagination.tsx            # 재사용 페이지네이션
│   ├── StatusBadge.tsx           # 리뷰 상태 뱃지 (Y/N)
│   ├── StatusBadge.test.tsx      # StatusBadge 테스트
│   ├── VersionItem.tsx           # 버전 항목 (체크박스 + 리뷰 버튼)
│   └── VersionList.tsx           # 버전 목록 (전체 선택 + 일괄 리뷰)
├── contexts/
│   └── AuthContext.tsx            # 인증 토큰 React Context
├── hooks/
│   ├── useAuth.ts                # AuthContext 편의 훅
│   ├── useOssList.ts             # OSS 목록 fetch + 필터 + 페이지네이션
│   └── useOssVersions.ts         # 버전 목록 fetch + 선택 + 리뷰 처리
├── lib/
│   ├── api-client.ts             # 클라이언트 → 프록시 API 호출 유틸
│   ├── external-api.ts           # 서버 → 외부 API 호출 유틸
│   └── types.ts                  # 전체 타입 정의
└── test/
    └── setup.ts                  # Vitest 테스트 설정
```

## 아키텍처

### 데이터 흐름

```
브라우저 (React)
  ↓ X-Auth-Token 헤더
Next.js API 프록시 (서버사이드)
  ↓ Authorization: Bearer <token>
외부 API (https://olis.or.kr:16443)
```

CORS 제약을 회피하기 위해 Next.js API 라우트가 프록시 역할을 수행한다.

### 인증

1. 사용자가 `AuthTokenInput`에 Bearer 토큰 입력
2. `sessionStorage`에 저장, `AuthContext`로 전체 앱에 전달
3. `api-client.ts`가 요청 시 `X-Auth-Token` 헤더에 토큰 포함
4. API 프록시가 `Authorization: Bearer <token>`으로 변환하여 외부 API 호출

### 리뷰 상태

| 값 | 의미 |
|----|------|
| `"Y"` | 리뷰 완료 |
| `"N"` | 미리뷰 |

### 일괄 리뷰 처리

외부 PUT API가 전체 버전 데이터를 요구하므로:

1. 클라이언트: `POST /api/oss-versions/bulk-review` + `{ versionIds, reviewed }`
2. 서버: 각 버전에 대해 `Promise.allSettled`로 병렬 처리
   - `GET` (현재 데이터 조회) → `PUT` (reviewed 필드만 변경)
3. 부분 실패 허용, 결과 요약 반환: `{ total, succeeded, failed }`

### 응답 형식

**외부 API 응답:**
```typescript
{ code: string, messageList: Record<string, unknown>, success: boolean }
```

**내부 API 응답:**
```typescript
{ success: boolean, data?: T, error?: string, meta?: { totalCount, currentPage, pageSize } }
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | 테스트 실행 |
| `npm run lint` | ESLint 검사 |
