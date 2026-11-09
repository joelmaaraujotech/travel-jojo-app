# Ativar a viagem compartilhada — Travel JOJO

A versão distribuída permanece **desativada** em `cloud-config.js`. Nenhum dado sai do aparelho enquanto `enabled` for `false`. A autenticação não substitui o backup manual. O projeto Supabase ainda precisa ser criado pelo proprietário.

## 1. Preparar o projeto

1. Crie um projeto na sua conta em https://supabase.com/dashboard. Escolha uma região próxima dos usuários. Guarde a senha do banco no seu gerenciador de senhas, nunca no chat, código ou repositório.
2. No SQL Editor, execute `cloud/schema.sql` uma vez. Em projeto existente, revise os nomes antes de executar; a migração não deve substituir outras tabelas.
3. Em Authentication, habilite entrada por e-mail e confirmação do endereço. Configure o template para mostrar `{{ .Token }}` (código OTP), pois o app recebe um código digitado, não um link.
4. Para e-mails de ambos os viajantes, configure um provedor SMTP próprio. O serviço de e-mail de desenvolvimento do Supabase tem restrições de destinatários e não é apropriado para esse uso em produção. Insira os segredos apenas no painel do Supabase.
5. Confira as URLs de produção em Authentication: `https://travel-jojo-app.vercel.app`. Ajuste limites de envio e CAPTCHA se necessário; não desative confirmação de e-mail.
6. Em Project Settings/API, obtenha a URL pública e a **publishable key** (ou chave legada `anon`). Nunca use `service_role`, chave `sb_secret_`, senha do banco ou token administrativo no app.

## 2. Configurar e validar antes de ativar

Preencha `cloud-config.js` com a URL e chave **públicas**, inicialmente em uma prévia. Ative `enabled:true` somente após instalar o esquema. Atualize o cache em `sw.js` na publicação. A chave pública identifica o projeto; RLS e sessões autenticadas controlam acesso.

Em Mais, aparecerá **Viagem compartilhada**. Cada pessoa entra com seu próprio e-mail/código. Nenhuma mensagem é enviada automaticamente por este assistente: os códigos são solicitados pelo usuário no app.

## 3. Migrar as duas cópias sem perda

1. Nos dois celulares, exporte um backup JSON e guarde fora do navegador.
2. Revise as diferenças. Escolha qual cópia será a base, incorporando manualmente informações exclusivas da outra. A primeira migração não faz mescla automática.
3. No celular-base: entre, escolha **Compartilhar esta viagem** e confirme. Uma cópia anterior à nuvem também será exportada.
4. Convide o e-mail exato da outra pessoa. O código expira em sete dias e aceita um único uso; gerar outro revoga o anterior. O limite é de dois membros.
5. No segundo celular: entre com o e-mail convidado, use o código e escolha **Abrir viagem compartilhada**. Leia a confirmação de substituição e guarde o backup anterior.
6. Teste nos dois aparelhos: destino, atividade, gasto, exclusão e lixeira, modo avião, retorno da rede e edição simultânea do mesmo item. Conflitos exigem escolha explícita entre a versão local e a da nuvem.

## Como funciona

- Dados de trabalho continuam em `jojo_trip_v3`; as mudanças pendentes são reconstruídas pela diferença contra a última versão sincronizada, guardada por usuário/viagem. Fechar o app não perde a fila persistida.
- Atualização por registro, com revisão atômica no servidor. Campos de configurações e cotações são independentes. Alterações diferentes podem se combinar; alterações concorrentes do mesmo item não são sobrescritas silenciosamente.
- Consulta a cada 15 segundos com a tela aberta, após salvar e ao recuperar conexão. Não é sincronização com o app fechado. O sistema pode suspender o navegador em segundo plano.
- Formulários abertos não são substituídos por uma atualização remota. Ao fechar, o próximo ciclo tenta novamente.
- Exclusões são tombstones: a lixeira retém o conteúdo para restaurar. Cada gravação gera uma versão em `jojo_history`.
- `jojo_backup` cria uma cópia completa na primeira sincronização de cada dia UTC. Se ninguém usar/sincronizar naquele dia, não há cópia diária nova. O histórico registra as demais alterações do dia. Backups podem ser baixados em Mais e recuperados pelo fluxo de importação com confirmação.
- Importar backup conectado também cria mudanças a sincronizar: revisar antes de confirmar. A importação não é uma mescla.
- Backups e histórico ficam no mesmo projeto; não protegem contra exclusão do projeto/conta. Guarde exportações em outro local. Backups gerenciados/PITR do fornecedor dependem do plano contratado e não foram ativados automaticamente.
- Não há cobrança/provisionamento automático, agendamento externo ou envio de segredos. Monitorar cotas e custos de banco, Auth e e-mail na conta do proprietário.

## Validação

`node tests/sync-core.test.cjs` testa o motor com dois clientes e rede simulada.
`tests/cloud-schema.test.cjs` usa PGlite para isolamento SQL. Instale `@electric-sql/pglite@0.3.14` em uma pasta de testes e indique `PGLITE_PATH`.

Os testes locais não substituem a validação com Supabase Auth, RLS e e-mail reais nos dois celulares. A versão desativada pode ser publicada sem migrar os dados existentes.

## Referências oficiais

- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
