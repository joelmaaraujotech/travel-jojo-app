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

Tema claro/escuro segue automaticamente o sistema do celular. Botão flutuante Modo Sol / Zonmodus alterna apenas o alto contraste, com aria-pressed e estado visível. Desativar retorna ao tema atual do sistema. Preferência local jojo_appearance mantém apenas sun ou system; antigas escolhas manuais standard/dark passam a seguir o sistema. Escolha Sol anterior é preservada. Disponível offline e aplicado antes da folha de estilos.

Todos os botões, seletores de idioma, abas de navegação e campos usam raio constante de 10 px. Ações principais preenchidas e secundárias com contorno; exclusão em vermelho. Tema escuro conserva paleta clara nos botões para contraste. FAB acima da navegação, com espaço no fim do conteúdo.

Cores semânticas em style.css; foco visível e erros associados por aria-describedby. Contraste das combinações principais de texto acima de 4.5:1, contorno dos campos padrão 3.67:1 e preto/branco no modo Sol 21:1. Leitura sob sol real precisa de validação em aparelho físico.

## Contornos de referência

Cartões, destaque inicial, diálogos, avisos e seletor de idiomas compartilham moldura fina com raio de 24 px. Botões internos mantêm raio de 10 px e destaque de ação. Navegação recebe o mesmo contorno arredondado no topo. Modo Sol preserva bordas de 2 px.

## Formulários móveis

Editor em janela com título e ações fixos e um único contêiner interno rolável. Fundo bloqueado enquanto aberto, restaurando a posição no fechamento. Altura e posição acompanham VisualViewport, inclusive em redimensionamento pelo teclado. Testar teclado e barras do navegador em iOS/Android físicos continua recomendado. Idioma ativo usa as cores semânticas verdes; botão Sol circular de 56 px, apenas ícone visual, com nome acessível preservado.

## Design system atual

A referência mais recente substitui a antiga identidade creme/verde: Laranja Aventura #FF6B1A, Preto Sofisticação #1D1D1D e Off White #FFFEF9. Monograma TJ vetorial em logo.svg; ícones de instalação gerados a partir dele. Open Sans mantida, ícones de navegação com traço fino, ações em laranja com texto preto, cartões neutros e destaque inicial preto. Tema automático permanece; Sol mantém preto/branco. Dados e estrutura funcional preservados. O texto pequeno em laranja usa tom mais escuro no tema claro para legibilidade.

## Revisão UX e conteúdo

Hoje destaca o destino atual ou o próximo destino futuro. Cadastro inicial limitado a cidade, país e datas; hospedagem, transporte, reservas e notas têm fluxos separados. Confirmação dos viajantes independente de reservas da hospedagem/transporte; dados legados de status Reservado aparecem como hospedagem reservada. Nenhum dado existente é apagado; continua o esquema version 3.

Exclusões de destino, gasto e plano oferecem desfazer por 12 segundos. Formulários alterados pedem confirmação antes de fechar (inclusive Escape), e a página solicita aviso nativo ao sair. Salvamento sem sucesso mantém o formulário e permite nova tentativa sem registros duplicados. Datas invertidas geram erro junto ao campo; destinos sobrepostos pedem confirmação.

Navegação com ícones e rótulos curtos, conversão separada do cadastro de cotação, mensagens contextuais após salvar, revisão de datas no backup antes da substituição, e limites explícitos do offline e da ausência de sincronização remota. PT-BR/NL mantidos em todos os novos fluxos.

Validação em Chromium móvel: destino futuro no Hoje, formulário mínimo, correção de data, hospedagem/reserva, proteção de alterações, confirmações, gasto/exclusão/desfazer, cotação e conversão, metadados do backup, reload offline, holandês e larguras 320/390/430. Também simulado erro de armazenamento com repetição de salvamento e conflito de datas com aceitar/cancelar. Testes físicos de teclado/sol continuam pendentes.

## Correção de campos no iOS

