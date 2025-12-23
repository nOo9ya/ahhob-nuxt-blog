// import FormData from 'form-data'; // Removed
import fs from 'fs';
import path from 'path';

async function testUpload() {
    console.log('Starting upload verification...');

    // 1. 테스트용 더미 이미지 생성
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    // 간단한 1x1 픽셀 투명 PNG 버퍼 생성
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, pngBuffer);

    // 2. 네이티브 FormData와 Blob 사용
    const form = new FormData();
    const blob = new Blob([fs.readFileSync(testImagePath)], { type: 'image/png' });
    form.append('files', blob, 'test-image.png');
    form.append('categoryPath', 'test/verification');
    form.append('slug', 'auto-test-slug');
    form.append('type', 'featured');
    form.append('optimize', 'true');

    const ports = [3001, 3000];
    const email = 'admin@example.com';
    const password = 'admin123!'; // Use default password for seeding
    let cookie = '';

    // 3. 포트별 로그인 및 업로드 테스트
    for (const port of ports) {
        try {
            console.log(`\nTesting on port ${port}...`);

            // 3-1. 로그인 시도
            console.log(`Logging in as ${email}...`);
            const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!loginResponse.ok) {
                console.log(`⚠️ Login failed on port ${port} (Status: ${loginResponse.status})`);
                continue;
            }

            // 쿠키 추출
            const setCookie = loginResponse.headers.get('set-cookie');
            if (!setCookie) {
                console.log(`⚠️ No cookie received on port ${port}`);
                continue;
            }
            cookie = setCookie;
            console.log('✅ Login successful, cookie acquired.');


            // 3-2. 업로드 시도
            console.log(`Uploading to http://localhost:${port}/api/upload...`);
            const response = await fetch(`http://localhost:${port}/api/upload`, {
                method: 'POST',
                headers: {
                    Cookie: cookie // 인증 쿠키 추가
                },
                body: form,
                // 네이티브 FormData 사용 시 Content-Type 헤더 수동 설정 불필요 (boundary 자동 생성)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.files && data.files.length > 0) {
                    console.log('✅ Upload successful!');
                    const file = data.files[0];
                    const loadPath = (url) => path.join(process.cwd(), 'public', url);

                    if (fs.existsSync(loadPath(file.url))) console.log(`✅ Main file verified: ${file.url}`);
                    else console.error(`❌ Main file missing: ${file.url}`);

                    if (file.variants) {
                        if (file.variants.thumbnail && fs.existsSync(loadPath(file.variants.thumbnail))) {
                            console.log(`✅ Thumbnail verified: ${file.variants.thumbnail}`);
                        } else console.error('❌ Thumbnail missing or check failed');

                        if (file.variants.og && fs.existsSync(loadPath(file.variants.og))) {
                            console.log(`✅ OG Image verified: ${file.variants.og}`);
                        } else console.error('❌ OG Image missing or check failed');
                    }
                    return; // 성공 시 종료
                } else {
                    console.error('❌ Upload failed: No files returned');
                }
            } else {
                console.error(`❌ Upload failed with status: ${response.status}`);
                console.error('Response body:', await response.text());
            }

        } catch (e) {
            if (e.code === 'ECONNREFUSED') {
                console.log(`⚠️ Port ${port} connection refused.`);
                continue;
            }
            console.error(`❌ Error on port ${port}:`, e.message);
        }
    }

    console.error('❌ All connection attempts failed.');

    // 4. 정리 (테스트 이미지 삭제)
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
}

testUpload();
