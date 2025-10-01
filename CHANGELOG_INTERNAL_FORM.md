# Changelog - Formulário de Pedidos Internos

## Alterações Realizadas

### ✅ Seções Removidas
1. **Informações do Cliente** - Removida completamente
   - Nome do cliente
   - Telefone
   - Email
   - Endereço de entrega

2. **Pagamento e Cobrança** - Removida completamente
   - Preço calculado
   - Depósito
   - Saldo devedor
   - Método de pagamento (PayPal, Venmo, etc.)
   - Método de envio

### ✅ Scripts Removidos
- `saddlePriceCalculator.js` - Não é mais necessário para pedidos internos
- `jquery.inputmask.min.js` - Não é mais necessário sem campos de telefone

### ✅ Atualizações de Interface
- **Título da página**: "Internal Order Form - Tomahawk"
- **Cabeçalho**: "Internal Order Form" 
- **Botões PDF**: 
  - "Generate Internal Order (English)"
  - "Gerar Pedido Interno (Português)"
- **Termos e condições**: Removido (não aplicável para pedidos internos)

### ✅ Campos Mantidos
- Especificações da sela (tamanho do assento, tipo de árvore, etc.)
- Todas as opções de personalização (couro, ferragens, conchos, etc.)
- Notas especiais e solicitações
- Campos obrigatórios apropriados para especificação do produto

### 🎯 Resultado
O formulário agora é focado exclusivamente na especificação do produto para pedidos internos, sem informações de cliente ou cobrança. Mantém toda a funcionalidade de personalização da sela com uma interface mais limpa e direcionada.

### 📝 Próximos Passos Sugeridos
- Testar a geração de PDF para garantir que funciona corretamente sem os campos removidos
- Verificar se os arquivos JavaScript precisam de ajustes para lidar com a ausência dos campos de cliente e pagamento
- Considerar adicionar um campo de "Número do Pedido Interno" ou "Referência" se necessário