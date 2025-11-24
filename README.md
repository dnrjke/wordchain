# Wordchain (끝말잇기 게임)

한국어-일본어 끝말잇기 게임 프로젝트입니다.

**배포 URL**: https://RUGISa.github.io/wordchain/

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

## 📦 GitHub Pages 배포를 위한 사전 준비

이 프로젝트는 Astro + React 기반의 **정적 사이트**이며, `astro.config.mjs` 에서 `output: "static"` 으로 설정해 두었습니다.  
아래 내용까지만 준비되어 있으면, 배포 담당자가 GitHub Pages 설정만 추가해서 바로 올릴 수 있습니다.

### 1. 의존성 설치 및 빌드

```bash
npm install
npm run build
```

빌드 결과는 `dist/` 디렉터리에 생성되며, 이 폴더를 그대로 GitHub Pages에 올리면 됩니다.

### 2. `astro.config.mjs` 의 site / base 설정

현재 프로젝트는 다음과 같이 설정되어 있습니다:

```js
export default defineConfig({
  integrations: [react()],
  output: "static",
  site: "https://RUGISa.github.io",
  base: "/wordchain",
});
```

**배포 URL**: `https://RUGISa.github.io/wordchain/`

#### 설정 예시

- **사용자/Organization 페이지** (예: `github-username.github.io`):
  - `site: "https://github-username.github.io"`
  - `base: "/"`  (또는 생략)
- **프로젝트 페이지** (예: `github-username.github.io/repo-name`):
  - `site: "https://github-username.github.io"`
  - `base: "/repo-name"`

다른 저장소로 배포하려면 위 값을 실제 GitHub 사용자명/레포명에 맞게 수정하면 됩니다.

### 3. API 서버

프론트엔드는 Render에 올라간 서버(`https://word-chain-server.onrender.com/api`)에 바로 요청하도록 되어 있으므로,  
GitHub Pages 쪽에서는 별도의 백엔드 설정 없이 **정적 파일만 올려도 동작**합니다.
