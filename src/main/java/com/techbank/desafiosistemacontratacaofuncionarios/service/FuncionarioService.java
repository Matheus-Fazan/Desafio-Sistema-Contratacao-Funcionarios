package com.techbank.desafiosistemacontratacaofuncionarios.service;

import com.techbank.desafiosistemacontratacaofuncionarios.exception.FuncionarioNaoEncontradoException;
import com.techbank.desafiosistemacontratacaofuncionarios.exception.FuncionarioValidationException;
import com.techbank.desafiosistemacontratacaofuncionarios.model.Funcionario;
import com.techbank.desafiosistemacontratacaofuncionarios.model.StatusFuncionario;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private final ArrayList<Funcionario> funcionarios = new ArrayList<>();
    private long proximoId = 1;

    public FuncionarioService() {
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

    public List<Funcionario> listar(String nome, String cargo, StatusFuncionario status) {
        return funcionarios.stream()
                .filter(funcionario -> corresponde(funcionario.getNome(), nome))
                .filter(funcionario -> corresponde(funcionario.getCargo(), cargo))
                .filter(funcionario -> status == null || funcionario.getStatus() == status)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public Funcionario buscarPorId(Long id) {
        return encontrar(id);
    }

    public Funcionario cadastrar(Funcionario funcionario) {
        validarObrigatorios(funcionario);

        funcionario.setId(proximoId++);
        if (funcionario.getStatus() == null) {
            funcionario.setStatus(StatusFuncionario.EM_ANALISE);
        }
        funcionarios.add(funcionario);
        return funcionario;
    }

    public Funcionario atualizarCompleto(Long id, Funcionario dados) {
        int indice = indiceDoFuncionario(id);
        validarObrigatorios(dados);

        dados.setId(id);
        if (dados.getStatus() == null) {
            dados.setStatus(StatusFuncionario.EM_ANALISE);
        }
        funcionarios.set(indice, dados);
        return dados;
    }

    public Funcionario atualizarParcial(Long id, Funcionario dados) {
        Funcionario funcionario = encontrar(id);
        if (dados == null) {
            throw new FuncionarioValidationException("Informe ao menos um campo para atualizar.");
        }

        if (dados.getCargo() != null) {
            if (dados.getCargo().isBlank()) {
                throw new FuncionarioValidationException("O cargo não pode ficar vazio.");
            }
            funcionario.setCargo(dados.getCargo());
        }
        if (dados.getSalario() != null) {
            funcionario.setSalario(dados.getSalario());
        }
        if (dados.getStatus() != null) {
            funcionario.setStatus(dados.getStatus());
        }
        return funcionario;
    }

    public void excluir(Long id) {
        funcionarios.remove(indiceDoFuncionario(id));
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
                .orElseThrow(() -> new FuncionarioNaoEncontradoException(id));
    }

    private int indiceDoFuncionario(Long id) {
        for (int i = 0; i < funcionarios.size(); i++) {
            if (funcionarios.get(i).getId().equals(id)) {
                return i;
            }
        }
        throw new FuncionarioNaoEncontradoException(id);
    }

    private void validarObrigatorios(Funcionario funcionario) {
        if (funcionario == null || funcionario.getNome() == null || funcionario.getNome().isBlank()) {
            throw new FuncionarioValidationException("O nome é obrigatório.");
        }
        if (funcionario.getEmail() == null || funcionario.getEmail().isBlank()) {
            throw new FuncionarioValidationException("O e-mail é obrigatório.");
        }
        if (funcionario.getCargo() == null || funcionario.getCargo().isBlank()) {
            throw new FuncionarioValidationException("O cargo é obrigatório.");
        }
    }

    private boolean corresponde(String valor, String filtro) {
        return filtro == null || filtro.isBlank()
                || valor.toLowerCase(Locale.ROOT).contains(filtro.toLowerCase(Locale.ROOT));
    }
}
