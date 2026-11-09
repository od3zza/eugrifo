# Política de Privacidade — EuGrifo

Última atualização: 8 de novembro de 2026

O EuGrifo é uma extensão de navegador para grifar textos da web. Esta política explica mais sobre quais dados a extensão usa e para quê.

## Resumo

- Seus destaques ficam **no seu navegador**, como (`chrome.storage.local`).
- O EuGrifo **não tem servidor** e **não envia dados ao desenvolvedor** nem a terceiros.
- Não há anúncios, rastreadores nem análise de uso.
- A publicação no GitHub é **opcional** e vem **desligada**. Ao ligá-la, os destaques são enviados apenas ao repositório que você configurou.

## Quais dados a extensão guarda

Tudo é guardado localmente, no armazenamento da própria extensão (`chrome.storage.local`):

- **Destaques:** o trecho selecionado, o texto ao redor usado para reencontrá-lo, a cor, a nota, a opção "privado", e a data de criação e de alteração.
- **Páginas:** o endereço (URL) e o título das páginas em que você criou destaques, além das tags e do comentário que você escrever.
- **Ajustes:** nome da extensão, cores e a opção de mostrar ou não a barra de seleção.
- **Conexão com o GitHub (somente se você configurar):** o token de acesso, o nome do repositório e o caminho do arquivo. O token é guardado apenas neste navegador e só as páginas da extensão conseguem lê-lo.

## O que a extensão lê nas páginas

Para localizar e pintar seus destaques e mostrar a barra de seleção, a extensão roda nas páginas que você visita e lê o texto da página **no seu próprio dispositivo**. Esse conteúdo não é transmitido a ninguém.

## Quando há comunicação pela internet

Somente quando você liga a publicação no GitHub, usa **Testar conexão** ou **Publicar agora**. Nesses casos a extensão se conecta a `api.github.com` com o token que você forneceu, para ler e gravar o arquivo de destaques no repositório que você indicou. O conteúdo enviado é o arquivo JSON com seus destaques **não privados** (trechos, notas, tags, URLs e títulos).

Atenção: se o repositório for público, qualquer pessoa pode ver esse arquivo e o histórico dele no Git. A configuração do repositório e do que fica nele é responsabilidade sua. Destaques marcados como **Privado** nunca são enviados.

O widget opcional para sites (`highlights-widget`) é um script separado, instalado por você no seu site. Ele lê o arquivo publicado diretamente de `raw.githubusercontent.com`. A extensão em si não carrega esse script.

## O que o EuGrifo não faz

- Não vende nem compartilha dados.
- Não usa seus dados para publicidade, perfilamento ou qualquer finalidade além de oferecer as funções descritas aqui.
- Não coleta estatísticas de uso nem identificadores.
- Não executa código remoto: todo o código está no pacote da extensão.

## Controle e exclusão dos dados

- Para apagar destaques, use **Meus grifos** → **Excluir**.
- Para apagar o token, use **Exportar** → **Esquecer GitHub**.
- Desinstalar a extensão remove todos os dados locais dela.
- Os dados já publicados no seu repositório do GitHub continuam lá e são geridos por você, no GitHub (lembrando que o histórico do Git guarda versões antigas).

## Permissões usadas

| Permissão | Para quê |
| --- | --- |
| `storage` | Guardar destaques e ajustes no navegador. |
| `alarms` | Agendar a publicação opcional (30 s após a última mudança e conferência a cada hora). |
| `contextMenus` | Item "Salvar no EuGrifo" no botão direito. |
| `api.github.com` | Publicação opcional no seu repositório. |
| Scripts em todas as páginas | Localizar e pintar destaques e mostrar a barra de seleção. |

## Alterações nesta política

Mudanças serão registradas neste arquivo, com a data no topo.

## Contato

Dúvidas ou pedidos: abra uma *issue* no repositório do projeto ou escreva para **[emulacid@gmail.com]**.
