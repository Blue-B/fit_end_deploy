package com.example.demo.Controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DTO.UserBodyInfoDTO;
import com.example.demo.DTO.RawFoodDto.MetaDataDto;
import com.example.demo.DTO.RawFoodDto.NutrientDto;
import com.example.demo.DTO.RawFoodDto.RawFoodDto;
import com.example.demo.Entity.UserBodyInfo;
import com.example.demo.Entity.RawFood.RawFood;
import com.example.demo.Jwt.JwtUtil;
import com.example.demo.Repo.RawFoodSpecification;
import com.example.demo.Repo.RepoRawFood;
import com.example.demo.Repo.RepoUserBodyInfo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController // rest api 보내는 컨트롤러
@RequestMapping("/api")
public class TestApi {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RepoRawFood repoRawFood;

    @Autowired
    private RepoUserBodyInfo repoUserBodyInfo;

    // JWT 검증 및 예외 처리를 위한 공통 메소드
    private <T> ResponseEntity<Map<String, Object>> processJwtRequest(
            String jwt,
            Function<String, ResponseEntity<Map<String, Object>>> requestHandler) {

        try {
            String username = jwtUtil.extractUsername(jwt);
            if (username != null && jwtUtil.validateToken(jwt, username)) {
                return requestHandler.apply(username);
            } else {
                return createErrorResponse(401, "JWT 검증에 실패했습니다.");
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("error", "JWT 토큰이 만료되었습니다.");
            errorData.put("message", "재발급해주세요.");
            return ResponseEntity.status(403).body(errorData);
        } catch (Exception e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("error", "JWT 처리 중 오류가 발생했습니다.");
            errorData.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorData);
        }
    }

    // 오류 응답 생성 헬퍼 메소드
    private ResponseEntity<Map<String, Object>> createErrorResponse(int status, String errorMessage) {
        Map<String, Object> errorData = new HashMap<>();
        errorData.put("error", errorMessage);
        return ResponseEntity.status(status).body(errorData);
    }

    // 페이징 처리 헬퍼 메소드
    private <T> List<T> applyPagination(List<T> items, int pageNo, int numOfRows) {
        int start = (pageNo - 1) * numOfRows;
        int end = Math.min(start + numOfRows, items.size());
        return items.subList(start, end);
    }

    @GetMapping("/data") // 음식 데이터 보내는거
    @Operation(summary = "RawFood 데이터 조회", description = "JWT를 검증한 후 조건에 맞는 RawFood 데이터를 검색 및 페이징 처리하여 반환합니다.", responses = {
            @ApiResponse(responseCode = "200", description = "데이터 조회 성공", content = @Content(schema = @Schema(implementation = RawFood.class))),
            @ApiResponse(responseCode = "401", description = "JWT 검증 실패", content = @Content),
            @ApiResponse(responseCode = "403", description = "JWT 만료", content = @Content),
            @ApiResponse(responseCode = "404", description = "검색 결과가 없음", content = @Content)
    })
    public ResponseEntity<Map<String, Object>> getData(
            @Parameter(description = "JWT 토큰", example = "your.jwt.token") @RequestParam("jwt") String jwt,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam("pageNo") int pageNo,
            @Parameter(description = "한 페이지당 행 수", example = "10") @RequestParam("numOfRows") int numOfRows,
            @ModelAttribute RawFoodDto rawFoodDto,
            @ModelAttribute NutrientDto nutrientDto,
            @ModelAttribute MetaDataDto metaDataDto) {

        return processJwtRequest(jwt, username -> {
            // 데이터 조회
            List<RawFood> rawFoods = repoRawFood
                    .findAll(RawFoodSpecification.getRawFoodSpecification(rawFoodDto, nutrientDto, metaDataDto));

            if (rawFoods.isEmpty()) {
                Map<String, Object> noData = new HashMap<>();
                noData.put("message", "검색 결과가 없습니다.");
                return ResponseEntity.status(404).body(noData);
            }

            // 페이징 적용
            List<RawFood> paginatedRawFoods = applyPagination(rawFoods, pageNo, numOfRows);

            // 응답 데이터 생성
            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("rawFoods", paginatedRawFoods);

            return ResponseEntity.ok(data);
        });
    }

    @GetMapping("/body") // 신체 데이터 보내는거
    @Operation(summary = "User Body Info 데이터 조회", description = "JWT를 검증한 후 조건에 맞는 사용자 신체 정보 데이터를 검색 및 페이징 처리하여 반환합니다.", responses = {
            @ApiResponse(responseCode = "200", description = "데이터 조회 성공", content = @Content(schema = @Schema(implementation = UserBodyInfoDTO.class))),
            @ApiResponse(responseCode = "401", description = "JWT 검증 실패", content = @Content),
            @ApiResponse(responseCode = "403", description = "JWT 만료", content = @Content),
            @ApiResponse(responseCode = "404", description = "검색 결과가 없음", content = @Content)
    })
    public ResponseEntity<Map<String, Object>> getBodyData(
            @Parameter(description = "JWT 토큰", example = "your.jwt.token") @RequestParam("jwt") String jwt,
            @Parameter(description = "페이지 번호", example = "1") @RequestParam("pageNo") int pageNo,
            @Parameter(description = "한 페이지당 행 수", example = "10") @RequestParam("numOfRows") int numOfRows,
            @ModelAttribute UserBodyInfoDTO userBodyInfoDTO) {

        return processJwtRequest(jwt, username -> {
            // 조건에 따른 데이터 조회
            List<UserBodyInfo> userBodyInfo = getUserBodyInfoByFilters(userBodyInfoDTO);

            if (userBodyInfo.isEmpty()) {
                Map<String, Object> noData = new HashMap<>();
                noData.put("message", "검색 결과가 없습니다.");
                return ResponseEntity.status(404).body(noData);
            }

            // 페이징 적용
            List<UserBodyInfo> paginatedUserBodyInfo = applyPagination(userBodyInfo, pageNo, numOfRows);

            // DTO 변환
            List<UserBodyInfoDTO> userBodyInfoDTOs = paginatedUserBodyInfo.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            // 응답 데이터 생성
            Map<String, Object> data = new HashMap<>();
            data.put("username", username);
            data.put("userBodyInfo", userBodyInfoDTOs);

            return ResponseEntity.ok(data);
        });
    }

    // UserBodyInfo 필터링 로직 분리
    private List<UserBodyInfo> getUserBodyInfoByFilters(UserBodyInfoDTO filters) {
        if (filters.getAge() != 0 && filters.getSex() != 0) {
            return repoUserBodyInfo.findLatestUserBodyInfoByAgeAndSex(
                    filters.getAge(), filters.getSex());
        } else if (filters.getAge() != 0) {
            return repoUserBodyInfo.findLatestUserBodyInfoByAge(filters.getAge());
        } else if (filters.getSex() != 0) {
            return repoUserBodyInfo.findLatestUserBodyInfoBySex(filters.getSex());
        } else {
            return new ArrayList<>();
        }
    }

    // UserBodyInfo를 DTO로 변환하는 메소드
    private UserBodyInfoDTO convertToDTO(UserBodyInfo info) {
        return new UserBodyInfoDTO(
                info.getHeight(),
                info.getWeight(),
                info.getFatpercentage(),
                info.getLeanmass(),
                info.getBmi(),
                info.getInbodyScore(),
                info.getSex(),
                info.getAge(),
                info.getFatMass());
    }
}