# Consolidado do Projeto MG Location

## Funcionalidades e Requisitos Funcionais

1. **Renderização 3D do Terreno**  
   O sistema renderiza mapas tridimensionais com relevo detalhado.

2. **Demarcação de Áreas de Risco**  
   Permite marcar visualmente zonas de risco no mapa.

3. **Integração de Alertas da Defesa Civil**  
   Captura e exibe alertas de eventos como enchentes e terremotos.

4. **Notificações Push para Vítimas**  
   Alerta as vítimas sobre desastres e fornece instruções de segurança.

5. **Dashboard Público Interativo**  
   Área pública para colaboração, onde usuários podem indicar pontos de risco, enviar mídias e atribuir níveis de risco.

6. **Gestão de Permissões com Keycloak**  
   Uso do Keycloak para gerenciar acesso e login dos voluntários via SSO personalizado.

7. **Integração Keycloak-Backend (Django)**  
   Integração do Keycloak com a API backend para controle de permissões.

8. **Script de Configuração e Pipeline**  
   Script `.sh` executado no pipeline Docker para configurar o Keycloak (usuários, roles, certificados, login com Google, etc).

9. **Atualização do Frontend**  
   Ajustes no frontend para integrar as novas funcionalidades, incluindo criação de telas e hooks.

---

Este documento consolida o escopo funcional do projeto em Markdown para execução via Codex.
