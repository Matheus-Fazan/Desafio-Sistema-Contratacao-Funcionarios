# Sistema de Contratação de Funcionários

Painel web simples para acompanhar candidatos de um processo de contratação.

## Tecnologias

- Java 17 e Spring Boot
- Thymeleaf para renderizar a página
- Tailwind CSS via CDN
- JavaScript puro e Fetch API para as interações da tela

## Executar

É necessário ter Java 17 ou superior instalado.

```bash
./mvnw spring-boot:run
```

Depois, acesse <http://localhost:8080>.

## Interface

A tela já contém busca por nome, cargo ou ID, filtro por status, indicadores, cadastro, edição completa, atualização parcial e exclusão.

O front espera a API REST em `/funcionarios`, usando `GET`, `POST`, `PUT`, `PATCH` e `DELETE` conforme o desafio.
