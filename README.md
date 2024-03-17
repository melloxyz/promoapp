# 🤖 Projeto Piloto de Scraping para Captura de Promoções

Este é um projeto piloto de scraping desenvolvido para capturar informações sobre promoções de jogos em um site específico. O objetivo deste projeto é criar uma base inicial para o desenvolvimento de um aplicativo ou bot dedicado à busca e notificação de promoções em jogos.

## ℹ️ Sobre o Projeto

O projeto consiste em um script Node.js que realiza Captura de dados de uma lista de URLs configuradas. Ele extrai informações sobre jogos em promoção, como nome, preço, preço original, desconto e plataforma.

### Principais Funcionalidades:
- Captura de dados de múltiplas URLs para obter informações sobre promoções de jogos.
- Formatação e armazenamento dos dados em arquivos JSON para análise posterior.
- Configuração de throttle para evitar sobrecarga no servidor alvo.
- Programação de execução periódica para obter dados atualizados.

## 🚀 Como Usar

1. **Instalação das Dependências**: Antes de executar o script, instale as dependências necessárias com o comando:
   ```
   npm install axios cheerio bottleneck --save ou npm install $(cat requirements.txt)
   ```

2. **Configuração**: Edite o arquivo `config.json` para configurar as URLs de scraping, o intervalo de scraping e outras opções conforme necessário.

3. **Execução**: Para iniciar a Captura de dados, execute o script com o comando:
   ```
   node PromoApp.js
   ```

## ⚙️ Configurações

- `urls`: Lista de URLs a serem raspadas.
- `scrapeInterval`: Intervalo de tempo em minutos para executar a Captura novamente.
- `maxConcurrentRequests`: Número máximo de requisições simultâneas permitidas.
- `minRequestInterval`: Intervalo mínimo de tempo entre as requisições.

## 🛠️ Tecnologias Utilizadas

- Node.js
- Axios
- Cheerio
- Bottleneck