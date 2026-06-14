package com.vishwakarma.backend.controller;

import com.vishwakarma.backend.model.*;
import com.vishwakarma.backend.repository.*;
import com.vishwakarma.backend.security.annotation.AuditLog;
import com.vishwakarma.backend.security.annotation.RequirePermission;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final UserRepository userRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final RecurringDepositRepository recurringDepositRepository;
    private final LoanAccountRepository loanAccountRepository;
    private final TransactionRepository transactionRepository;

    public CustomerController(UserRepository userRepository, FixedDepositRepository fixedDepositRepository,
                              RecurringDepositRepository recurringDepositRepository,
                              LoanAccountRepository loanAccountRepository,
                              TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.fixedDepositRepository = fixedDepositRepository;
        this.recurringDepositRepository = recurringDepositRepository;
        this.loanAccountRepository = loanAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not authenticated"));
    }

    @GetMapping("/dashboard-data")
    @RequirePermission("account.view")
    public ResponseEntity<?> getDashboardData() {
        User user = getAuthenticatedUser();

        List<FixedDeposit> fds = fixedDepositRepository.findByUserId(user.getId());
        List<RecurringDeposit> rds = recurringDepositRepository.findByUserId(user.getId());
        List<LoanAccount> loans = loanAccountRepository.findByUserId(user.getId());
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("accountDetails", user);
        response.put("fixedDeposits", fds);
        response.put("recurringDeposits", rds);
        response.put("loans", loans);
        response.put("transactions", transactions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @RequirePermission("account.view")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(getAuthenticatedUser());
    }

    @PutMapping("/profile")
    @RequirePermission("account.view")
    @AuditLog(action = "UPDATE_PROFILE", resource = "USER")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();

        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("address")) user.setAddress(body.get("address"));
        if (body.containsKey("city")) user.setCity(body.get("city"));
        if (body.containsKey("state")) user.setState(body.get("state"));
        if (body.containsKey("pinCode")) user.setPinCode(body.get("pinCode"));
        if (body.containsKey("occupation")) user.setOccupation(body.get("occupation"));

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
