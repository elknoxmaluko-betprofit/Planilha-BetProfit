
# 🚀 BetProfit - Gestão Profissional de Apostas

O **BetProfit** é uma aplicação web moderna e minimalista desenhada para traders desportivos que operam na Betfair Exchange. Permite o registo, monitorização e análise detalhada de performance, substituindo as tradicionais folhas de Excel por uma interface intuitiva e potente.

## ✨ Funcionalidades

- **📈 Dashboards em Tempo Real**: Visualização mensal e anual de lucro/prejuízo.
- **📅 Visão Anual**: Gráficos agregados de todos os meses para análise de longo prazo.
- **⚽ Análise por Equipa e Campeonato**: Descubra onde é mais lucrativo e onde está a perder dinheiro.
- **🧪 Gestão de Métodos**: Registe as suas metodologias (ex: Lay the Draw, Back Favorito) e analise o Win Rate de cada uma.
- **🏷️ Sistema de Tags**: Organize as suas entradas com tags personalizadas.
- **📥 Importação CSV**: Suporte para importação de extratos da Betfair.
- **💾 Backup Local**: Exportação e importação de dados via JSON para total privacidade e portabilidade.
- **🔒 Login Local**: Sistema de autenticação local para segurança básica dos seus dados.

## 🛠️ Tecnologias Utilizadas

- **React 19** (via ESM)
- **Tailwind CSS** (Estilização)
- **Recharts** (Gráficos e Visualização de Dados)
- **FontAwesome** (Ícones)
- **LocalStorage API** (Armazenamento persistente no navegador)

## 🚀 Como instalar e rodar

1. Faça o clone do repositório:
   ```bash
   git clone https://github.com/seu-utilizador/betprofit.git
   ```
2. Como este projeto utiliza **ES Modules (ESM)** nativos no navegador, não precisa de um processo de build complexo. Basta servir a pasta raiz com qualquer servidor estático:
   ```bash
   npx serve .
   ```

## ☁️ Deploy no Vercel

Este projeto está pronto para o **Vercel**:
1. Conecte o seu repositório GitHub ao Vercel.
2. Selecione o diretório raiz.
3. O Vercel detetará automaticamente o `index.html` e servirá a aplicação como um site estático.

---
*Desenvolvido para Traders, por Traders.*
