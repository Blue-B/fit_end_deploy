package com.example.demo.exception;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.NoHandlerFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ModelAndView handleNotFoundException(HttpServletRequest request) {
        String host = request.getServerName();
        return new ModelAndView("redirect:http://" + host + ":3000/error/404");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ModelAndView handleExpiredJwtException(HttpServletRequest request, ExpiredJwtException ex) {
        String host = request.getServerName();
        // 만료된 토큰은 로그인 페이지로 리다이렉트하도록 설정
        return new ModelAndView("redirect:http://" + host + ":3000/login?error=tokenExpired");
    }

    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(HttpServletRequest request, Exception ex) {
        ex.printStackTrace();
        String host = request.getServerName();
        return new ModelAndView("redirect:http://" + host + ":3000/error/500");
    }
}
