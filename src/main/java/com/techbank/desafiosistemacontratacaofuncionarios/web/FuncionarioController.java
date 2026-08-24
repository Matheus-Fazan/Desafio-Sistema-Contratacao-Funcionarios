package com.techbank.desafiosistemacontratacaofuncionarios.web;

import com.techbank.desafiosistemacontratacaofuncionarios.model.Funcionario;
import com.techbank.desafiosistemacontratacaofuncionarios.model.StatusFuncionario;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final ArrayList<Funcionario> funcionarios = new ArrayList<>();
    private long proximoId = 1;

    public FuncionarioController() {
        adicionarExemplo("Ana Souza", "ana@picpay.com", "(11) 99999-1111", "Product Designer",
                "Produto", new BigDecimal("6500.00"), "São Paulo", StatusFuncionario.EM_ANALISE);
        adicionarExemplo("Bruno Lima", "bruno@picpay.com", "(11) 99999-2222", "Desenvolvedor Java",
                "Tecnologia", new BigDecimal("8200.00"), "São Paulo", StatusFuncionario.APROVADO);
        adicionarExemplo("Carla Mendes", "carla@picpay.com", "(21) 99999-3333", "Analista de RH",
                "Pessoas", new BigDecimal("5800.00"), "Rio de Janeiro", StatusFuncionario.CONTRATADO);
        adicionarExemplo("Diego Alves", "diego@picpay.com", "(31) 99999-4444", "UX Designer",
                "Design", new BigDecimal("6100.00"), "Belo Horizonte", StatusFuncionario.REPROVADO);
        adicionarExemplo("Elisa Rocha", "elisa@picpay.com", "(11) 99999-5555", "Analista de Marketing",
                "Marketing", new BigDecimal("5400.00"), "São Paulo", StatusFuncionario.EM_ANALISE);
    }

    @GetMapping
    public ArrayList<Funcionario> listar(
            @RequestParam(name = "nome", required = false) String nome,
            @RequestParam(name = "cargo", required = false) String cargo,
            @RequestParam(name = "status", required = false) StatusFuncionario status) {
        return funcionarios.stream()
                .filter(funcionario -> corresponde(funcionario.getNome(), nome))
                .filter(funcionario -> corresponde(funcionario.getCargo(), cargo))
                .filter(funcionario -> status == null || funcionario.getStatus() == status)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable("id") Long id) {
        Funcionario funcionario = encontrar(id);
        if (funcionario == null) {
            return respostaNaoEncontrado(id);
        }
        return ResponseEntity.ok(funcionario);
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Funcionario funcionario) {
        String erro = validarObrigatorios(funcionario);
        if (erro != null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", erro));
        }

        funcionario.setId(proximoId++);
        if (funcionario.getStatus() == null) {
            funcionario.setStatus(StatusFuncionario.EM_ANALISE);
        }
        funcionarios.add(funcionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(funcionario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarCompleto(@PathVariable("id") Long id,
                                               @RequestBody Funcionario dados) {
        int indice = indiceDoFuncionario(id);
        if (indice < 0) {
            return respostaNaoEncontrado(id);
        }

        String erro = validarObrigatorios(dados);
        if (erro != null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", erro));
        }

        dados.setId(id);
        if (dados.getStatus() == null) {
            dados.setStatus(StatusFuncionario.EM_ANALISE);
        }
        funcionarios.set(indice, dados);
        return ResponseEntity.ok(dados);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> atualizarParcial(@PathVariable("id") Long id,
                                              @RequestBody Funcionario dados) {
        Funcionario funcionario = encontrar(id);
        if (funcionario == null) {
            return respostaNaoEncontrado(id);
        }
        if (dados == null) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Informe ao menos um campo para atualizar."));
        }

        if (dados.getCargo() != null) {
            if (dados.getCargo().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("mensagem", "O cargo não pode ficar vazio."));
            }
            funcionario.setCargo(dados.getCargo());
        }
        if (dados.getSalario() != null) {
            funcionario.setSalario(dados.getSalario());
        }
        if (dados.getStatus() != null) {
            funcionario.setStatus(dados.getStatus());
        }

        return ResponseEntity.ok(funcionario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable("id") Long id) {
        int indice = indiceDoFuncionario(id);
        if (indice < 0) {
            return respostaNaoEncontrado(id);
        }

        funcionarios.remove(indice);
        return ResponseEntity.noContent().build();
    }

    private void adicionarExemplo(String nome, String email, String telefone, String cargo,
                                  String departamento, BigDecimal salario, String cidade,
                                  StatusFuncionario status) {
        funcionarios.add(new Funcionario(proximoId++, nome, email, telefone, cargo, departamento,
                salario, cidade, status));
    }

    private Funcionario encontrar(Long id) {
        return funcionarios.stream()
                .filter(funcionario -> funcionario.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    private int indiceDoFuncionario(Long id) {
        for (int i = 0; i < funcionarios.size(); i++) {
            if (funcionarios.get(i).getId().equals(id)) {
                return i;
            }
        }
        return -1;
    }

    private String validarObrigatorios(Funcionario funcionario) {
        if (funcionario == null || funcionario.getNome() == null || funcionario.getNome().isBlank()) {
            return "O nome é obrigatório.";
        }
        if (funcionario.getEmail() == null || funcionario.getEmail().isBlank()) {
            return "O e-mail é obrigatório.";
        }
        if (funcionario.getCargo() == null || funcionario.getCargo().isBlank()) {
            return "O cargo é obrigatório.";
        }
        return null;
    }

    private boolean corresponde(String valor, String filtro) {
        return filtro == null || filtro.isBlank()
                || valor.toLowerCase().contains(filtro.toLowerCase());
    }

    private ResponseEntity<Map<String, String>> respostaNaoEncontrado(Long id) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensagem", "Funcionário de ID " + id + " não foi encontrado."));
    }
}
