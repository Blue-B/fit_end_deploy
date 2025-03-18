package com.example.demo.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/error")
public class CustomErrorController {

    // 503 에러 처리 (서버 점검, 과부하 시)
    @GetMapping("/503")
    public RedirectView handle503() {
        return new RedirectView("/error/503");
    }
}
