# CINEFLIX

Site estático em HTML5, CSS3 e JavaScript puro. Não usa framework, processo de build, servidor próprio ou dependências de Node.js/Python.

## Executar localmente

1. Abra `index.html` diretamente no navegador.
2. Para testar, use a busca, os filtros, os detalhes dos filmes, os favoritos e o painel administrativo.

Os arquivos CSS e JavaScript são carregados por caminhos relativos a partir da pasta raiz. O catálogo, os favoritos e o progresso ficam no `localStorage` do navegador. As fontes, imagens e vídeos iniciais são carregados de provedores externos e precisam de conexão com a internet.

## Publicar na Vercel

1. Crie um repositório no GitHub e envie a branch `main` deste projeto.
2. Na Vercel, escolha **Add New Project**, conecte o GitHub e importe esse repositório.
3. Selecione **Other** como framework e mantenha a raiz do projeto como diretório raiz.
4. Deixe o comando de build e o diretório de saída sem configuração para a Vercel publicar os arquivos estáticos da raiz. Não há dependências ou variáveis de ambiente necessárias.
5. Confirme a branch de produção como `main` e faça o primeiro deploy pela interface da Vercel.

Depois de conectar o repositório e a Vercel, cada push para `main` inicia um novo deploy automaticamente. Pull requests também podem gerar previews conforme as configurações da integração.

### Preparar o GitHub pela primeira vez

O repositório local já está inicializado na branch `main`. Depois de criar um repositório vazio no GitHub, abra um terminal nesta pasta e execute:

```powershell
git add .
git status
git commit -m "Publica site CINEFLIX"
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Substitua a URL de exemplo pela do repositório que você criar. O `.gitignore` exclui metadados locais da Vercel, arquivos de ambiente e arquivos gerados. Revise `git status` antes de cada commit e nunca adicione tokens ou credenciais ao repositório.

## Configuração da Vercel

Não é necessário `vercel.json`: o site não tem rotas de aplicação além de `index.html` e âncoras (`#inicio`, `#catalogo`). Assim, não precisa de rewrites para recarregar páginas internas. Não há redirecionamentos configurados.

A Vercel serve HTTPS automaticamente. O player usa vídeos externos compatíveis com o elemento HTML5; a disponibilidade e a licença de cada vídeo continuam sob responsabilidade da fonte indicada no catálogo.
