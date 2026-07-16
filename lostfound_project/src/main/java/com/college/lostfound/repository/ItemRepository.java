package com.college.lostfound.repository;

import com.college.lostfound.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByStatus(String status);
    List<Item> findByReporterId(Long reporterId);
    List<Item> findByStatusAndType(String status, String type);
    List<Item> findByStatusAndCategory(String status, String category);
    List<Item> findByStatusAndTypeAndCategory(String status, String type, String category);
}
