# UCM - Ultimate Carreira Marvel

Aplicação web que relaciona o perfil profissional informado por você a um arquétipo de herói da Marvel e apresenta sugestões para sua carreira. O projeto usa Python 3.12, FastAPI e, quando configurado, Google Gemini. A interface é estática, sem frameworks e sem CDN de scripts.

## Funcionalidades

- Formulário de perfil profissional com validação no navegador e na API.
- Análise por IA com Google Gemini ou análise por regras quando a chave não está configurada ou o serviço não pode ser usado.
- Recomendações estruturadas: compatibilidade, análise do perfil, orientação de carreira e próximo passo.
- Indicação da origem da análise no resultado.
- Interface responsiva, modo de leitura e ilustrações originais em SVG e CSS.
- Limite de consultas em memória para reduzir solicitações excessivas.

## Como executar localmente

Requer Python 3.12. Na raiz do projeto, crie e ative um ambiente virtual e instale as dependências:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

Crie o arquivo local de configuração a partir do exemplo:

```bash
cp .env.example .env
```

Edite `.env` se quiser configurar uma chave do Google Gemini. Sem uma chave válida, a aplicação usa o modo de análise por regras. Inicie o servidor:

```bash
uvicorn app.main:app --reload
```

A aplicação fica disponível em `http://127.0.0.1:8000`. A documentação interativa da API fica em `http://127.0.0.1:8000/api/docs`; a verificação de saúde está em `/api/v1/health`.

## Variáveis de ambiente

| Variável | Finalidade | Valor padrão |
| --- | --- | --- |
| `GEMINI_API_KEY` | Chave para solicitar análises ao Google Gemini. Deixe vazia para usar o modo por regras. | Vazia no arquivo de exemplo |
| `RATE_LIMIT_WINDOW_SECONDS` | Duração da janela do limite de consultas, em segundos. | `60` |
| `MAX_REQUESTS_PER_WINDOW` | Número máximo de consultas por IP durante a janela. | `10` |
| `PORT` | Porta usada pelo comando de inicialização do contêiner. | `8000` |

## Testes e verificações

Com as dependências de desenvolvimento instaladas, execute:

```bash
ruff check app tests && pytest -q
```

O roteiro de verificação manual da interface está em [`tests/frontend_smoke.md`](tests/frontend_smoke.md). A integração contínua também executa verificações de qualidade e testes.

## Estrutura de diretórios

```text
.
├── .devcontainer/
│   └── devcontainer.json
├── .github/
│   ├── copilot-instructions.md
│   ├── pull_request_template.md
│   └── workflows/ci.yml
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   └── static/
│       ├── app.js
│       ├── index.html
│       ├── styles.css
│       └── img/
│           ├── heroes/          # Emblemas originais em SVG
│           └── hq/LEIAME.md     # Orientações para imagens opcionais
├── tests/
│   ├── __init__.py
│   ├── frontend_smoke.md
│   └── test_main.py
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── Dockerfile
├── LICENSE
├── pyproject.toml
├── README.md
├── requirements-dev.txt
├── requirements.txt
└── SECURITY.md
```

## Limitações conhecidas

- O limite de consultas é mantido em memória no processo. Ele é reiniciado quando o servidor reinicia e não é compartilhado entre várias instâncias.
- Sem uma chave Gemini válida, ou quando uma solicitação ao serviço falha, a aplicação usa regras locais para gerar o resultado.
- As fontes da interface são carregadas pelo Google Fonts e podem não estar disponíveis sem conexão externa; fontes de contingência são usadas nesse caso.
- O projeto não inclui imagens de quadrinhos ou logotipos protegidos. Consulte [`app/static/img/hq/LEIAME.md`](app/static/img/hq/LEIAME.md) antes de adicionar imagens aos painéis.

## Segurança e privacidade

O projeto é **projetado com princípios de privacidade (LGPD): sem persistência própria; os dados enviados ao Google Gemini seguem a política do provedor**. A aplicação não mantém banco de dados ou histórico e não registra o conteúdo digitado nos próprios logs.

A API valida os campos e seus limites de tamanho; a entrada tem caracteres de controle removidos e espaços normalizados. A interface insere o conteúdo recebido como texto, sem interpretar dados externos como HTML. A política CSP permite scripts apenas da própria aplicação (`script-src 'self'`) e não permite scripts inline. O limite de consultas em memória é uma medida básica de controle, não um serviço de proteção distribuído.

## Licença

O código é distribuído sob a licença MIT. Este é um projeto independente, sem vínculo com a Marvel ou a Disney. Os nomes de personagens e as marcas pertencem aos seus respectivos titulares. O uso é demonstrativo e não comercial.

## Autor

Matheus de Souza Siqueira — projeto pessoal de portfólio.

- [Portfólio](https://matheusssiqueira.github.io/portfolio)
- [Repositório](https://github.com/MatheusSSiqueira/UCM-Ultimate-Carreira-Marvel)

## Roadmap

- Substituir o limite de consultas em memória por uma solução compartilhada entre instâncias.
- Criar testes automatizados para os fluxos e a validação do formulário no navegador.
- Ampliar a verificação de acessibilidade por teclado e leitores de tela.
- Documentar configurações de implantação e gestão de segredos por ambiente.
- Melhorar o tratamento de indisponibilidade do Gemini sem registrar dados enviados.
