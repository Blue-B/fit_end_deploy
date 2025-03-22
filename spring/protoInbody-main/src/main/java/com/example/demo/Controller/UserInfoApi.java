package com.example.demo.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.demo.Service.UserInfoService;

import com.example.demo.DTO.UserInfoDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController // 회원정보 관련 컨트롤러 입니다
@RequestMapping("/userinfo")
@Tag(name = "User Info API", description = "회원 정보 관련 API")
public class UserInfoApi {

        @Autowired
        private UserInfoService UserInfoService;

        @Operation(summary = "회원가입", description = "사용자 정보를 받아 회원가입을 수행하고, 등록된 사용자 정보를 반환합니다.", responses = {
                        @ApiResponse(responseCode = "200", description = "회원가입 성공", content = @Content(schema = @Schema(implementation = UserInfoDTO.class))),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청")
        })
        @PostMapping("/register") // 회원가입 기능
        public UserInfoDTO registerUser(@RequestBody UserInfoDTO UserInfoDTO) {
                return UserInfoService.registerUser(UserInfoDTO);
        }

        @GetMapping("/mypage/{userid}") // 마이페이지
        public ResponseEntity<UserInfoDTO> mypage(@PathVariable String userid) {
                UserInfoDTO userInfoDTO = UserInfoService.myPage(userid);

                if (userInfoDTO == null) {
                        return ResponseEntity.notFound().build();
                }

                return ResponseEntity.ok(userInfoDTO);
        }

        @PostMapping("/checkUseridEmail") // userid, 이메일 중복 체크
        public ResponseEntity<?> checkUseridEmail(@RequestBody UserInfoDTO userInfoDTO) {
                try {
                        Map<String, Boolean> result = UserInfoService.checkUseridEmail(userInfoDTO);
                        return ResponseEntity.ok(result);
                } catch (Exception e) {
                        return ResponseEntity.badRequest().body("중복 체크 중 오류 발생: " + e.getMessage());
                }
        }

        @Operation(summary = "JWT 생성", description = "사용자 정보를 받아 API 토큰(JWT)을 생성하여 반환합니다.", responses = {
                        @ApiResponse(responseCode = "200", description = "JWT 생성 성공", content = @Content(schema = @Schema(implementation = String.class))),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청")
        })
        @PostMapping("/generation")
        public String generationJwt(@RequestBody UserInfoDTO UserInfoDTO) {

                return UserInfoService.generateAPiToken(UserInfoDTO);

        }

}
