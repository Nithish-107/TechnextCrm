package com.technext.crm.repository;

import com.technext.crm.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Integer> {
    List<Meeting> findByOwnerId(Integer ownerId);
    List<Meeting> findByStatus(String status);
}