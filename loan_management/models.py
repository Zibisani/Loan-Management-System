from django.db import models
from django.conf import settings
from user_management.models import CustomUser
# Create your models here.


class LoanApplication(models.Model):
    STATUS_CHOICES = (
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    applicationID = models.AutoField(primary_key=True)
    username = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    durationOfLoan = models.IntegerField()
    purpose = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    applicationDate = models.DateField(auto_now_add=True)
    approvalDate = models.DateField(null=True, blank=True)
    amount = models.IntegerField()

    def __str__(self):
        return f"LoanApplication {self.applicationID} - {self.username}"

class Loan(models.Model):
    
    STATUS_CHOICES = [
        ('Ongoing', 'Ongoing'),
        ('Fully Paid', 'Fully Paid'),
        ('Overdue', 'Overdue'),
        ('Defaulted', 'Defaulted'),
    ]

    loanID = models.AutoField(primary_key=True)
    application = models.OneToOneField(LoanApplication, on_delete=models.CASCADE)
    username = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount = models.IntegerField()
    durationOfLoan = models.IntegerField()
    purpose = models.CharField(max_length=255)
    interest_rate = models.FloatField()
    approvalDate = models.DateField(auto_now_add=True)
    repayment_schedule = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Ongoing')
    outstanding_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f'{self.username} - {self.amount}'

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('ID Proof', 'ID Proof'),
        ('Income Proof', 'Income Proof'),
        # Add more document types as needed
    ]
    
    documentID = models.AutoField(primary_key=True)
    application = models.ForeignKey(LoanApplication, on_delete=models.CASCADE)
    documentType = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    documentPath = models.FileField(upload_to='documents/')
    
    def __str__(self):
        return f'{self.documentType} for {self.application}'


class Payment(models.Model):
    paymentID = models.AutoField(primary_key=True)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE)
    paymentDate = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'Payment of {self.amount} for loan {self.loan.loanID}'