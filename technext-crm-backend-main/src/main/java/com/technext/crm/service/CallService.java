package com.technext.crm.service;

import com.technext.crm.model.Call;
import com.technext.crm.repository.CallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CallService {

    @Autowired
    private CallRepository callRepository;

    public List<Call> getAllCalls() {
        return callRepository.findAll();
    }

    public Optional<Call> getCallById(Integer id) {
        return callRepository.findById(id);
    }

    public List<Call> getCallsByType(String type) {
        return callRepository.findByType(type);
    }

    public List<Call> getCallsByOwner(Integer ownerId) {
        return callRepository.findByOwnerId(ownerId);
    }

    public Call createCall(Call call) {
        return callRepository.save(call);
    }

    public Call updateCall(Integer id, Call call) {
        call.setId(id);
        return callRepository.save(call);
    }

    public void deleteCall(Integer id) {
        callRepository.deleteById(id);
    }
}