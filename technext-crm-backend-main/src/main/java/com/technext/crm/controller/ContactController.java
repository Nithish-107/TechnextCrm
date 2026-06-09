package com.technext.crm.controller;

import com.technext.crm.model.Contact;
import com.technext.crm.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    public List<Contact> getAllContacts() {
        return contactService.getAllContacts();
    }

    @GetMapping("/{id}")
    public Optional<Contact> getContactById(@PathVariable Integer id) {
        return contactService.getContactById(id);
    }

    @GetMapping("/type/{type}")
    public List<Contact> getContactsByType(@PathVariable String type) {
        return contactService.getContactsByType(type);
    }

    @GetMapping("/company/{company}")
    public List<Contact> getContactsByCompany(@PathVariable String company) {
        return contactService.getContactsByCompany(company);
    }

    @PostMapping
    public Contact createContact(@RequestBody Contact contact) {
        return contactService.createContact(contact);
    }

    @PutMapping("/{id}")
    public Contact updateContact(@PathVariable Integer id, @RequestBody Contact contact) {
        return contactService.updateContact(id, contact);
    }

    @DeleteMapping("/{id}")
    public void deleteContact(@PathVariable Integer id) {
        contactService.deleteContact(id);
    }
}