# EuGrifo

**Controle total para os textos que você quer salvar da web.** Selecione um trecho em qualquer página, escolha uma cor e pronto: o destaque fica guardado no seu navegador e volta a aparecer quando você revisitar a página. Se quiser, publique tudo automaticamente no seu próprio repositório do GitHub e mostre seus grifos no seu site.

- 🔒 **Seus dados ficam com você.** Tudo é salvo no navegador e funciona sem internet. Não há servidor do projeto, anúncios nem análise de uso.
- ⚡ **Rápido e simples.** Salvar, editar e excluir são instantâneos.
- 📤 **Exportação opcional.** Baixe JSON ou Markdown, ou ligue a publicação automática no GitHub.

> Navegadores: Chrome, Edge e Brave (versão 110 ou mais nova). Firefox ainda não é suportado.

<!--
TODO - CAPTURAS DE TELA — Pra lembrar > (1280×800):
![Barra de seleção](docs/screenshots/01-barra.png)
![Editor do destaque](docs/screenshots/02-editor.png)
![Meus grifos](docs/screenshots/03-meus-grifos.png)
![Exportar](docs/screenshots/04-exportar.png)
-->

## Índice

- [Instalação](#instalação)
- [Como usar](#como-usar)
- [Exportar e publicar no GitHub](#exportar-e-publicar-no-github)
- [Mostrar os grifos no seu site](#mostrar-os-grifos-no-seu-site)
- [Privacidade](#privacidade)
- [Perguntas frequentes](#perguntas-frequentes)
- [Limitações conhecidas](#limitações-conhecidas)
- [Desenvolvimento](#desenvolvimento)

## Instalação

### Pela Chrome Web Store

> Em breve. O link será adicionado aqui quando a extensão for publicada.

### Manualmente (modo desenvolvedor)

1. Baixe o arquivo `eugrifo-extension-x.y.z.zip` na página de [Releases](../../releases) e descompacte (ou clone o repositório e use a pasta `extension/`).
2. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta descompactada.
4. Fixe o ícone da extensão na barra do navegador para acessar o popup com um clique.

## Como usar

### Grifar um texto

Há quatro maneiras, use a que preferir:

| Maneira | Como funciona |
| --- | --- |
| **Barra de seleção** | Selecione o texto e clique em uma cor. Clique em 💬 para escrever uma nota e adicionar tags antes de salvar. |
| **Ícone da extensão** | Com o texto selecionado, abra o popup: cor, nota, tags e comentário sobre a página. |
| **Botão direito** | Selecione o texto → *Salvar no EuGrifo*. Salva com a cor A. Funciona também em PDFs. |
| **Atalho `Alt+Shift+G`** | Salva a seleção com a cor A. Você pode mudar o atalho em `chrome://extensions/shortcuts`. |

A barra de seleção pode ser **desligada** no popup ou em **Ajustes**. Desligada, use as outras três maneiras.

### Editar um destaque

Clique em um trecho já grifado para abrir o editor. Nele você pode:

- trocar a **cor**;
- escrever ou mudar a **nota**;
- adicionar ou remover **tags**. As tags valem para a **página inteira**, não só para um trecho;
- marcar como **🔒 Privado**: o destaque nunca é publicado no GitHub;
- **excluir** o destaque.

Links dentro de um trecho grifado continuam funcionando normalmente.

### Meus grifos

Clique no ícone da extensão → **Meus grifos**. Lá você encontra todos os destaques agrupados por página, com busca por trecho, nota, tag ou título, e pode editar, excluir e mudar as tags de cada página.

### Ajustes

- Liga/desliga a barra de seleção.
- Nome da extensão (aparece no popup).
- Quatro cores de destaque. A cor A é a padrão do botão direito e do atalho. Destaques já salvos mantêm a cor que tinham.

### Novidades

Depois de uma atualização, o ícone ganha um selo **novo** e o popup mostra um aviso (feche no **×**). A aba **Novidades**, nas opções, lista o que mudou em cada versão. O rodapé das opções tem links para a política de privacidade e o projeto.

## Exportar e publicar no GitHub

Abra o ícone da extensão → **Exportar**.

### Baixar uma cópia

- **JSON**: backup completo (inclui os privados). Dá para importá-lo de volta, em qualquer navegador.
- **Markdown**: texto limpo, pronto para notas, blog ou digital garden.

### Publicar automaticamente

Com a publicação ligada, cada mudança é enviada ao seu repositório cerca de 30 segundos depois, e a extensão confere o repositório a cada hora (isso permite usar vários navegadores). Desligada, tudo fica só no navegador.

**Como conectar:**

1. Crie um repositório **público** no GitHub (ou use um existente).
2. Vá em [Settings → Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new) e gere um token **somente para esse repositório**, com a permissão **Contents: Read and write** e uma data de validade.
3. Em **Exportar**, cole o token e o repositório (`usuario/repositorio`), clique em **Salvar conexão** e depois em **Testar conexão**.
4. Ligue **Publicar automaticamente**. Se o repositório já tiver destaques, eles são mesclados com os do navegador.

Pontos importantes:

- O arquivo publicado (`eugrifo-highlights.json` por padrão) fica **visível para qualquer pessoa** num repositório público.
- Desligar a publicação **não apaga** o que já foi publicado, e o histórico do Git guarda versões antigas. Marque como **🔒 Privado** o que não deve sair do navegador.
- **Esquecer GitHub** apaga o token do navegador e desliga a publicação.
- O token fica guardado apenas neste navegador e só as páginas da extensão conseguem lê-lo. Ele nunca é enviado a ninguém além de `api.github.com`.

## Mostrar os grifos no seu site

O widget lê o arquivo publicado direto do repositório (sem token) e exibe os destaques numa página sua. Em **Exportar → Mostrar no meu site**, copie o código e cole no HTML:

```html
<div id="meus-grifos"></div>
<script src="https://cdn.jsdelivr.net/gh/SEU-USUARIO/eugrifo@main/highlights-widget/widget.js"
  data-owner="seu-usuario"
  data-repo="seu-repositorio-de-dados"
  data-file="eugrifo-highlights.json"
  data-target="meus-grifos"></script>
```

Para sites com gerador estático (Eleventy, Astro, Hugo…), você também pode ler o JSON no build. O formato é simples: um objeto com uma chave por página (a URL) contendo `title`, `date`, `tags` e `highlights`.

## Privacidade

Tudo fica no seu navegador. A extensão só se comunica com a internet se você ligar a publicação no GitHub, e nesse caso fala apenas com `api.github.com`, usando o token e o repositório que **você** informou. Não existe servidor do projeto, anúncio ou análise de uso. Veja a [Política de Privacidade](PRIVACY.md).

## Perguntas frequentes

**Preciso de uma conta no GitHub?** Não. Sem conta, tudo funciona localmente e você exporta quando quiser. O GitHub só é necessário para a publicação automática e para o widget.

**Perco meus destaques se trocar de navegador?** Eles ficam no navegador em que foram salvos. Para levá-los, baixe o JSON em **Exportar** e importe no outro navegador, ou use a publicação no GitHub.

**Os destaques somem se a página mudar?** O texto é procurado de novo a cada visita. Se o trecho for reescrito ou removido, ele não é pintado, mas continua salvo em **Meus grifos**.

**Funciona em PDFs?** Pelo botão direito, sim: o trecho é salvo, mas não é pintado dentro do PDF.

**O que é "página" para a extensão?** A URL sem o `#` e sem parâmetros de rastreio (`utm_*`, `fbclid` e similares). Outros parâmetros diferenciam as páginas.

**Posso usar um repositório privado?** Para publicar, sim. Mas o widget só lê repositórios públicos.

## Limitações conhecidas

- Não funciona em páginas internas do navegador (`chrome://`), na Chrome Web Store, nem em sites que bloqueiam extensões.
- Em PDFs não há destaque de cor, só o salvamento do conteúdo pelo botão direito.
- Sites que recriam o conteúdo o tempo todo podem demorar alguns segundos para mostrar os grifos.
- Tags são por página, não por trecho.
- Firefox ainda não é suportado.

### Gostou da extensão? Me compre uma pipoca 🍿 https://ko-fi.com/od3zza