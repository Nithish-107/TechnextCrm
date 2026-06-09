package com.technext.crm.controller;

import com.technext.crm.model.Call;
import com.technext.crm.service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/calls")
@CrossOrigin(origins = "http://localhost:3000")
public class CallController {

    @Autowired
    private CallService callService;

    @GetMapping
    public List<Call> getAllCalls() {
        return callService.getAllCalls();
    }

    @GetMapping("/{id}")
    public Optional<Call> getCallById(@PathVariable Integer id) {
        return callService.getCallById(id);
    }

    @GetMapping("/type/{type}")
    public List<Call> getCallsByType(@PathVariable String type) {
        return callService.getCallsByType(type);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Call> getCallsByOwner(@PathVariable Integer ownerId) {
        return callService.getCallsByOwner(ownerId);
    }

    @PostMapping
    public Call createCall(@RequestBody Call call) {
        return callService.createCall(call);
    }

    @PutMapping("/{id}")
    public Call updateCall(@PathVariable Integer id, @RequestBody Call call) {
        return callService.updateCall(id, call);
    }

    @DeleteMapping("/{id}")
    public void deleteCall(@PathVariable Integer id) {
        callService.deleteCall(id);
    }
}