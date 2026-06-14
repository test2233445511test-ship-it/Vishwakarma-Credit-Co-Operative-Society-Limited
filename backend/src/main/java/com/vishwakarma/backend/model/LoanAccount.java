package com.vishwakarma.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "loan_accounts")
public class LoanAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String loanAccountNumber;

    @Column(nullable = false)
    private String loanType;

    @Column(nullable = false)
    private Double loanAmount;

    @Column(nullable = false)
    private Double interestRate;

    @Column(nullable = false)
    private Double emiAmount;

    @Column(nullable = false)
    private Double remainingBalance;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String loanStatus = "ACTIVE";

    @Column(nullable = false)
    private Integer remainingTenureMonths;

    @Column(nullable = false)
    private Double totalAmountPaid;

    @Column(nullable = false)
    private Double outstandingAmount;

    public LoanAccount() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getLoanAccountNumber() { return loanAccountNumber; }
    public void setLoanAccountNumber(String loanAccountNumber) { this.loanAccountNumber = loanAccountNumber; }
    public String getLoanType() { return loanType; }
    public void setLoanType(String loanType) { this.loanType = loanType; }
    public Double getLoanAmount() { return loanAmount; }
    public void setLoanAmount(Double loanAmount) { this.loanAmount = loanAmount; }
    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }
    public Double getEmiAmount() { return emiAmount; }
    public void setEmiAmount(Double emiAmount) { this.emiAmount = emiAmount; }
    public Double getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(Double remainingBalance) { this.remainingBalance = remainingBalance; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getLoanStatus() { return loanStatus; }
    public void setLoanStatus(String loanStatus) { this.loanStatus = loanStatus; }
    public Integer getRemainingTenureMonths() { return remainingTenureMonths; }
    public void setRemainingTenureMonths(Integer remainingTenureMonths) { this.remainingTenureMonths = remainingTenureMonths; }
    public Double getTotalAmountPaid() { return totalAmountPaid; }
    public void setTotalAmountPaid(Double totalAmountPaid) { this.totalAmountPaid = totalAmountPaid; }
    public Double getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(Double outstandingAmount) { this.outstandingAmount = outstandingAmount; }
}
