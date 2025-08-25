# Requirements Document

## Introduction

O sistema de pedidos de selas Tomahawk é uma aplicação web que permite aos clientes configurar e personalizar selas de barril através de um formulário interativo. O sistema coleta informações do cliente, especificações da sela, opções de design e customização, e gera um PDF com o pedido completo incluindo cálculo de preços.

## Requirements

### Requirement 1

**User Story:** Como um cliente, eu quero preencher minhas informações pessoais, para que meu pedido seja processado corretamente

#### Acceptance Criteria

1. WHEN o cliente acessa o formulário THEN o sistema SHALL exibir campos obrigatórios para nome, telefone, email e endereço de entrega
2. WHEN o cliente não preenche um campo obrigatório THEN o sistema SHALL exibir uma mensagem de erro e impedir o envio
3. WHEN o cliente preenche todos os campos obrigatórios THEN o sistema SHALL permitir prosseguir para as próximas seções

### Requirement 2

**User Story:** Como um cliente, eu quero configurar as especificações básicas da sela, para que ela atenda às minhas necessidades específicas

#### Acceptance Criteria

1. WHEN o cliente seleciona o tamanho do assento THEN o sistema SHALL oferecer opções de 12" a 16" em incrementos de 0.5"
2. WHEN o cliente escolhe o tipo de árvore THEN o sistema SHALL exibir opções visuais (SAFE, BEAR, PERFORMANCE, CLASSIC) com imagens
3. WHEN o cliente seleciona "other" para tamanho do gullet THEN o sistema SHALL exibir um campo de texto para especificar o tamanho customizado
4. WHEN o cliente escolhe o tipo de construção da sela THEN o sistema SHALL oferecer opções (Full Leather, Hybrid, Full Neoprene) com imagens

### Requirement 3

**User Story:** Como um cliente, eu quero personalizar o design e aparência da sela, para que ela reflita minhas preferências estéticas

#### Acceptance Criteria

1. WHEN o cliente seleciona "Hybrid" como tipo de construção THEN o sistema SHALL exibir opções de estilo específicas para híbrido
2. WHEN o cliente escolhe estilo de saia THEN o sistema SHALL oferecer opções visuais (Square, 45°, Square Round, Rounded, Relief)
3. WHEN o cliente seleciona estilo de cantle THEN o sistema SHALL exibir opções (Cheyenne Roll, Pencil Roll, Silver Laced)
4. WHEN o cliente escolhe estilo de fender THEN o sistema SHALL oferecer opções (45°, Square, Round)
5. WHEN o cliente seleciona "Hard" como estilo de assento THEN o sistema SHALL desabilitar as opções de cores do assento

### Requirement 4

**User Story:** Como um cliente, eu quero configurar opções de tooling e padrões, para que a sela tenha o acabamento desejado

#### Acceptance Criteria

1. WHEN o cliente seleciona cobertura de tooling THEN o sistema SHALL exibir opções de padrões disponíveis
2. WHEN o cliente escolhe "plain" para tooling THEN o sistema SHALL ocultar as opções de partes tooled
3. WHEN o cliente seleciona padrões florais ou geométricos THEN o sistema SHALL permitir escolher entre múltiplas opções visuais
4. WHEN o cliente escolhe cores de couro THEN o sistema SHALL oferecer opções para roughout e smooth leather

### Requirement 5

**User Story:** Como um cliente, eu quero configurar o forro e rigging da sela, para que ela tenha a funcionalidade adequada

#### Acceptance Criteria

1. WHEN o cliente seleciona tipo de forro THEN o sistema SHALL oferecer opções (Suede, Fleece)
2. WHEN o cliente escolhe "Full Leather" como construção THEN o sistema SHALL habilitar apenas riggings compatíveis com couro
3. WHEN o cliente escolhe "Full Neoprene" como construção THEN o sistema SHALL habilitar apenas riggings compatíveis com neoprene
4. WHEN o cliente seleciona estilo híbrido específico THEN o sistema SHALL ajustar as opções de rigging disponíveis

### Requirement 6

**User Story:** Como um cliente, eu quero adicionar acessórios e opções extras, para que a sela tenha todas as funcionalidades que preciso

#### Acceptance Criteria

