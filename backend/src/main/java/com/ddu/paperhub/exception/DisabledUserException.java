package com.ddu.paperhub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class DisabledUserException extends RuntimeException {

    public DisabledUserException(String message) {
        super(message);
    }
}