# Sistema de Internacionalização (i18n)

Este projeto agora inclui suporte completo para múltiplos idiomas (inglês e português).

## Funcionalidades

### 🌐 Tradução Automática
- **Detecção automática do idioma**: O sistema detecta o idioma do navegador e define automaticamente
- **Persistência**: A preferência de idioma é salva no localStorage
- **Tradução dinâmica**: Toda a interface é traduzida sem recarregar a página

### 🔄 Alternância de Idiomas
- **Botão flutuante**: Localizado no canto superior direito
- **Indicadores visuais**: Bandeiras e códigos de idioma (🇺🇸 EN / 🇧🇷 PT)
- **Transição suave**: Animações durante a troca de idioma

### 📝 Elementos Traduzidos
- Títulos de seções
- Labels de formulários
- Placeholders de inputs
- Botões e textos de ação
- Mensagens do sistema
- Título da página

## Estrutura de Arquivos

```
├── js/
│   └── i18n.js                 # Gerenciador de internacionalização
├── css/
│   └── i18n.css               # Estilos do botão de idioma
├── assets/
│   └── translations.json      # Arquivo de traduções
└── index.html                 # HTML com atributos data-i18n
```

## Como Usar

### Adicionando Novas Traduções

1. **No HTML**: Adicione o atributo `data-i18n` aos elementos:
```html
<h2 data-i18n="sectionTitle">Section Title</h2>
<input placeholder="Enter text" data-i18n="inputPlaceholder">
<button data-i18n="submitButton">Submit</button>
```

2. **No translations.json**: Adicione as traduções correspondentes:
```json
{
  "en": {
    "sectionTitle": "Section Title",
    "inputPlaceholder": "Enter text",
    "submitButton": "Submit"
  },
  "pt": {
    "sectionTitle": "Título da Seção",
    "inputPlaceholder": "Digite o texto",
    "submitButton": "Enviar"
  }
}
```

### Tipos de Elementos Suportados

- **Textos**: `<h1>`, `<h2>`, `<p>`, `<span>`, `<label>`, etc.
- **Placeholders**: `<input>`, `<textarea>`
- **Botões**: `<button>`, `<input type="submit">`
- **Título da página**: `<title>`

### Preservação de Emojis

O sistema automaticamente preserva emojis em:
- Títulos de seções (🏇, 🎨, 🔨, etc.)
- Botões de ação (🚀, 💾, etc.)

## Idiomas Suportados

- **Inglês (en)**: Idioma padrão
- **Português (pt)**: Tradução completa para o mercado brasileiro

## Detecção de Idioma

1. **Preferência salva**: Verifica localStorage
2. **Idioma do navegador**: Detecta automaticamente
3. **Padrão**: Inglês se nenhum dos anteriores

## Personalização

### Adicionando Novos Idiomas

1. Adicione as traduções no `translations.json`
2. Atualize a lógica de detecção em `i18n.js`
3. Adicione a bandeira correspondente no botão

### Modificando Estilos

Edite `css/i18n.css` para personalizar:
- Posição do botão de idioma
- Cores e animações
- Responsividade

## Integração com PDF

O sistema de tradução está integrado com o gerador de PDF:
- PDFs são gerados em ambos os idiomas
- Traduções automáticas dos campos
- Nomes de arquivo localizados

## Problemas Resolvidos

✅ **tooledCoverage sempre "plain"**: Corrigido uso de `getFieldValue` vs `getCheckedRadioValue`  
✅ **Sequência de imagens**: Corrigida ordem das opções de assento  
✅ **Traduções inconsistentes**: Padronizadas todas as traduções  
✅ **Interface multilíngue**: Sistema completo de i18n implementado  

## Suporte

Para adicionar novos idiomas ou modificar traduções existentes, edite o arquivo `assets/translations.json` e adicione os atributos `data-i18n` correspondentes no HTML.