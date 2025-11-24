// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  // GitHub Pages 등 정적 호스팅을 위한 설정
  // - output: "static" 으로 빌드 결과를 순수 정적 파일로 생성합니다.
  // - 실제 배포 시에는 배포 담당자가 아래 site / base 값을 프로젝트에 맞게 채워야 합니다.
  //
  // 예시(프로젝트 페이지):
  //   site: "https://github-username.github.io",
  //   base: "/repo-name",
  //
  // 예시(사용자 페이지 or 커스텀 도메인):
  //   site: "https://github-username.github.io",
  //   base: "/",
  output: "static",
  site: "https://RUGISa.github.io",
  base: "/wordchain",
  trailingSlash: "ignore",
  build: {
    format: "directory"
  }
});