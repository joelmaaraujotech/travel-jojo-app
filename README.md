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
