package com.technext.crm.repository;

import com.technext.crm.model.Call;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CallRepository extends JpaRepository<Call, Integer> {
    List<Call> findByOwnerId(Integer ownerId);
    List<Call> findByType(String type);
}