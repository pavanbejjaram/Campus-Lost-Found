package com.college.lostfound.repository;

import com.college.lostfound.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByClaimerId(Long claimerId);
    List<Claim> findByItemReporterId(Long reporterId);
    boolean existsByItemIdAndClaimerId(Long itemId, Long claimerId);
}
