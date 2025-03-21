package com.example.demo.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.Entity.UserBodyInfo;

public interface RepoUserBodyInfo extends JpaRepository<UserBodyInfo, Long> {
    // 디비랑 연결되는거 여기에 자체적인 쿼리문 작성가능해요

    List<UserBodyInfo> findTop5ByUserInfo_UseridOrderByDateDesc(String userid);

    List<UserBodyInfo> findByAge(int age);

    // rest api 쪽 쿼리
    @Query("SELECT u FROM UserBodyInfo u WHERE u.age = :age AND u.date = (SELECT MAX(u2.date) FROM UserBodyInfo u2 WHERE u2.userInfo.userid = u.userInfo.userid AND u2.age = :age)")
    List<UserBodyInfo> findLatestUserBodyInfoByAge(int age);

    @Query("SELECT u FROM UserBodyInfo u WHERE u.age = :age AND u.sex = :sex AND u.date = (SELECT MAX(u2.date) FROM UserBodyInfo u2 WHERE u2.userInfo.userid = u.userInfo.userid AND u2.age = :age AND u2.sex = :sex)")
    List<UserBodyInfo> findLatestUserBodyInfoByAgeAndSex(int age, int sex);

    @Query("SELECT u FROM UserBodyInfo u WHERE u.sex = :sex AND u.date = (SELECT MAX(u2.date) FROM UserBodyInfo u2 WHERE u2.userInfo.userid = u.userInfo.userid AND u2.sex = :sex)")
    List<UserBodyInfo> findLatestUserBodyInfoBySex(int sex);

    // 랭킹 스코어 쿼리
    @Query("SELECT ubi FROM UserBodyInfo ubi WHERE ubi.sex = 1 AND ubi.age = :age AND ubi.userInfo.userid NOT IN (SELECT ubi2.userInfo.userid FROM UserBodyInfo ubi2 WHERE ubi2.sex = 1 AND ubi2.date > ubi.date) ORDER BY ubi.inbodyScore DESC")
    List<UserBodyInfo> findLatestMaleScores(@Param("age") int age);

    @Query("SELECT ubi FROM UserBodyInfo ubi WHERE ubi.sex = 2 AND ubi.age = :age AND ubi.userInfo.userid NOT IN (SELECT ubi2.userInfo.userid FROM UserBodyInfo ubi2 WHERE ubi2.sex = 2 AND ubi2.date > ubi.date) ORDER BY ubi.inbodyScore DESC")
    List<UserBodyInfo> findLatestFemaleScores(@Param("age") int age);

    UserBodyInfo findFirstByUserInfo_UseridOrderByDate(String userid);
}
