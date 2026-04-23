# 🔗 Rastreabilidade — Requisitos Funcionais → Código

Mapeamento entre cada Requisito Funcional documentado no PI e sua implementação no frontend / backend.

| RF   | Descrição                                | Tela (Frontend)                 | Rota / Módulo (Backend)                     | Banco de Dados                 |
| ---- | ---------------------------------------- | ------------------------------- | ------------------------------------------- | ------------------------------ |
| RF01 | Cadastro de responsáveis                 | `RegisterScreen`                | `POST /api/auth/register` (tipo=responsavel)| tabela `Responsaveis`          |
| RF02 | Cadastro e login de crianças             | `RegisterScreen` / `LoginScreen`| `POST /api/auth/register`, `POST /api/auth/login` | tabelas `Usuarios`, `Contas` |
| RF03 | Validação de idade < 18                  | `RegisterScreen` + `validateAge`| `POST /api/auth/register` + trigger         | trigger `valida_idade`         |
| RF04 | Cofrinho virtual com saldo               | `CofrinhoScreen`                | `GET /api/contas/:id`                       | tabela `Contas`                |
| RF05 | Simular depósito/saque/transferência     | `CofrinhoScreen`                | `POST /api/transacoes`                      | tabela `Transacoes` + trigger  |
| RF06 | Bloquear saldo negativo                  | feedback na UI                  | validação em `transacoes.controller`        | trigger `valida_saldo`         |
| RF07 | Cadastro de metas                        | `MetasScreen`                   | `POST /api/metas`                           | tabela `Metas`                 |
| RF08 | Progresso visual de metas                | `MetasScreen` + `ProgressBar`   | `GET /api/metas/:usuarioId`                 | tabela `Metas`                 |
| RF09 | Pontos e conquistas                      | `ConquistasScreen`              | `GET /api/gamificacao/:usuarioId`           | tabelas `Gamificacao`, `Conquistas` |
| RF11 | Painel do responsável                    | `PainelResponsavelScreen`       | `GET /api/responsavel/*`                    | join `Responsaveis` ↔ `Usuarios` |
| RF13 | Histórico de transações                  | `HistoricoScreen`               | `GET /api/transacoes/:contaId`              | tabela `Transacoes`            |
| RF14 | Atualização automática de saldo          | `FinanceContext.refreshSaldo`   | trigger `atualiza_saldo` AFTER INSERT       | trigger em `Transacoes`        |
