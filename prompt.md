삼행시 생성기 웹 앱을 만들어줘. 요구사항은 다음과 같아:

[기능]
- 사용자가 단어를 입력하는 입력창
- "삼행시 생성" 버튼
- 생성된 삼행시를 보여주는 결과 영역
- Claude API를 호출하여 삼행시 생성

[디자인]
- 깔끔하고 모던한 UI
- 반응형 디자인 (모바일 대응)
- 그라데이션 배경과 카드 레이아웃
- 로딩 애니메이션 포함

[기술 스택]
- HTML, CSS, JavaScript (Vanilla JS)
- Claude API 연동
- **Vercel 배포 준비** (환경변수 설정, serverless functions 사용)
[배포 환경]
- Vercel로 배포 예정
- API 키는 Vercel 환경변수로 관리
- API 호출은 serverless function으로 처리하여 키 노출 방지
[API 설정]
Workbench에서 테스트한 API 코드를 사용해줘:

import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="my_api_key",
)

message = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=20000,
    temperature=1,
    system="당신은 삼행시 작가입니다.\n사용자가 입력한 3글자로 삼행시를 작성하세요.\n\n규칙:\n1. 각 글자로 시작하는 문장을 작성합니다.\n2. 긍정적이고 유머러스한 톤을 유지합니다.\n3. 각 줄은 자연스럽게 이어져야 합니다.\n\n출력 형식 (반드시 이 형식만 출력):\n[첫번째글자]: [문장]\n[두번째글자]: [문장]\n[세번째글자]: [문장]\n\n주의: 삼행시 3줄만 출력하세요. 인사말, 설명, 부연설명 등 다른 텍스트는 절대 포함하지 마세요.",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "김태경\n"
                }
            ]
        }
    ]
)
print(message.content)

이 코드의 system prompt와 파라미터를 그대로 사용해서 구현해줘.