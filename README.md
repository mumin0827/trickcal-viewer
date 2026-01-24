# 트릭컬 사도 뷰어 (Trickcal Viewer)

트릭컬 리바이브(Trickcal Revive)의 사도들의 Spine 애니메이션을 웹에서 감상하고, GIF나 프레임 단위(ZIP)로 저장할 수 있는 뷰어입니다.

## 주요 기능

- **Spine 애니메이션 감상**: 사도들의 스탠딩 모션과 인게임 모션을 모두 지원합니다.
- **스킨 변경**: 기본 스킨뿐만 아니라 다양한 스킨을 선택하여 볼 수 있습니다.
- **모션 제어**: 재생/일시정지, 모션 변경, 등이 가능합니다.
- **내보내기 (Export)**:
  - **GIF**: 원하는 장면을 고화질 GIF 움짤로 생성합니다.
  - **ZIP**: 프레임 단위의 PNG 이미지 모음으로 다운로드합니다.
- **테마 모드**: 라이트 모드와 다크 모드를 지원하여 눈이 편안한 환경을 제공합니다.
- **검색 기능**: 사도 이름(한글 초성 검색 지원)으로 빠르게 원하는 캐릭터를 찾을 수 있습니다.

## 기술 스택 (Tech Stack)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

- **Animation**: Spine Web Player (4.2.5)
- **Styling**: CSS Modules, Tailwind CSS
- **Media Processing**: @ffmpeg/ffmpeg (WASM 기반 클라이언트 사이드 인코딩)

## 설치 및 실행 (Installation)

이 프로젝트를 로컬 환경에서 실행하려면 Node.js가 필요합니다.

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/trickcal-viewer.git

# 2. 프로젝트 폴더로 이동
cd trickcal-viewer

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

## 배포 시 주의사항 (Deployment)

이 프로젝트는 브라우저 내에서 고성능 미디어 처리를 위해 `SharedArrayBuffer`를 사용합니다. 따라서 배포 서버(Hosting)에서 반드시 아래 보안 헤더(Response Headers)를 설정해야 합니다.

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

**Cloudflare Pages**를 사용하는 경우, `public/_headers` 파일에 해당 설정이 이미 포함되어 있어 별도의 설정 없이 배포 가능합니다.

## 라이선스 및 저작권

**트릭컬 리바이브(Trickcal Revive)** 2차 창작물 입니다.

- **캐릭터 및 에셋, 이미지 리소스의 저작권**은 모두 에피드게임즈(EpidGames)에 있습니다.
- **Spine Runtime**: Esoteric Software의 라이선스 정책을 따릅니다.
