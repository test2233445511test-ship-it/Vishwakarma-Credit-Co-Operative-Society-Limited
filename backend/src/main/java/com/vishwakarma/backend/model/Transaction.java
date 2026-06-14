package com.vishwakarma.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, unique = true)
    private String transactionId;

    @Column(nullable = false)
    private String description;

    @Column
    private Double creditAmount;

    @Column
    private Double debitAmount;

    @Column(nullable = false)
    private Double balanceAfterTransaction;

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getCreditAmount() { return creditAmount; }
    public void setCreditAmount(Double creditAmount) { this.creditAmount = creditAmount; }
    public Double getDebitAmount() { return debitAmount; }
    public void setDebitAmount(Double debitAmount) { this.debitAmount = debitAmount; }
    public Double getBalanceAfterTransaction() { return balanceAfterTransaction; }
    public void setBalanceAfterTransaction(Double balanceAfterTransaction) { this.balanceAfterTransaction = balanceAfterTransaction; }
}