Controles date/datetime-local/time recebem min-inline-size:0, largura limitada ao contêiner e appearance:none, neutralizando o dimensionamento intrínseco do Safari. Inputs e selects de uma linha usam 48 px; textarea mantém área maior. Contêiner de rolagem preservado, com min-width:0 e overflow horizontal bloqueado. Verificados no Chromium largura/altura dos campos, preenchimento de datas, registro de gasto e rolagem em viewport reduzido, PT/NL em 320/393/430 px. Safari/iPhone físico não disponível para validação nesta sessão.

## Atividades e programação do dia

A coleção plans agora representa atividades completas, mantendo os registros legados (text/date/done) sem perda ou mudança do esquema de backup version 3. activities.js contém cadastro, agenda e detalhes. Campos: nome e data obrigatórios, tipo, destino opcional, início/término opcionais, local, endereço, reserva e observações. Sem limite de três itens; não registra despesas automaticamente.

Home inclui programação por data, filtro de destino, horários ordenados e grupo sem horário. Roteiro abre as atividades vinculadas e oferece seletor de datas com atividades. Destino é sugerido pela data ao cadastrar e pode ser alterado. Atividade fora do período do destino pede confirmação; fim antes do início gera erro; sobreposição de horários pede confirmação. Cada atividade permite ver, editar, concluir/reabrir e excluir com Desfazer. Salvar atividade/Cancelar permanecem só texto. Horários lado a lado, empilhados em larguras até 360px. CSS existente de contenção dos campos Safari preservado.

Testes de navegador: preservação de plano legado, inferência de destino, datas/horários, conflito aceitar/cancelar, cinco atividades na mesma data, reserva/detalhes, concluir, excluir/desfazer, acesso por destino/datas, holandês, reload offline e ausência de overflow em 320/390/430px. Teste em iPhone físico continua pendente.

## Home como agenda exclusiva da viagem

Home reúne Dia / Viagem sem atalhos internos para dinheiro ou frases. Viagem reutiliza a gestão de destinos, hospedagens e transporte; antigo #roteiro redireciona para Home em Viagem. Navegação inferior conserva o estilo e passa a quatro acessos: Hoje, Gastos, Frases e Mais. Não há segunda tela duplicada de roteiro.

Dia: destino e período, consulta de data com anterior/próximo e volta para hoje, programação cronológica de atividades e deslocamentos cadastrados. Antes da primeira data, abre no primeiro destino com indicação Planejamento. Deslocamentos usam somente departure informado (sem estimativas). Itens sem horário ficam separados; concluídos recolhidos. Cartão de atividade abre detalhes; única ação rápida é Concluir. Editar, reabrir e excluir estão nos detalhes. Paleta, tipografia, molduras, seletor de idioma e modo Sol preservados.

Testes: primeiro destino e data futura, Home sem atalhos cruzados, Dia/Viagem, atividade/detalhes/edição/concluir/reabrir, deslocamento ordenado, navegação de datas, holandês, compatibilidade #roteiro, reabertura offline e larguras 320/390/430 px. Dados existentes preservados.

## Cinco semanas e consulta unificada por país

Card inicial preto usa Cinco semanas / Vijf weken e Adicionar atividade do dia; card Vamos montar sua viagem continua com Adicionar destino. Cabeçalho atualizado para 5 semanas nos dois idiomas.

Atividades têm país obrigatório independente de destino opcional, permitindo planejar antes de cadastrar cidades. Data sugere um destino compatível com o país; formulário restringe vínculos a cidades do mesmo país. Alterar país atualiza as opções sem perder outros campos. Botão Salvar no roteiro permanece só texto.

Agenda oferece país, uma data/todas as datas e destino. Ao selecionar país, abre todas as datas agrupadas; escolher uma data combina os filtros. Mostra destinos do país e deslocamentos cadastrados na mesma consulta. País deriva do destino vinculado ou do campo da atividade; planos legados podem usar o país único das estadias daquela data, sem adivinhar em casos ambíguos. Vínculo posterior não duplica registros.

Testado: cinco semanas, retirada da ação duplicada no card, atividade sem destino, vínculo posterior, países isolados, agrupamento por data, país+data, holandês, reload offline e larguras de celular 320/390/430px.
