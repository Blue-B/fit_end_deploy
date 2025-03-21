package com.example.demo.Service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.DTO.UserInfoDTO;

import com.example.demo.Entity.UserInfo;
import com.example.demo.Jwt.JwtUtil;
import com.example.demo.Repo.RepoUserInfo;
import com.example.demo.Service.Utile.ConversionService;

@Service // 유저 정보기반 서비스
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

    // 중복체크
    public Map<String, Boolean> checkUseridEmail(UserInfoDTO userInfoDTO) {
        Map<String, Boolean> result = new HashMap<>();

        // 아이디 중복 체크
        boolean isUseridExists = false;
        if (userInfoDTO.getUserid() != null && !userInfoDTO.getUserid().isEmpty()) {
            isUseridExists = RepoUserInfo.existsByUserid(userInfoDTO.getUserid());
        }

        // 이메일 중복 체크
        boolean isEmailExists = false;
        if (userInfoDTO.getEmail() != null && !userInfoDTO.getEmail().isEmpty()) {
            isEmailExists = RepoUserInfo.existsByEmail(userInfoDTO.getEmail());
        }

        result.put("isUseridExists", isUseridExists);
        result.put("isEmailExists", isEmailExists);

        return result;
    }

    public String generateAPiToken(UserInfoDTO UserInfoDTO) {
        UserInfo userInfo = RepoUserInfo.findByUserid(UserInfoDTO.getUserid());

        System.out.println("일단 확인 " + userInfo);
        if (userInfo == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        boolean isTokenExpired = false;

        if (userInfo.getJwt() != null && !userInfo.getJwt().isEmpty()) {
            try {
                Date issuedAt = jwtUtil.getIssuedAtDateFromToken(userInfo.getJwt());
                Date expirationDate = jwtUtil.getExpirationDateFromToken(userInfo.getJwt());

                System.out.println("토큰 생성 시간: " + issuedAt);
                System.out.println("토큰 만료 시간: " + expirationDate);

                isTokenExpired = jwtUtil.isTokenExpired(userInfo.getJwt());
                System.out.println("토큰 만료 여부: " + isTokenExpired);
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
            String jwt = jwtUtil.generateToken(UserInfoDTO.getUserid(), 24);
            System.out.println(jwt + "갱신");
            userInfo.setJwt(jwt);
            RepoUserInfo.save(userInfo);
        }

        return userInfo.getJwt();

    }

}