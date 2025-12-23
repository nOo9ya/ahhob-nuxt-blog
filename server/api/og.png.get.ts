/**
 * 파일 기능: OG 이미지 동적 생성 API
 * 위치: server/api/og.png.get.ts
 * 권한: 공개 (인증 불필요)
 *
 * 데이터 흐름:
 * 1. GET /api/og.png?title=제목&description=설명&siteName=사이트명 요청
 * 2. 쿼리 파라미터에서 제목, 설명, 사이트명 추출
 * 3. 로컬 Pretendard 폰트 로드 (Regular, Bold - TTF 포맷)
 * 4. HTML 템플릿 → SVG 변환 (Satori)
 * 5. SVG → PNG 변환 (Resvg)
 * 6. PNG 이미지 반환 (Cache-Control: 1주일)
 */

import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const title = (query.title as string) || 'No Title';
    const description = (query.description as string) || '';
    const siteName = (query.siteName as string) || 'Nuxt Blog';

    // 로컬 Pretendard 폰트 로드 (TTF 포맷)
    // Regular (400), Bold (700) 두 가지 굵기 지원
    const fontPathRegular = join(process.cwd(), 'app', 'assets', 'fonts', 'Pretendard-Regular.ttf');
    const fontPathBold = join(process.cwd(), 'app', 'assets', 'fonts', 'Pretendard-Bold.ttf');

    const [fontDataRegular, fontDataBold] = await Promise.all([
        readFile(fontPathRegular),
        readFile(fontPathBold),
    ]);

    // HTML 템플릿 정의
    // 주의: Satori는 모든 div에 display: flex가 명시되어야 자식이 여러 개일 때 에러가 나지 않습니다.
    const markup = html`
    <div style="display: flex; width: 100%; height: 100%; background-color: #ffffff; position: relative;">
        <!-- Grid Pattern Background -->
        <div style="display: flex; position: absolute; width: 100%; height: 100%; background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px); background-size: 40px 40px;"></div>
        
        <!-- Top Gradient Fade -->
        <div style="display: flex; position: absolute; top: 0; left: 0; width: 100%; height: 300px; background-image: linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);"></div>

        <!-- Main Content Container via Flex -->
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 80px; justify-content: space-between; z-index: 10;">
            
            <!-- Brand Badge -->
            <div style="display: flex; align-items: center;">
                <div style="display: flex; align-items: center; justify-content: center; padding: 8px 16px; background-color: #0f172a; border-radius: 99px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <span style="font-size: 20px;">⚡</span>
                    <span style="font-size: 18px; font-weight: 700; color: #ffffff; margin-left: 8px; letter-spacing: 0.5px;">${siteName}</span>
                </div>
            </div>

            <!-- Title Area -->
            <div style="display: flex; flex-direction: column; margin-top: auto; margin-bottom: 60px;">
                <div style="display: flex; font-size: 80px; font-weight: 900; line-height: 1.05; letter-spacing: -3px; color: #0f172a; margin-bottom: 24px; text-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    ${title}
                </div>
                <div style="display: flex; font-size: 32px; color: #64748b; font-weight: 500; line-height: 1.5; max-width: 80%;">
                    ${description}
                </div>
            </div>

            <!-- Footer Meta -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 32px; border-top: 2px solid #e2e8f0;">
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 20px; color: #3b82f6; font-weight: 700;">Tech & Insights</span>
                    <span style="font-size: 20px; color: #cbd5e1; margin: 0 16px;">|</span>
                    <span style="font-size: 20px; color: #64748b;">December 22, 2024</span>
                </div>
                <div style="display: flex; align-items: center;">
                     <div style="display: flex; width: 48px; height: 48px; background-color: #3b82f6; border-radius: 50%; align-items: center; justify-content: center;">
                        <span style="font-size: 24px; color: white;">→</span>
                     </div>
                </div>
            </div>
        </div>
    </div>
  `;

    // SVG 생성 (Satori)
    // Pretendard Regular (400), Bold (700) 폰트 적용
    const svg = await satori(markup, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Pretendard',
                data: fontDataRegular,
                weight: 400,
                style: 'normal',
            },
            {
                name: 'Pretendard',
                data: fontDataBold,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    // SVG -> PNG 변환
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 헤더 설정 및 응답
    setHeader(event, 'Content-Type', 'image/png');
    setHeader(event, 'Cache-Control', 'public, max-age=604800, immutable'); // 1주일 캐시

    return pngBuffer;
});
