# Sistema de Traduções - Tomahawk Saddle Order System

## Visão Geral

O sistema de traduções permite gerar PDFs em múltiplos idiomas (inglês e português) usando arquivos de tradução externos para facilitar a manutenção e expansão.

## Arquivos do Sistema

### 1. `assets/translations.json`
Arquivo principal contendo todas as traduções organizadas por idioma:

```json
{
  "en": {
    "title": "TOMAHAWK BARREL SADDLE",
    "subtitle": "Custom Saddle Order Form",
    // ... outras traduções em inglês
  },
  "pt": {
    "title": "SELA TOMAHAWK BARREL", 
    "subtitle": "Formulário de Pedido de Sela Personalizada",
    // ... outras traduções em português
  }
}
```

### 2. `TranslationManager.js`
Classe utilitária que gerencia o carregamento e acesso às traduções:

- **Singleton Pattern**: Uma única instância compartilhada
- **Carregamento Assíncrono**: Carrega traduções via fetch
- **Fallback**: Usa inglês como fallback se tradução não encontrada
- **Validação**: Verifica se idiomas existem antes de usar

### 3. `PDFGenerator.js` (Atualizado)
Agora usa o TranslationManager em vez de traduções hardcoded:

```javascript
// Antes (hardcoded)
this.translations = { en: {...}, pt: {...} };

// Depois (usando TranslationManager)
this.translationManager = TranslationManager.getInstance();
```

## Como Usar

### Adicionando Novas Traduções

#### **Traduções de Rótulos**

1. **Edite o arquivo `assets/translations.json`**:
```json
{
  "en": {
    "newKey": "New English Text",
    "existingKey": "Updated English Text"
  },
  "pt": {
    "newKey": "Novo Texto em Português", 
    "existingKey": "Texto Atualizado em Português"
  }
}
```

2. **Use a nova chave no código**:
```javascript
this.getTranslation('newKey')
```

#### **Traduções de Opções de Formulário**

1. **Adicione na seção `options` do arquivo `assets/translations.json`**:
```json
{
  "en": {
    "options": {
      "newFieldName": {
        "optionValue1": "English Option 1",
        "optionValue2": "English Option 2"
      }
    }
  },
  "pt": {
    "options": {
      "newFieldName": {
        "optionValue1": "Opção 1 em Português",
        "optionValue2": "Opção 2 em Português"
      }
    }
  }
}
```

2. **Use no código**:
```javascript
this.getOptionTranslation('newFieldName', 'optionValue1')
```

### Adicionando Novos Idiomas

1. **Adicione o novo idioma no `assets/translations.json`**:
```json
{
  "en": { ... },
  "pt": { ... },
  "es": {
    "title": "SILLA TOMAHAWK BARREL",
    "subtitle": "Formulario de Pedido de Silla Personalizada",
    // ... todas as traduções em espanhol
  }
}
```

2. **Use o novo idioma no código**:
```javascript
const pdfGenerator = new PDFGenerator(doc, form, 'es');
```

### Exemplo de Uso no Código

```javascript
// Criar instância do TranslationManager
const translationManager = TranslationManager.getInstance();

// Aguardar carregamento das traduções
await translationManager.loadTranslations();

// Definir idioma
translationManager.setLanguage('pt');

// Obter tradução de rótulo
const title = translationManager.getTranslation('title');
// Retorna: "SELA TOMAHAWK BARREL"

// Obter tradução de opção
const treeType = translationManager.getOptionTranslation('treeType', 'SAFE');
// Retorna: "SEGURA"

const saddleBuild = translationManager.getOptionTranslation('saddleBuild', 'Full Leather');
// Retorna: "Couro Completo"
```

## Vantagens do Sistema

### ✅ **Manutenibilidade**
- Traduções centralizadas em um arquivo JSON
- Fácil edição sem tocar no código JavaScript
- Separação clara entre lógica e conteúdo

### ✅ **Escalabilidade**
- Adicionar novos idiomas é simples
- Adicionar novas traduções não requer alterações no código
- Sistema preparado para expansão futura

### ✅ **Robustez**
- Fallback automático para inglês
- Tratamento de erros de carregamento
- Validação de idiomas disponíveis

### ✅ **Performance**
- Carregamento assíncrono das traduções
- Singleton pattern evita múltiplas instâncias
- Cache das traduções após primeiro carregamento

## Estrutura de Arquivos

```
assets/
└── translations.json          # Arquivo de traduções

imgs/
└── [imagens organizadas por categoria]

js/
├── TranslationManager.js      # Gerenciador de traduções
├── PDFGenerator.js           # Gerador de PDF (atualizado)
├── SaddleFormManager.js      # Gerenciador do formulário
└── README_TRANSLATIONS.md    # Esta documentação
```

## Troubleshooting

### Problema: Traduções não carregam
**Solução**: Verifique se o arquivo `assets/translations.json` está no caminho correto e é válido JSON.

### Problema: Tradução não encontrada
**Solução**: O sistema automaticamente usa o inglês como fallback e registra um warning no console.

### Problema: Novo idioma não funciona
**Solução**: Certifique-se de que todas as chaves de tradução existem no novo idioma.

## Exemplo Completo de Adição de Idioma

Para adicionar espanhol ao sistema:

1. **Atualize `assets/translations.json`**:
```json
{
  "en": { "title": "TOMAHAWK BARREL SADDLE" },
  "pt": { "title": "SELA TOMAHAWK BARREL" },
  "es": { "title": "SILLA TOMAHAWK BARREL" }
}
```

2. **Atualize o método `generateDualLanguage` se necessário**:
```javascript
// Para gerar em 3 idiomas
generateTripleLanguage() {
  // Gerar EN, PT e ES
}
```

3. **Teste o novo idioma**:
```javascript
const pdfGenerator = new PDFGenerator(doc, form, 'es');
await pdfGenerator.generateDualLanguage();
```