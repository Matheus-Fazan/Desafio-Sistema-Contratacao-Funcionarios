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

## Endpoints

- `GET /funcionarios` lista os funcionários. Também aceita `nome`, `cargo` e `status` como filtros.
- `GET /funcionarios/{id}` consulta um funcionário pelo ID.
- `POST /funcionarios` cadastra um funcionário. `nome`, `email` e `cargo` são obrigatórios.
- `PUT /funcionarios/{id}` substitui todos os dados do funcionário.
- `PATCH /funcionarios/{id}` altera apenas `cargo`, `salario` e `status` enviados no corpo.
- `DELETE /funcionarios/{id}` exclui um funcionário.

Os dados ficam somente em memória, em uma `ArrayList<Funcionario>`, e são perdidos quando a aplicação é reiniciada.

## Organização do código

- `controller`: recebe as requisições HTTP e encaminha as operações.
- `service`: concentra o CRUD, as validações e a `ArrayList<Funcionario>`.
- `model`: contém `Funcionario` e os status possíveis.
- `exception`: padroniza as respostas de erro da API.
