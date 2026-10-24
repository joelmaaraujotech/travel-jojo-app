# Travel JOJO

Aplicativo estático em português para uma viagem de duas pessoas ao Marrocos e ao Egito. Publicado na Vercel a partir da branch main. Não requer build nem dependências.

## Uso

- Hoje: hospedagem atual, próximo destino e até três planos diários.
- Roteiro: paradas com datas, hospedagens, endereços, reserva e deslocamento; confirmação local por pessoa.
- Dinheiro: despesas individuais e compartilhadas; saldo por moeda, orçamento e câmbio informado manualmente.
- Frases: Darija e árabe egípcio em texto; voz apenas quando uma voz árabe estiver disponível no dispositivo.
- Mais: checklist persistente, verificação offline, backup JSON com confirmação antes de substituir e contatos de assistência.

Dados armazenados em localStorage (jojo_trip_v3). Registros legados de jojo_route são importados na primeira abertura. Não há sincronização remota nem cofre criptografado. Exportar backups regularmente. Os arquivos exportados incluem notas e contatos em texto simples; compartilhar apenas com a outra pessoa da viagem.

O service worker salva o app, ícones e frases. Após abrir com internet e preparar offline, o app pode ser reaberto sem rede. Mapas externos e vozes do sistema não têm garantia offline. O cache de interface pode ser removido pelo navegador; verificar antes de sair.

## Desenvolvimento

Servir a pasta por HTTP localhost (por exemplo, python -m http.server 8081). Produção requer HTTPS para o service worker. Após alterar arquivos do app, incrementar CACHE em sw.js para renovar o pacote de interface.

## Validação desta versão

Sintaxe JavaScript verificada. Testes de navegador com viewport móvel cobriram criação e recuperação de roteiro, divisão de gastos, confirmação das duas pessoas, preparação offline, recarga sem rede, criação de plano offline e busca de frases. Validação em aparelhos Android e iOS físicos ainda pendente.

## Idiomas

Interface em português brasileiro e holandês. Seletor PT-BR / NL no cabeçalho, preferência por aparelho em jojo_language, independente do backup da viagem. Datas e valores seguem o idioma escolhido. O dicionário está em i18n.js, incluído no pacote offline. Valores de formulários e enums persistidos permanecem estáveis; nomes e conteúdo inserido pelo usuário não são traduzidos.

## Visual para celular

Layout único limitado a 480 px também no computador. Fundos em #FFF5DF, amostrado do fundo do ícone original. Open Sans 400/600/700 incluída localmente em fonts/ e no cache offline; licença em fonts/OFL.txt. Verificados todos os caminhos nos dois idiomas em 320, 390, 430 e 1280 px, sem rolagem horizontal, além de carregamento da fonte sem internet.

## Aparência e ações

Botão flutuante de 56 px abre painel com Padrão, Escuro, Sol e Seguir o sistema. Preferência local jojo_appearance, independente dos dados da viagem e disponível offline. theme.js aplica o tema antes da folha de estilos. Tema do sistema acompanha mudanças de prefers-color-scheme; escolha explícita tem prioridade.

Cores semânticas centralizadas em style.css: ações principais preenchidas, secundárias com bordas, exclusão em vermelho, pendências com rótulo e âmbar, seleção com destaque e confirmação. Campos usam foco visível e erros associados por aria-describedby. Tema Sol usa fundo branco, texto preto, bordas fortes e áreas de toque de pelo menos 48 px para botões. FAB acima da navegação, com espaço adicional no fim do conteúdo.

Validação: três temas nas cinco telas, PT/NL, persistência offline, alternância pelo sistema, erro de datas e correção. Contraste de texto padrão e escuro acima de 4.5:1 nas combinações principais; contorno dos campos padrão 3.67:1 e texto preto/branco no tema Sol 21:1. Leitura sob sol real em aparelho físico ainda precisa ser validada.
