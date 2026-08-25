package com.techbank.desafiosistemacontratacaofuncionarios.controller;

import com.techbank.desafiosistemacontratacaofuncionarios.model.Funcionario;
import com.techbank.desafiosistemacontratacaofuncionarios.model.StatusFuncionario;
import com.techbank.desafiosistemacontratacaofuncionarios.service.FuncionarioService;
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

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Funcionario> listar(
            @RequestParam(name = "nome", required = false) String nome,
            @RequestParam(name = "cargo", required = false) String cargo,
            @RequestParam(name = "status", required = false) StatusFuncionario status) {
        return service.listar(nome, cargo, status);
    }

    @GetMapping("/{id}")
    public Funcionario buscarPorId(@PathVariable("id") Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Funcionario> cadastrar(@RequestBody Funcionario funcionario) {
        Funcionario cadastrado = service.cadastrar(funcionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastrado);
    }

    @PutMapping("/{id}")
    public Funcionario atualizarCompleto(@PathVariable("id") Long id,
                                         @RequestBody Funcionario dados) {
        return service.atualizarCompleto(id, dados);
    }

    @PatchMapping("/{id}")
    public Funcionario atualizarParcial(@PathVariable("id") Long id,
                                        @RequestBody Funcionario dados) {
        return service.atualizarParcial(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
