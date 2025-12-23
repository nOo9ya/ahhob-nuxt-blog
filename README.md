# Nuxt Blog Boilerplate

> 현대적인 블로그 플랫폼을 위한 Nuxt 4 기반 보일러플레이트

[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.1-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [빠른 시작](#-빠른-시작)
- [환경 설정](#-환경-설정)
- [디렉토리 구조](#-디렉토리-구조)
- [주요 기능 상세](#-주요-기능-상세)
- [배포](#-배포)
- [라이선스](#-라이선스)

---

## ✨ 주요 기능

### 콘텐츠 관리
- 📝 **마크다운 기반 글쓰기** - Tiptap 에디터 (이미지 업로드, 코드 하이라이팅, 컬러 피커)
- 🗂️ **계층형 카테고리** - 무제한 depth 카테고리 트리
- 🏷️ **태그 시스템** - 다중 태그 지원
- 📄 **정적 페이지** - About, Contact 등 커스텀 페이지

### 사용자 경험
- 💬 **댓글 시스템** - 계층형 댓글, 관리자 댓글 제어 (전체/로그인/비활성화)
- ❤️ **좋아요 & 조회수** - 중복 방지 로직, 실시간 카운팅
- 🔍 **전문 검색** - FULLTEXT 검색, 카테고리/태그 필터링
- 📱 **반응형 디자인** - 모바일 최적화, 다크 모드 지원
- 🎨 **검색 모달** - 모바일/데스크톱 통합 검색 UX

### SEO & 성능
- 🚀 **SEO 최적화** - 동적 메타 태그, Open Graph, JSON-LD
- 🤖 **GEO 지원** - AI 검색 엔진 최적화 메타데이터
- 🖼️ **동적 OG 이미지** - 서버 사이드 이미지 생성 (Satori + Resvg)
- 🔍 **검색엔진 인증** - Naver, Google, Bing 웹마스터 도구 통합
- ⚡ **로컬 폰트** - Pretendard WOFF2 (CDN 제거로 성능 향상)

### 분석 & 관리
- 📊 **웹 애널리틱스** - 방문자 추적, 인기 페이지, Referrer 분석
- 📈 **실시간 대시보드** - 오늘 방문자, 차트 시각화 (Chart.js)
- 👥 **회원 관리** - 회원가입 제어, 프로필 관리, 북마크
- 🛡️ **보안** - CSRF, Rate Limiting, CSP Nonce

### 개발자 경험
- 🐳 **Docker 지원** - 개발/프로덕션 환경 분리
- 🔄 **CI/CD** - GitHub Actions 워크플로우
- 📝 **TypeScript** - 완전한 타입 안정성
- 🎯 **Drizzle ORM** - 타입 안전 DB 쿼리

---

## 🛠️ 기술 스택

### 프론트엔드
- **Nuxt 4.2.1** - Vue 3 메타 프레임워크
- **TypeScript 5.x** - 타입 안정성
- **Tailwind CSS 3.x** - 유틸리티 우선 CSS
- **Pinia** - 상태 관리
- **VueUse** - Vue 컴포저블 유틸리티

### 백엔드
- **Nuxt Server API** - 서버리스 API
- **Drizzle ORM** - 타입 안전 ORM
- **MariaDB 10.6+** - 관계형 데이터베이스
- **Nuxt Auth Utils** - 세션 기반 인증

### 에디터 & UI
- **Tiptap** - 리치 텍스트 에디터
- **Highlight.js** - 코드 신택스 하이라이팅
- **Chart.js** - 차트 시각화
- **Satori + Resvg** - OG 이미지 생성

### 보안 & 성능
- **Nuxt Security** - CSRF, Rate Limiting, CSP
- **Sharp** - 이미지 최적화
- **@nuxt/image** - 자동 이미지 최적화

---

## 🚀 빠른 시작

### 요구사항

- **Node.js** 18.x 이상
- **Docker & Docker Compose** (권장)
- **Git**

### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/nuxt-blog-boilerplate.git
cd nuxt-blog-boilerplate
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 값들을 설정하세요:

```env
# Database
DB_HOST=db
DB_PORT=3306
DB_USER=blog_user
DB_PASSWORD=your_secure_password
DB_NAME=blog_db

# Session
SESSION_SECRET=your_random_secret_key_here

# Public
NUXT_PUBLIC_SITE_NAME=내 블로그
NUXT_PUBLIC_SITE_DESCRIPTION=최신 기술 블로그
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_TYPE=Person
NUXT_PUBLIC_TWITTER_SITE=@yourblog
```

### 3. Docker로 실행 (권장)

```bash
# 개발 환경 실행
docker compose up -d

# 로그 확인
docker compose logs -f app
```

브라우저에서 http://localhost:3000 접속

### 4. 로컬 실행 (Docker 없이)

MariaDB를 별도로 설치한 후:

```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run db:push

# Seed 데이터 삽입
npm run seed

# 개발 서버 실행
npm run dev
```

### 5. 관리자 계정

Seed 실행 후 기본 관리자 계정:

- **이메일**: `admin@example.com`
- **비밀번호**: `admin123`

⚠️ **프로덕션 배포 전 반드시 비밀번호를 변경하세요!**

---

## ⚙️ 환경 설정

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DB_HOST` | 데이터베이스 호스트 | `db` (Docker) / `localhost` |
| `DB_PORT` | 데이터베이스 포트 | `3306` |
| `DB_USER` | DB 사용자명 | `blog_user` |
| `DB_PASSWORD` | DB 비밀번호 | `secure_password` |
| `DB_NAME` | DB 이름 | `blog_db` |
| `SESSION_SECRET` | 세션 암호화 키 (32자 이상) | 랜덤 문자열 |

### 선택 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NUXT_PUBLIC_SITE_NAME` | 사이트 이름 | `블로그` |
| `NUXT_PUBLIC_SITE_DESCRIPTION` | 사이트 설명 | `최신 뉴스 및 기술 블로그` |
| `NUXT_PUBLIC_SITE_URL` | 사이트 URL | `http://localhost:3000` |
| `NUXT_PUBLIC_SITE_TYPE` | 사이트 타입 (Person/Organization) | `Person` |
| `NUXT_PUBLIC_TWITTER_SITE` | 트위터 계정 | `@blog` |

### SESSION_SECRET 생성

```bash
# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 또는 OpenSSL로 생성
openssl rand -base64 32
```

---

## 📁 디렉토리 구조

```
nuxt-blog-boilerplate/
├── app/                          # Nuxt 4 App Layer
│   ├── assets/                   # 정적 자산 (CSS, 폰트)
│   │   ├── css/
│   │   │   └── fonts.css        # 로컬 Pretendard 폰트
│   │   └── fonts/               # WOFF2 폰트 파일
│   ├── components/              # Vue 컴포넌트
│   │   ├── admin/               # 관리자 전용
│   │   ├── article/             # 기사 관련
│   │   ├── comment/             # 댓글 시스템
│   │   ├── common/              # 공통 (헤더, 검색 모달 등)
│   │   └── ui/                  # UI 요소
│   ├── composables/             # Vue Composables
│   ├── layouts/                 # 레이아웃 (default, admin)
│   ├── pages/                   # 페이지 라우트
│   │   ├── admin/               # 관리자 페이지
│   │   ├── [...slug].vue        # Catch-all 라우트
│   │   └── index.vue            # 홈페이지
│   ├── plugins/                 # Nuxt 플러그인
│   └── app.vue                  # 루트 컴포넌트
├── server/                      # 서버 API
│   ├── api/                     # API 엔드포인트
│   │   ├── admin/               # 관리자 API
│   │   ├── articles/            # 기사 API
│   │   ├── auth/                # 인증 API
│   │   ├── categories/          # 카테고리 API
│   │   ├── comments/            # 댓글 API
│   │   └── settings/            # 설정 API
│   ├── database/                # DB 스키마
│   │   └── schema.ts            # Drizzle 스키마
│   ├── middleware/              # 서버 미들웨어
│   ├── plugins/                 # 서버 플러그인
│   └── utils/                   # 서버 유틸리티
├── scripts/                     # 유틸리티 스크립트
│   └── seed.ts                  # DB Seed 데이터
├── .docker/                     # Docker 설정
│   ├── nginx/                   # Nginx 설정
│   └── node/                    # Node.js Dockerfile
├── docs/                        # 문서
├── tests/                       # 테스트
├── docker-compose.yml           # 개발 환경
├── docker-compose.prod.yml      # 프로덕션 환경
├── nuxt.config.ts               # Nuxt 설정
├── drizzle.config.ts            # Drizzle 설정
└── package.json                 # 의존성 관리
```

---

## 🎯 주요 기능 상세

### 1. 콘텐츠 관리 시스템

**기사 작성 & 관리**
- Tiptap 리치 텍스트 에디터
- 이미지 직접 업로드 (Sharp 자동 최적화)
- 코드 블록 (Highlight.js 신택스 하이라이팅)
- 컬러 피커, 링크, 굵기, 기울임 등
- 초안/발행 상태 관리
- SEO 메타데이터 자동 완성

**카테고리 & 태그**
- 무제한 depth 계층형 카테고리
- 카테고리별 경로 자동 생성 (예: `/tech/ai/machine-learning`)
- 다중 태그 시스템
- 카테고리/태그 필터링 검색

### 2. SEO & OG 이미지

**검색엔진 최적화**
- 동적 메타 태그 (title, description, og:*)
- JSON-LD 구조화 데이터 (Article, BreadcrumbList)
- Sitemap 자동 생성
- Canonical URL 설정
- 검색엔진 소유자 확인 메타 태그 (관리자 페이지에서 설정)

**동적 OG 이미지 생성**
- 서버 사이드 이미지 생성 (Satori + Resvg)
- 로컬 Pretendard 폰트 사용
- 제목, 설명, 사이트명 자동 삽입
- 1주일 캐싱 (`Cache-Control`)

### 3. 댓글 시스템

**기능**
- 계층형 댓글 (무제한 depth 대댓글)
- 로그인 사용자만 작성 가능
- 관리자 댓글 제어 (전체 허용 / 로그인 사용자만 / 비활성화)
- 작성자 본인만 삭제 가능

**보안**
- XSS 방지 (HTML 이스케이프)
- CSRF 토큰 검증
- Rate Limiting (100회/분)

### 4. 웹 애널리틱스

**추적 데이터**
- 일별 방문자 수 (IP 해싱 중복 방지)
- 인기 페이지 TOP 10
- Referrer 분석 (검색엔진, 소셜미디어, Direct)
- 실시간 통계

**차트 시각화**
- 방문자 추이 (라인 차트)
- Referrer 비율 (도넛 차트)
- 인기 페이지 (바 차트)

### 5. 회원 시스템

**회원가입 & 로그인**
- 이메일/비밀번호 기반 인증
- 비밀번호 강도 측정기
- 회원가입 제어 (관리자 설정)
- 세션 기반 인증 (useSession)

**프로필 관리**
- 닉네임, 프로필 사진 수정
- 내가 쓴 댓글 조회
- 북마크 기능 (향후 추가 예정)

### 6. 관리자 대시보드

**실시간 통계**
- 오늘 방문자 수
- 총 기사/댓글/사용자 수
- 최근 댓글 목록
- 인기 페이지 TOP 5

**콘텐츠 관리**
- 기사 CRUD (생성, 읽기, 수정, 삭제)
- 카테고리/태그 관리
- 댓글 관리 (삭제)
- 사용자 관리

**사이트 설정**
- 사이트 정보 (이름, 설명, URL)
- 회원가입 제어
- 댓글 정책 (전체/로그인/비활성화)
- 검색엔진 인증 코드 (Naver, Google, Bing)
- Google AdSense 클라이언트 ID

---

## 📦 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start

# 타입 체크
npm run typecheck

# Linting
npm run lint

# DB 마이그레이션
npm run db:push
npm run db:generate

# Seed 데이터 삽입
npm run seed

# Docker 개발 환경
docker compose up -d
docker compose down

# Docker 프로덕션 환경
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
```

---

## 🚢 배포

### Docker를 사용한 프로덕션 배포

1. **환경 변수 설정** (`.env.production`)

```env
DB_HOST=your-production-db-host
DB_PASSWORD=strong_production_password
SESSION_SECRET=your_production_secret_key
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
```

2. **프로덕션 빌드 & 실행**

```bash
# 프로덕션 컨테이너 실행
docker compose -f docker-compose.prod.yml up -d --build

# 로그 확인
docker compose -f docker-compose.prod.yml logs -f
```

3. **Nginx 리버스 프록시 설정**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL 인증서 (Let's Encrypt)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 상세 배포 가이드

자세한 배포 방법은 [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)를 참고하세요:
- AWS Lightsail 배포
- Rollback 전략
- Staging vs Production 환경 구성
- CI/CD (GitHub Actions)

---

## 🔒 보안

### 구현된 보안 기능

- ✅ **CSRF 보호** - nuxt-security 모듈
- ✅ **Rate Limiting** - 100회/분 제한
- ✅ **CSP (Content Security Policy)** - Nonce 기반
- ✅ **XSS 방지** - HTML 이스케이프
- ✅ **SQL Injection 방지** - Prepared Statements (Drizzle ORM)
- ✅ **비밀번호 해싱** - bcrypt (saltRounds: 10)
- ✅ **세션 보안** - httpOnly, secure, sameSite 쿠키

### 보안 권장사항

1. **프로덕션 배포 전 필수 작업**
   - `SESSION_SECRET` 변경 (32자 이상 랜덤 문자열)
   - DB 비밀번호 변경
   - 관리자 계정 비밀번호 변경
   - `.env` 파일을 Git에 커밋하지 않기

2. **정기 업데이트**
   - 의존성 패키지 업데이트 (`npm audit fix`)
   - Node.js, Docker 이미지 업데이트

3. **백업**
   - 데이터베이스 정기 백업
   - 업로드 이미지 백업

---

## 📚 문서

- [배포 가이드](docs/DEPLOYMENT_GUIDE.md)
- [API 명세](docs/API_SPECIFICATION.md)
- [프로젝트 구조](docs/PROJECT_STRUCTURE.md)
- [보안 가이드](docs/SECURITY_GUIDE.md)
- [성능 최적화](docs/PERFORMANCE_OPTIMIZATION.md)

---

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:

- [Nuxt](https://nuxt.com) - Vue.js 메타 프레임워크
- [Drizzle ORM](https://orm.drizzle.team) - 타입 안전 ORM
- [Tiptap](https://tiptap.dev) - 리치 텍스트 에디터
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크
- [Chart.js](https://www.chartjs.org) - 차트 라이브러리

---

## 📧 문의

프로젝트 관련 문의사항이 있으시면 [이슈](https://github.com/yourusername/nuxt-blog-boilerplate/issues)를 열어주세요.

---

**Made with ❤️ using Nuxt 4**
