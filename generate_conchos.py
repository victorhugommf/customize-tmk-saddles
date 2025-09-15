#!/usr/bin/env python3
"""
Script para gerar a nova seção de conchos com as 111 imagens da pasta 22-ConchosNew
"""

def generate_conchos_section():
    """Gera o HTML para a seção de conchos com lazy loading"""
    
    html_content = []
    html_content.append('                    <h3>Conchos</h3>')
    html_content.append('                    <div class="form-group">')
    html_content.append('                        <label>Conchos Option</label>')
    html_content.append('                        <div class="checkbox-grid conchos-grid">')
    
    # Gerar os 111 conchos
    for i in range(1, 112):  # 1 to 111
        # Formatar o número com zero à esquerda se necessário
        img_num = f"{i:02d}" if i < 100 else str(i)
        
        # Determinar a extensão do arquivo
        if i == 22:
            img_file = f"{img_num}_png.webp"
        else:
            img_file = f"{img_num}_opt.webp"
        
        # Formatar o ID com zero à esquerda (sempre 3 dígitos)
        concho_id = f"concho{i:03d}"
        
        html_content.append('                            <div class="checkbox-item">')
        html_content.append(f'                                <input type="radio" id="{concho_id}" name="conchos" value="{i}">')
        html_content.append(f'                                <label for="{concho_id}">')
        html_content.append(f'                                    <img src="imgs/22-ConchosNew/{img_file}" width="100%" height="auto" alt="Concho {i}"')
        html_content.append('                                        loading="lazy" class="option-image">')
        html_content.append(f'                                    {i}')
        html_content.append('                                </label>')
        html_content.append('                            </div>')
    
    html_content.append('                        </div>')
    html_content.append('                    </div>')
    
    return '\n'.join(html_content)

if __name__ == "__main__":
    # Gerar a nova seção
    new_section = generate_conchos_section()
    
    # Salvar em arquivo temporário
    with open('new_conchos_section.html', 'w', encoding='utf-8') as f:
        f.write(new_section)
    
    print("Nova seção de conchos gerada em 'new_conchos_section.html'")
    print("Total de imagens: 111")
    print("Pasta de origem: imgs/22-ConchosNew/")
    print("Lazy loading: Ativado")