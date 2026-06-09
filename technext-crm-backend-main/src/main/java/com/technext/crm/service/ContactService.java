package com.technext.crm.service;

import com.technext.crm.model.Contact;
import com.technext.crm.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }

    public Optional<Contact> getContactById(Integer id) {
        return contactRepository.findById(id);
    }

    public List<Contact> getContactsByType(String type) {
        return contactRepository.findByType(type);
    }

    public List<Contact> getContactsByCompany(String company) {
        return contactRepository.findByCompany(company);
    }

    public Contact createContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public Contact updateContact(Integer id, Contact contact) {
        contact.setId(id);
        return contactRepository.save(contact);
    }

    public void deleteContact(Integer id) {
        contactRepository.deleteById(id);
    }
}