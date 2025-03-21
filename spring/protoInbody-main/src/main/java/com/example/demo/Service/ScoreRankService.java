package com.example.demo.Service;

import com.example.demo.Repo.RepoUserBodyInfo;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.DTO.UserBodyInfoDTO;
import com.example.demo.Entity.UserBodyInfo;

@Service
public class ScoreRankService {

    @Autowired
    private RepoUserBodyInfo RepoUserBodyInfo;

    // 남성쪽 점수랭킹
    public List<UserBodyInfoDTO> showRankMale1(int age) {
        System.out.println(age);
        List<UserBodyInfo> UserBodyInfo = RepoUserBodyInfo.findLatestMaleScores(age);
        return UserBodyInfo.stream()
                .map(userBodyInfo -> new UserBodyInfoDTO(userBodyInfo))
                .collect(Collectors.toList());
    }

    // 여성쪽 점수랭킹
    public List<UserBodyInfoDTO> showRankFemale(int age) {
        System.out.println(age);

        List<UserBodyInfo> UserBodyInfo = RepoUserBodyInfo.findLatestFemaleScores(age);
        return UserBodyInfo.stream()
                .map(userBodyInfo -> new UserBodyInfoDTO(userBodyInfo))
                .collect(Collectors.toList());
    }

}