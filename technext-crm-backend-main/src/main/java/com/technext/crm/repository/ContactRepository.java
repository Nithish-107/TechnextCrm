package com.technext.crm.repository;

import com.technext.crm.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Integer> {
    List<Contact> findByType(String type);
    List<Contact> findByCompany(String company);
}