# IBNOV - Sistema Digital para a Igreja Batista Nova Vida

Projeto extensionista desenvolvido para o **Centro Universitário Processus**, na disciplina de **Atividade de Extensão - Automação de Processos de Negócios**, com o objetivo de criar uma solução digital para gestão e comunicação da **Igreja Batista Nova Vida**, localizada em Taguatinga-Sul/DF.

🔗 **Acesse o site:** [ibnov.vercel.app](https://ibnov.vercel.app/)

## 🎯 Objetivo do projeto

Automatizar e centralizar os processos de comunicação e gestão da igreja, facilitando o contato com os membros, a organização de eventos e o apoio às atividades internas — reduzindo falhas de informação e modernizando a gestão administrativa da instituição.

**Público-alvo:** aproximadamente 140 pessoas, entre membros e comunidade da igreja.

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- Node.js
- Firebase (Firestore, Authentication)
- API do Mercado Pago (pagamentos via Pix)
- Git e GitHub
- Vercel (deploy e hospedagem)

## ⚙️ Funcionalidades

O sistema **IBNOV** conta com as seguintes funcionalidades principais:

- **Tela inicial (overview)** — apresentação da igreja, serviços, eventos, carrossel de novidades, informações institucionais e localização
- **Navbar** — navegação entre Início, Loja, Eventos e Comunicação (artigos, podcasts e vídeos)
- **Cadastro de usuários** — criação de conta com dados pessoais (nome, e-mail, telefone, CPF, endereço, etc.)
- **Login e logout** — autenticação de usuários cadastrados
- **Recuperação de senha** — redefinição de senha via link enviado por e-mail
- **Meu perfil** — visualização e edição de dados pessoais, além de ativação/desativação da conta
- **Doações via Pix** — geração de QR Code e código copia-e-cola integrados à API do Mercado Pago, com confirmação automática do pagamento
- **Formulário de notificações (leads)** — inscrição de visitantes (mesmo sem conta) para receber novidades da igreja
- **Pesquisa de conteúdos** — busca por artigos, vídeos e podcasts
- **Seção de eventos** — divulgação dos cultos e atividades da igreja
- **Seção de pastores** — apresentação da equipe pastoral com redes sociais

## 🗄️ Banco de dados

O projeto utiliza o **Firebase Firestore** como banco de dados NoSQL, organizado nas seguintes coleções principais:

- `membro` — dados dos usuários cadastrados (nome, e-mail, telefone, CPF, endereço, status da conta, etc.)
- `doacoes` — registros das doações via Pix, com status de pagamento (`pending`, `ok`, `expired`)
- `leads` — cadastros de visitantes interessados em receber notificações da igreja

## ▶️ Como executar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone <link-do-repositorio>
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente necessárias (credenciais do Firebase e do Mercado Pago)
4. Execute o projeto localmente:
   ```bash
   npm run dev
   ```
5. Acesse pelo navegador no endereço indicado pelo terminal (geralmente `http://localhost:3000`)

## 🚀 Deploy

O projeto está hospedado na **Vercel**, com deploy contínuo integrado ao GitHub.

## 📄 Sobre o projeto acadêmico

- **Curso:** Análise e Desenvolvimento de Sistemas / Sistemas de Informação
- **Disciplina:** Atividade de Extensão - Automação de Processos de Negócios
- **Instituição parceira:** Igreja Batista Nova Vida
- **Período de execução:** 13/02/2026 a 10/07/2026

## 👥 Equipe de desenvolvimento

- Antônio Rodrigues da Silva
- Franciene Dias da Silva
- Gabriel Cristopher Ferreira
- Jonatas Kelwin Silva Borges
- Samuel Silva dos Santos
- Sérgio Rodrigues de Albuquerque

**Professor Articulador:** Henderson Matsuura Sanches
