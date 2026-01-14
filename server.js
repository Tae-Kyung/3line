import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 파일 로드 (.env.local 또는 .env)
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const equalIndex = line.indexOf('=');
            if (equalIndex > 0) {
                const key = line.substring(0, equalIndex).trim();
                const value = line.substring(equalIndex + 1).trim();
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
        console.log(`환경변수 로드 완료: ${envFile}`);
        break;
    }
}

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `당신은 삼행시 작가입니다.
사용자가 입력한 3글자로 삼행시를 작성하세요.

규칙:
1. 각 글자로 시작하는 문장을 작성합니다.
2. 긍정적이고 유머러스한 톤을 유지합니다.
3. 각 줄은 자연스럽게 이어져야 합니다.

출력 형식 (반드시 이 형식만 출력):
[첫번째글자]: [문장]
[두번째글자]: [문장]
[세번째글자]: [문장]

주의: 삼행시 3줄만 출력하세요. 인사말, 설명, 부연설명 등 다른 텍스트는 절대 포함하지 마세요.`;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
};

const server = http.createServer(async (req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API 엔드포인트
    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { word } = JSON.parse(body);

                if (!word || word.length !== 3) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '3글자를 입력해주세요.' }));
                    return;
                }

                const message = await client.messages.create({
                    model: 'claude-sonnet-4-5-20250929',
                    max_tokens: 20000,
                    temperature: 1,
                    system: SYSTEM_PROMPT,
                    messages: [
                        {
                            role: 'user',
                            content: [{ type: 'text', text: word }],
                        },
                    ],
                });

                const result = message.content[0].text;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ result }));
            } catch (error) {
                console.error('API Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '삼행시 생성 중 오류가 발생했습니다.' }));
            }
        });
        return;
    }

    // 정적 파일 서빙
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`서버가 실행 중입니다: http://localhost:${PORT}`);
});
