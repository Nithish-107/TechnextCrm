package com.technext.crm.repository;

import com.technext.crm.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByChannelOrderByCreatedAtAsc(String channel);
    List<Message> findBySenderIdOrReceiverIdOrderByCreatedAtAsc(Integer senderId, Integer receiverId);
    
    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.createdAt ASC")
    List<Message> findDirectMessages(@Param("user1") Integer user1, @Param("user2") Integer user2);
    
    List<Message> findByReceiverIdAndIsReadFalse(Integer receiverId);
    List<Message> findByChannelAndIsReadFalse(String channel);
}