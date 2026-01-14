document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('result');
    const resultContent = resultDiv.querySelector('.result-content');
    const errorDiv = document.getElementById('error');

    // 입력창에서 Enter 키 처리
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateSamhaengsi();
        }
    });

    // 생성 버튼 클릭 처리
    generateBtn.addEventListener('click', generateSamhaengsi);

    async function generateSamhaengsi() {
        const word = wordInput.value.trim();

        // 입력 검증
        if (word.length !== 3) {
            showError('3글자를 입력해주세요.');
            return;
        }

        // UI 상태 변경 - 로딩 시작
        setLoading(true);
        hideError();
        hideResult();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '삼행시 생성에 실패했습니다.');
            }

            // 결과 표시
            displayResult(data.result, word);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    }

    function displayResult(text, word) {
        // 결과 파싱 및 표시
        const lines = text.trim().split('\n').filter(line => line.trim());

        let html = '';
        lines.forEach((line, index) => {
            const char = word[index] || '';
            // 줄에서 첫 글자와 나머지 분리
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const content = line.substring(colonIndex + 1).trim();
                html += `<span class="line"><span class="char">${char}</span>: ${content}</span>`;
            } else {
                html += `<span class="line">${line}</span>`;
            }
        });

        resultContent.innerHTML = html;
        resultDiv.classList.remove('hidden');
    }

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        generateBtn.classList.toggle('loading', isLoading);
    }

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    function hideError() {
        errorDiv.classList.add('hidden');
    }

    function hideResult() {
        resultDiv.classList.add('hidden');
    }
});
