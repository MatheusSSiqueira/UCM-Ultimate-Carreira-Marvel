# Roteiro manual de verificação do frontend

1. Abra a aplicação no navegador e confirme que a página e a prévia dos perfis carregam sem erros no console.
2. Preencha os campos de especialidade, desafio e meta com textos válidos e marque a autorização.
3. Envie o formulário usando a API real; confirme que o resultado aparece, o foco vai para o título do herói, o selo informa a origem da análise e é possível enviar uma nova consulta.
4. Simule uma resposta HTTP 422 com erros `detail` do FastAPI para campos diferentes; confirme as mensagens em português, o destaque dos campos e o vínculo com a mensagem de erro.
5. Simule uma resposta HTTP 429; confirme a orientação para aguardar e tente novamente depois.
6. Desmarque a autorização ou deixe um campo curto; confirme a validação acessível no navegador e que a consulta não é enviada.
7. Desconecte a rede durante uma consulta e, separadamente, simule uma resposta HTML 502; confirme que cada falha apresenta uma mensagem amigável e permite nova tentativa.
8. Ative o Modo Leitura, recarregue a página na mesma sessão e confirme que a preferência permanece; verifique também a navegação e o envio somente pelo teclado.
9. Emule um dispositivo móvel ou abra a página em uma tela estreita; confirme que o formulário, as mensagens e o resultado continuam legíveis e utilizáveis.
10. Use a função de impressão do navegador e confirme que o conteúdo principal permanece legível na visualização de impressão.
