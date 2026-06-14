package com.vishwakarma.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_deposits")
public class RecurringDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String rdAccountNumber;

    @Column(nullable = false)
    private Double monthlyDepositAmount;

    @Column(nullable = false)
    private LocalDate depositDate; // Account open date

    @Column(nullable = false)
    private LocalDate maturityDate;

    @Column(nullable = false)
    private Double currentBalance;

    @Column(nullable = false)
    private Double totalDepositedAmount;

    @Column(nullable = false)
    private Double maturityAmount;

    @Column(nullable = false)
    private String status = "ACTIVE";

    // Constructors, Getters, Setters
    public RecurringDeposit() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getRdAccountNumber() { return rdAccountNumber; }
    public void setRdAccountNumber(String rdAccountNumber) { this.rdAccountNumber = rdAccountNumber; }
    public Double getMonthlyDepositAmount() { return monthlyDepositAmount; }
    public void setMonthlyDepositAmount(Double monthlyDepositAmount) { this.monthlyDepositAmount = monthlyDepositAmount; }
    public LocalDate getDepositDate() { return depositDate; }
    public void setDepositDate(LocalDate depositDate) { this.depositDate = depositDate; }
    public LocalDate getMaturityDate() { return maturityDate; }
    public void setMaturityDate(LocalDate maturityDate) { this.maturityDate = maturityDate; }
    public Double getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(Double currentBalance) { this.currentBalance = currentBalance; }
    public Double getTotalDepositedAmount() { return totalDepositedAmount; }
    public void setTotalDepositedAmount(Double totalDepositedAmount) { this.totalDepositedAmount = totalDepositedAmount; }
    public Double getMaturityAmount() { return maturityAmount; }
    public void setMaturityAmount(Double maturityAmount) { this.maturityAmount = maturityAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
