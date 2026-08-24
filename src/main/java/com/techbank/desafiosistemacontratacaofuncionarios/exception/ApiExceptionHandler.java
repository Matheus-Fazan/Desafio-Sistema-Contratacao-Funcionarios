package com.techbank.desafiosistemacontratacaofuncionarios.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(FuncionarioNaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> tratarNaoEncontrado(FuncionarioNaoEncontradoException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensagem", exception.getMessage()));
    }

    @ExceptionHandler(FuncionarioValidationException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(FuncionarioValidationException exception) {
        return ResponseEntity.badRequest()
                .body(Map.of("mensagem", exception.getMessage()));
    }
}
