# ✦ eugrifo

> Extensão de navegador para destacar e salvar textos da web no seu próprio repositório GitHub — com widget embeddável para exibir no seu site.

Baseado no [projeto pessoal da Uoshi](https://oieuoshi.vercel.app/blog/misc/porque-eu-fiz-uma-extensao-pra-salvar-textos-destacados). Feito para quem quer ter seus destaques de leitura organizados, sem depender de plataformas pagas ou assinaturas.

---

## Como funciona

```
Você seleciona um texto → A extensão salva no seu GitHub → O widget exibe no seu site
```

Tudo fica no **seu** repositório GitHub, no formato JSON. Sem servidor, sem conta em plataforma, sem dado seu em lugar nenhum além do GitHub.

---

## O que está nesse repositório

```
eugrifo/
├── highlights-widget/
│   └── widget.js          ← script embeddável para qualquer site
├── version.json           ← controle de versão (lido pela extensão)
├── guia.html              ← guia de instalação completo
└── README.md
```

Os arquivos da extensão (que você instala no navegador) são distribuídos separadamente — veja abaixo.

---

## Instalação rápida

O processo completo está no [**guia de instalação**](./guia.html). O resumo:

1. **Crie um repositório** no GitHub para guardar seus grifos
2. **Gere um token** com escopo `repo` em github.com/settings/tokens
3. **Baixe os arquivos** da extensão e instale em `chrome://extensions` (modo desenvolvedor)
4. **Configure** — token, usuário, repositório e nome do arquivo JSON
5. **Cole o widget** no seu site e comece a grifo

---

## Widget

O widget exibe seus grifos em qualquer página que aceite HTML. Cole o snippet abaixo e substitua os valores:

```html
<div id="meus-grifos"></div>
<script
  src="https://cdn.jsdelivr.net/gh/od3zza/eugrifo@main/highlights-widget/widget.js"
  data-owner="seu-usuario"
  data-repo="seu-repositorio"
  data-file="eugrifo-highlights.json"
  data-accent="#ffd700"
  data-theme="light"
  data-lang="pt"
  data-target="meus-grifos">
</script>
```

### Atributos

| Atributo | Obrigatório | Descrição |
|----------|-------------|-----------|
| `data-owner` | sim | Seu usuário do GitHub |
| `data-repo` | sim | Nome do repositório dos grifos |
| `data-file` | sim | Caminho do arquivo JSON no repositório |
| `data-target` | sim | `id` do elemento onde o widget será renderizado |
| `data-accent` | não | Cor de destaque em hex. Padrão: `#ffd700` |
| `data-theme` | não | `light` ou `dark`. Padrão: `light` |
| `data-lang` | não | `pt` ou `en`. Padrão: `pt` |
| `data-token` | não | Token readonly para repositórios privados |

> **Repositório privado?** Gere um Fine-grained token com `Contents: Read-only` e passe em `data-token`. Nunca use o mesmo token da extensão.

### Funcionalidades do widget

- Cards fechados por padrão — abre ao clicar
- Busca por texto nos destaques, notas e títulos
- Filtro por tags (multi-select, oculto por padrão)
- Busca e filtro não coexistem — um limpa o outro
- Suporte a temas claro e escuro
- Português e inglês

---

## Arquivos da extensão

| Arquivo | Função |
|---------|--------|
| `manifest.json` | Configuração da extensão (nome, permissões, versão) |
| `background.js` | Service worker — lê e escreve no GitHub via API |
| `content.js` | Injetado nas páginas — aplica os destaques no DOM |
| `popup.html/js` | Interface do popup ao clicar na extensão |
| `options.html/js` | Página de configurações (GitHub, aparência, widget) |

---

## Formato do JSON

Os grifos ficam salvos em um arquivo JSON no seu repositório com essa estrutura:

```json
{
  "https://exemplo.com/artigo": {
    "date": "2026-04-20",
    "title": "Título do artigo",
    "tags": ["design", "referência"],
    "page_comment": "Comentário geral sobre a página",
    "highlights": [
      {
        "id": "uuid",
        "highlight": "Trecho destacado",
        "color": "#ffd700",
        "highlight_note": "Minha nota sobre esse trecho"
      }
    ]
  }
}
```

> **Atenção:** o arquivo deve ser um objeto `{}`, não um array `[]`. Se você criou o arquivo manualmente e ele está como `[]`, edite e substitua por `{}`.

---

## Atualizações

### Widget
O widget usa `@main` na URL do jsDelivr — sempre carrega a versão mais recente após o cache expirar. Para forçar atualização imediata:

```
https://purge.jsdelivr.net/gh/od3zza/eugrifo@main/highlights-widget/widget.js
```

### Extensão
A extensão verifica o arquivo `version.json` desse repositório ao abrir as configurações. Se houver versão nova, exibe um banner com changelog e link para download.

Para lançar uma nova versão, atualize o `version.json`:

```json
{
  "version": "1.1.0",
  "date": "2026-05-01",
  "changelog": "Descrição das mudanças.",
  "download": "https://github.com/od3zza/eugrifo/releases/latest",
  "widget_url": "https://cdn.jsdelivr.net/gh/od3zza/eugrifo@main/highlights-widget/widget.js"
}
```

---

## Problemas frequentes

**O JSON foi criado como `[]`**
Edite o arquivo no GitHub, substitua por `{}` e salve.

**Grifos não aparecem ao recarregar**
Use o botão 🔄 Restaurar highlights no popup.

**Widget não atualiza após novo commit**
Faça o purge do jsDelivr (URL acima).

**Erro 404 ao testar conexão**
Verifique se usuário e repositório estão escritos exatamente como na URL do GitHub.

---

## Créditos

Criado a partir do projeto pessoal de [Uoshi](https://oieuoshi.vercel.app) — uma extensão caseira feita com fogo no rabo e muito JavaScript.

Se você usar o eugrifo e fizer a sua versão, manda ver. 🌿
