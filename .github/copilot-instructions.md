Projeto: UCM - Ultimate Carreira Marvel.
Aplicação web em Python 3.12 + FastAPI + Google Gemini (google-genai) que indica qual herói
da Marvel representa o perfil profissional do usuário e devolve um plano de carreira.
Frontend estático em app/static (index.html, styles.css, app.js), sem frameworks e sem CDN de scripts.

Regras fixas:
- Todo texto visível ao usuário, mensagens de erro, prompts do Gemini, README e docstrings
  em português do Brasil, COM acentuação correta (UTF-8). Nunca usar emojis.
- O nome oficial do produto é "UCM - Ultimate Carreira Marvel". Não usar "MARVEL Liderança e Carreira".
- Sem scripts inline (CSP script-src 'self'). Usar textContent, nunca innerHTML com dados externos.
- Não persistir dados pessoais. Não registrar em log o conteúdo digitado pelo usuário.
- Não adicionar dependências sem necessidade; fixar versões em requirements.txt.
- Alterações pequenas e revisáveis; após cada tarefa rodar: ruff check app tests && pytest -q.
- Não mencionar, em nenhum arquivo, instituição de ensino, curso, matrícula ou situação acadêmica
  do autor. O projeto é apresentado como projeto pessoal de portfólio.
- Não inserir imagens, logotipos ou quadrinhos protegidos por direitos autorais no repositório.