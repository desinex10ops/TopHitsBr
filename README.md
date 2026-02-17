# TopHitsBr 🎵

Plataforma profissional de streaming local, gerenciamento de músicas e criação de Pen Drives personalizados.

## 🚀 Funcionalidades Principais

### 🎧 Experiência do Usuário (Frontend)
- **Home Page Estilo Netflix**: Banner destaque dinâmico, carrosséis de lançamentos e "Feito para Você".
- **Player Persistente**: Controle de volume, barra de progresso, Play/Pause/Próxima/Anterior.
- **Navegação por Gêneros**: Páginas dedicadas para estilos musicais (Sertanejo, Funk, Eletrônica, etc.).
- **Playlists Automáticas**: Geração inteligente de listas como "Top 50", "Aleatório" e "Recentes".
- **Pen Drive Virtual**: Adicione músicas ao carrinho e baixe um pacote ZIP pronto para uso.
- **Busca Global**: Pesquise instantaneamente por músicas, artistas ou álbuns.

### 🛠️ Painel Administrativo (Backend)
- **Upload Completo**: Envio de arquivos MP3 e imagens de capa com metadados.
- **Gestão de Acervo**: Tabela para visualizar e excluir músicas do sistema (arquivos + banco de dados).
- **API RESTful**: Backend robusto em Node.js com SQLite para persistência rápida.

### 🎨 UI/UX Premium
- **Design Responsivo**: Funciona em PC, Tablet e Celular.
- **Feedback Visual**: Sistema de notificações (Toasts) para ações do usuário.
- **Transições Suaves**: Carregamento com Skeleton Screens e Fade-in de imagens.

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js instalado (v14+)

### Como Rodar (Windows)
A maneira mais fácil é usar o script automático na pasta `maintenance`:

1. Navegue até a pasta `maintenance` e dê dois cliques no arquivo `iniciar_tudo_v2.bat`.
   - Isso abrirá duas janelas: uma para o Servidor (Porta 3000) e uma para o Site (Porta 5173).

---

### Execução Manual

#### 1. Backend (Servidor)
```bash
cd server
npm install
npm start
```

#### 2. Frontend (Site)
```bash
cd client
npm install
npm run dev
```

Acesse o site em: `http://localhost:5173`

## 📂 Estrutura do Projeto

- **/client**: Aplicação React com Vite.
  - `src/pages`: Home, Admin, Upload, Genres, Playlists.
  - `src/components`: Player, Header, Toasts, Modais.
  - `src/contexts`: Gerenciamento de estado global (Player, Toast).
- **/server**: API Node.js.
  - `src/database`: Configuração SQLite e Modelos.
  - `src/routes`: Endpoints da API.
  - `src/controllers`: Lógica de negócio.
- **/storage**: Onde os arquivos MP3 e Capas são salvos.

## 📝 Desenvolvido por
Projeto criado com auxílio de IA Agentic.