1. WHEN o cliente seleciona acessórios THEN o sistema SHALL permitir múltiplas seleções (cordas da sela, protetor de rigging, etc.)
2. WHEN o cliente escolhe estilo de buck stitching THEN o sistema SHALL oferecer opções visuais
3. WHEN o cliente seleciona opções de back cinch THEN o sistema SHALL exibir escolhas (None, Hole Only, Full)
4. WHEN o cliente escolhe estribos THEN o sistema SHALL oferecer opções de material e cor

### Requirement 7

**User Story:** Como um cliente, eu quero ver o preço calculado automaticamente, para que eu saiba o custo total do meu pedido

#### Acceptance Criteria

1. WHEN o cliente seleciona qualquer opção que afeta o preço THEN o sistema SHALL recalcular automaticamente o valor total
2. WHEN o cliente escolhe "Full Leather" THEN o sistema SHALL aplicar o preço base de $2399
3. WHEN o cliente escolhe "Hybrid" THEN o sistema SHALL aplicar o preço base de $1799
4. WHEN o cliente escolhe "Full Neoprene" THEN o sistema SHALL aplicar o preço base de $1500
5. WHEN o cliente adiciona acessórios THEN o sistema SHALL somar os valores extras correspondentes

### Requirement 8

**User Story:** Como um cliente, eu quero gerar um PDF com meu pedido, para que eu tenha um documento oficial da minha encomenda

#### Acceptance Criteria

1. WHEN o cliente completa o formulário e clica em enviar THEN o sistema SHALL validar todos os campos obrigatórios
2. WHEN todos os campos estão preenchidos corretamente THEN o sistema SHALL gerar um PDF formatado com todas as informações
3. WHEN o PDF é gerado THEN o sistema SHALL incluir informações do cliente, especificações da sela, design, preços e data/hora
4. WHEN o PDF é criado THEN o sistema SHALL abrir o documento em uma nova aba e iniciar o download automaticamente

### Requirement 9

**User Story:** Como um cliente, eu quero que meu progresso seja salvo automaticamente, para que eu não perca informações se sair da página

#### Acceptance Criteria

1. WHEN o cliente preenche qualquer campo THEN o sistema SHALL salvar automaticamente os dados no localStorage a cada 30 segundos
2. WHEN o cliente retorna à página THEN o sistema SHALL restaurar automaticamente os dados salvos
3. WHEN o cliente completa e envia o pedido THEN o sistema SHALL limpar os dados salvos do localStorage
4. WHEN dados são salvos THEN o sistema SHALL exibir uma notificação de confirmação

### Requirement 10

**User Story:** Como um cliente, eu quero ver meu progresso no preenchimento do formulário, para que eu saiba quanto falta para completar

#### Acceptance Criteria

1. WHEN o cliente preenche campos obrigatórios THEN o sistema SHALL atualizar uma barra de progresso visual
2. WHEN todos os campos obrigatórios estão preenchidos THEN o sistema SHALL mostrar 100% de progresso
3. WHEN o cliente deixa um campo obrigatório vazio THEN o sistema SHALL reduzir o percentual de progresso correspondente
4. WHEN o progresso muda THEN o sistema SHALL animar a transição da barra de progresso

### Requirement 11

**User Story:** Como um cliente, eu quero gerar PDFs do meu pedido em inglês e português, para que eu possa ter documentos nos dois idiomas

#### Acceptance Criteria

1. WHEN o cliente completa o formulário e clica em enviar THEN o sistema SHALL gerar automaticamente dois PDFs: um em inglês e outro em português
2. WHEN os PDFs são gerados THEN o sistema SHALL criar nomes de arquivo distintos indicando o idioma (ex: "Tomahawk_Saddle_Order_João_2025-08-25_EN.pdf" e "Tomahawk_Saddle_Order_João_2025-08-25_PT.pdf")
3. WHEN os PDFs são criados THEN o sistema SHALL abrir ambos os documentos em novas abas separadas
4. WHEN os PDFs são gerados THEN o sistema SHALL iniciar o download automático de ambos os arquivos
5. WHEN o PDF em português é gerado THEN o sistema SHALL traduzir todos os rótulos, títulos de seções e textos fixos para português
6. WHEN o PDF em inglês é gerado THEN o sistema SHALL manter todos os rótulos, títulos de seções e textos fixos em inglês
7. WHEN qualquer PDF é gerado THEN o sistema SHALL manter os dados do cliente e especificações da sela no idioma original inserido pelo usuário