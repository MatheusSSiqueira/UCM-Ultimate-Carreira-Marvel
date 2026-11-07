# UCM Ultimate Carreira Marvel — Mentoria Profissional com IA

Aplicação Web Full-Stack desenvolvida em **Python (FastAPI)** integrada à **API Google Gemini (`gemini-2.5-flash`)** que identifica qual personagem do Universo Cinematográfico Marvel (UCM) melhor representa o perfil profissional do usuário e fornece um plano de carreira personalizado.

---

## Arquitetura e Engenharia de Software

O projeto adota uma arquitetura **Monolítica Modular Stateless**, projetada para oferecer custo zero de infraestrutura, alta segurança e conformidade nativa com a **LGPD**:

### 1. Frontend Desacoplado (Single Responsibility Principle)
Localizado em `app/static/`, o cliente web foi dividido em três camadas independentes sem dependência de CDNs externos:
- **`index.html` (Camada de Estrutura Semântica):** Marcação HTML5 limpa com atributos de acessibilidade (`aria-live`, `role="alert"`) seguindo diretrizes WCAG 2.1.
- **`styles.css` (Camada de Apresentação & Design System):** Estilização responsiva *Mobile-First* em Dark Mode utilizando *CSS Custom Properties* (variáveis nativas) e *CSS Grid*.
- **`app.js` (Camada de Comportamento & Estado):** Consumo assíncrono da API (`Fetch API`), validação de formulário no cliente e prevenção contra **DOM-based XSS** através do uso estrito de `textContent`.

### 2. Backend & Segurança (OWASP & LGPD)
- **Privacy by Design (Zero-Persistence):** Nenhum dado pessoal inserido pelo usuário é gravado em banco de dados ou arquivos de log. O processamento ocorre exclusivamente em memória volátil (`RAM`) durante a requisição.
- **Content Security Policy (CSP):** Como o HTML, CSS e JS estão devidamente separados em arquivos próprios (`'self'`), o servidor bloqueia a execução de scripts inline ou de origens desconhecidas.
- **Structured Outputs (Pydantic + Gemini 2.5 Flash):** A resposta da IA obedece estritamente ao contrato JSON definido em `AIHeroDecision`, eliminando alucinações de formato e mitigando *Prompt Injection*.
- **Rate Limiting In-Memory:** Controle de janela deslizante $O(1)$ por IP para proteger a cota gratuita da API.
- **Licenciamento de Mídia:** Todas as fotografias exibidas pertencem ao acervo do *Wikimedia Commons* sob licença **Creative Commons (CC BY-SA 3.0 / 4.0)**, com atribuição explícita renderizada na interface.

---

## Estrutura de Diretórios

```text
mcu-career-matcher/
├── .devcontainer/
│   └── devcontainer.json       # Configuração automática do GitHub Codespaces
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD (Validação HTML/CSS/JS + Ruff + Pytest)
├── app/
│   ├── __init__.py
│   ├── main.py                 # Servidor FastAPI, rotas, CSP e integração Gemini
│   ├── schemas.py              # Contratos de validação Pydantic
│   └── static/
│       ├── index.html          # Estrutura semântica da página
│       ├── styles.css          # Folha de estilos e Design Tokens
│       └── app.js              # Lógica assíncrona do cliente
├── tests/
│   └── test_main.py            # Testes automatizados de rotas, segurança e estáticos
├── .env.example                # Modelo de variáveis de ambiente
├── Dockerfile                  # Imagem Docker otimizada com usuário non-root
├── LICENSE                     # Licença MIT Acadêmica / Estudante
├── README.md                   # Documentação técnica do projeto
└── requirements.txt            # Dependências Python fixadas