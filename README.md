# Resource Hub

회사·기관의 자원, 예약, 대여·반납, 점검 업무를 관리하는 포트폴리오용 프론트엔드 프로젝트입니다.

관리자·사용자 프론트엔드가 구현되어 있으며, 현재 데이터는 `services/`가 제공하는 메모리 기반 mock입니다.
실제 API 연동은 각 service의 구현만 Axios 요청으로 교체하는 방식으로 진행합니다.

## 실행

```bash
npm install
npm run dev
```

검증: `npm run lint`, `npm run typecheck`, `npm run build`

## 포트폴리오 시연 로그인

로컬 기본 주소는 Vite 개발 서버(`http://localhost:5173`)입니다.

| 구분 | URL | 시연 입력 | 인증 방식 |
|------|-----|-----------|-----------|
| 사용자 | `/login` | 아이디 `user`, 비밀번호 `1111` | Firebase 미사용, mock 세션 (대표 사용자 **김민수** 프로필) |
| 관리자 | `/admin/login` | 아이디 `admin`, 비밀번호는 Firebase Console에 등록한 값 | Firebase Authentication |

- 관리자 Firebase **이메일**은 `.env`의 `VITE_ADMIN_AUTH_EMAIL`에만 설정합니다. 화면에서는 아이디 `admin`만 입력합니다.
- 관리자 **비밀번호**와 실제 Firebase 이메일은 README·코드에 기록하지 않습니다.
- 예약·사용자 목록 등의 더미 데이터(`usersMock`, `reservationUsers` 등)는 시연용 샘플이며, 로그인 계정과 1:1로 대응하지 않습니다.
- 사용자 mock 세션과 관리자 Firebase 세션은 서로 독립입니다.

## 프로젝트 구조

```text
src/
├─ components/ui/   # 도메인과 분리된 공통 UI
├─ pages/system/    # 디자인 시스템 및 시스템 페이지
├─ routes/          # 라우터와 URL 상수
├─ services/        # mock service와 공통 Axios client
├─ stores/          # 인증 세션·테마·공통 UI 상태
├─ styles/          # 디자인 토큰, 공통 컴포넌트 CSS
├─ types/           # API·도메인 데이터 모델
└─ utils/           # 범용 유틸리티
```

UI와 데이터 접근 계층을 분리하고, 상태 코드와 표시 라벨을 분리하며, CSS 변수 기반 토큰을 사용합니다.

## 백엔드 연결 기준

- API 주소: `.env.example`의 `VITE_API_BASE_URL`
- 공통 HTTP 처리: `src/services/http.ts`
- API 경로 계약: `src/services/endpoints.ts`
- 공통 응답·오류 타입: `src/types/api.ts`
- ID: 핵심 관계형 엔티티는 `EntityId(number)`, 외부 표시용 알림 ID는 `NotificationId(string)`
- 날짜 전송: ISO 8601 문자열, 날짜만 필요한 값은 `YYYY-MM-DD`
- 상태 저장: 영문 상태 코드, 한글 문구는 `src/config/`의 표시 메타데이터

주요 API 범위는 자원·예약·대여·점검·사용자 CRUD/처리, 통계·설정 조회 및 저장,
사용자 본인 예약·대여·알림·프로필, 로그인·로그아웃·토큰 갱신입니다. 세부 경로는
`API_ENDPOINTS`를 기준으로 PHP REST API와 합의합니다.

---

## Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
