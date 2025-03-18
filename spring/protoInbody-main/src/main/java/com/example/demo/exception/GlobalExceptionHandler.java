package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ModelAndView handleNotFoundException() {
        return new ModelAndView("redirect:/error/404");
    }

    @ExceptionHandler(Exception.class)
    public ModelAndView handleException() {
        return new ModelAndView("redirect:/error/500");
    }
}
