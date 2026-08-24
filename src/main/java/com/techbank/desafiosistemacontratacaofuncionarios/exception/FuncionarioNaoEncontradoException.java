package com.techbank.desafiosistemacontratacaofuncionarios.exception;

public class FuncionarioNaoEncontradoException extends RuntimeException {

    public FuncionarioNaoEncontradoException(Long id) {
        super("Funcionário de ID " + id + " não foi encontrado.");
    }
}
