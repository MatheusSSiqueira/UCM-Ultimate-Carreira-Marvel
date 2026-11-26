# UCM - Ultimate Carreira Marvel

Aplicação Web Full-Stack desenvolvida em **Python (FastAPI)** integrada à **API Google Gemini** que identifica qual personagem do Universo Cinematográfico Marvel (UCM) melhor representa o perfil profissional do usuário e fornece um plano de carreira personalizado.

---

## Arquitetura e Engenharia de Software

O projeto adota uma arquitetura **Monolítica Modular Stateless**, projetada para oferecer custo zero de infraestrutura, alta segurança e conformidade nativa com a **LGPD**:

### 1. Frontend Desacoplado (Single Responsibility Principle)
Localizado em `app/static/`, o cliente web foi dividido em três camadas independentes, sem dependências de CDNs de scripts:
- **`index.html` (Camada de Estrutura Semântica):** Marcação HTML5 limpa com atributos de acessibilidade (`aria-live`, `role="alert"`) seguindo diretrizes WCAG 2.1.
- **`styles.css` (Camada de Apresentação & Design System):** Estilização responsiva *Mobile-First* em preto e branco, com folhas de conteúdo opacas, utilizando *CSS Custom Properties* (variáveis nativas) e *CSS Grid*.
- **`app.js` (Camada de Comportamento & Estado):** Consumo assíncrono da API (`Fetch API`), mosaico de quadrinhos com ilustrações CSS de fallback, validação de formulário no cliente e prevenção contra **DOM-based XSS** através do uso estrito de `textContent`.

As fontes Bangers, Chakra Petch e Inter são carregadas pelo Google Fonts e estão licenciadas sob a SIL Open Font License. Isso requer conexão externa para obter as fontes; sem ela, a interface usa fontes locais de contingência.

### 2. Backend & Segurança (OWASP & LGPD)
- **Privacy by Design (Zero-Persistence própria):** Nenhum dado pessoal inserido pelo usuário é gravado em banco de dados ou arquivos de log próprios. As respostas são processadas de forma transitória e enviadas à API Google Gemini exclusivamente para gerar a recomendação; o tratamento do provedor deve ser consultado em sua política de privacidade.
- **Content Security Policy (CSP):** Como o HTML, CSS e JS estão devidamente separados em arquivos próprios (`'self'`), o servidor bloqueia scripts inline e estilos inline. A política permite Google Fonts para as folhas de estilo e arquivos das fontes.
- **Structured Outputs (Pydantic + Gemini 2.5 Flash):** A resposta da IA obedece estritamente ao contrato JSON definido em `AIHeroDecision`, eliminando alucinações de formato e mitigando *Prompt Injection*.
- **Rate Limiting In-Memory:** Controle de janela deslizante por IP, com limite de clientes rastreados para evitar crescimento ilimitado da memória. Em múltiplas réplicas, usar um store compartilhado.
- **Licenciamento de Mídia:** Os emblemas dos perfis são desenhos SVG originais e genéricos. Imagens opcionais dos painéis devem ser arte própria, licenciada para esse uso ou de domínio público; consulte [`app/static/img/hq/LEIAME.md`](app/static/img/hq/LEIAME.md). Não inclua quadrinhos, logotipos ou outras imagens protegidas por direitos autorais sem autorização.

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
│       ├── app.js              # Lógica assíncrona do cliente
│       └── img/
│           ├── heroes/         # Emblemas SVG originais dos perfis
│           └── hq/LEIAME.md    # Regras para imagens opcionais dos painéis
├── tests/
│   └── test_main.py            # Testes automatizados de rotas, segurança e estáticos
├── .env.example                # Modelo de variáveis de ambiente
├── Dockerfile                  # Imagem Docker otimizada com usuário non-root
├── LICENSE                     # Licença MIT
├── README.md                   # Documentação técnica do projeto
├── requirements.txt            # Dependências de produção fixadas
└── requirements-dev.txt        # Dependências de desenvolvimento e testes