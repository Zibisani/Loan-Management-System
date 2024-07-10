# loan_management/serializers.py

from rest_framework import serializers
from .models import LoanApplication, Loan, Payment
from user_management.models import CustomUser






class LoanApplicationSerializer(serializers.ModelSerializer):
    username = serializers.SlugRelatedField(slug_field='username', queryset=CustomUser.objects.all())
   
    class Meta:
        model = LoanApplication
        fields = ['username', 'durationOfLoan', 'purpose', 'amount', 'applicationID', 'status', 'applicationDate', 'approvalDate' ]

    def validate(self, data):
        username = data.get('username')
        if LoanApplication.objects.filter(username=username, status__in=['Submitted', 'Under Review']).exists():
            raise serializers.ValidationError("You cannot submit another loan application while an existing application is under review or submitted.")
        if Loan.objects.filter(username=username, status__in=['Ongoing', 'Overdue', 'Defaulted']).exists():
            raise serializers.ValidationError("You cannot submit another loan application while you have an ongoing loan that is not fully paid.")
        return data


    def create(self, validated_data):
        loan_application = LoanApplication.objects.create(**validated_data)
        return loan_application

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['loanID', 'application', 'username', 'amount', 'durationOfLoan', 'purpose', 'interest_rate', 'approvalDate', 'repayment_schedule', 'status', 'outstanding_balance']


class PaymentSerializer(serializers.ModelSerializer):
    loan_id = serializers.IntegerField(write_only=True)
    payment_method_id = serializers.CharField(write_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Payment
        fields = ['loan_id', 'amount', 'payment_method_id']

    def validate(self, data):
        loan_id = data['loan_id']
        try:
            loan = Loan.objects.get(loanID=loan_id)  # Ensure using loanID
        except Loan.DoesNotExist:
            raise serializers.ValidationError("Loan does not exist.")
        if data['amount'] <= 0:
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        if data['amount'] > loan.outstanding_balance:
            raise serializers.ValidationError("Payment amount cannot exceed the outstanding balance.")
        if loan.status in ['Fully Paid', 'Defaulted']:
            raise serializers.ValidationError(f"Cannot make payments on a loan with status {loan.status}.")
        
        return data

