# Regras de Domínio

> [!NOTE]
> Esta documentação foca em regras específicas. Para uma visão completa do modelo de domínio, consulte a [Especificação de Domínio](DOMAIN_SPECIFICATION.md).

## Missing Person
- Cadastro mínimo: `personName` + `lastSeenLocation`.
- `lat`/`lng` são opcionais, mas recomendados para mapa.
- Campos ausentes de contato/cidade podem receber default de plataforma.

## Alertas
- Alertas podem vir de feed CAP, RSS ou Atom.
- Normalização para schema interno único é obrigatória.

## Controle de Acesso
- O Dashboard Tático (`/app/sos`) é restrito exclusivamente ao perfil `admin`.
- Usuários sem a role `admin` são redirecionados automaticamente para o mapa público.
