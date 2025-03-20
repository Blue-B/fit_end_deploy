package com.example.demo.Service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.DTO.UserInfoDTO;

import com.example.demo.Entity.UserInfo;
import com.example.demo.Jwt.JwtUtil;
import com.example.demo.Repo.RepoUserInfo;
import com.example.demo.Service.Utile.ConversionService;

@Service
public class UserInfoService {
    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    private RepoUserInfo RepoUserInfo;

    @Autowired
    private ConversionService EntityConversionService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 회원가입 서비스
    public UserInfoDTO registerUser(UserInfoDTO userInfoDTO) {
        userInfoDTO.setPassword(passwordEncoder.encode(userInfoDTO.getPassword()));
        RepoUserInfo.save(EntityConversionService.convertToEntity(userInfoDTO, UserInfo.class));
        // generateAPiToken(userInfoDTO);
        return userInfoDTO;
    }

    public String generateAPiToken(UserInfoDTO UserInfoDTO) {
        UserInfo userInfo = RepoUserInfo.findByUserid(UserInfoDTO.getUserid());

        System.out.println("일단 확인 " + userInfo);
        if (userInfo == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        boolean isTokenExpired = true;

        if (userInfo.getJwt() != null) {
            try {
                isTokenExpired = jwtUtil.isTokenExpired(userInfo.getJwt());
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                // 토큰이 만료되었을 때 예외가 발생하면 여기서 처리
                System.out.println("토큰이 만료되었습니다: " + e.getMessage());
                isTokenExpired = true;
            } catch (Exception e) {
                // 기타 예외 처리
                System.out.println("토큰 검증 중 오류 발생: " + e.getMessage());
                isTokenExpired = true;
            }
        }

        if (userInfo.getJwt() == null || isTokenExpired) {
            String jwt = jwtUtil.generateToken(UserInfoDTO.getUserid(), 1);
            System.out.println(jwt + "갱신");
            userInfo.setJwt(jwt);
            RepoUserInfo.save(userInfo);
        }

        return userInfo.getJwt();

    }

}
