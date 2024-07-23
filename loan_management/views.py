from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from django.utils import timezone
import stripe

from .models import LoanApplication, Loan, Document, Payment
from .serializers import LoanApplicationSerializer, LoanSerializer, PaymentSerializer, DocumentSerializer
from user_management.models import CustomUser

# Create your views here.
class LoanApplicationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        
        data = request.data.copy()
        data['username'] = request.user.username  # Set the username to the currently authenticated user

        serializer = LoanApplicationSerializer(data=request.data)
        if serializer.is_valid():
            loan_application = serializer.save()
            loan_application.status = 'Submitted'
            loan_application.save()
            
           
            return Response({'message': 'Loan application submitted successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoanApplicationListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role not in ['admin', 'loan_officer']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        applications = LoanApplication.objects.filter(status='Submitted')
        serializer = LoanApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class LoanApplicationReviewView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, applicationID):
        try:
            return LoanApplication.objects.get(applicationID=applicationID)
        except LoanApplication.DoesNotExist:
            return None

    def post(self, request, applicationID, *args, **kwargs):
        if request.user.role not in ['admin', 'loan_officer']:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        loan_application = self.get_object(applicationID)
        if loan_application is None:
            return Response({'detail': 'Loan application not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if data.get('status') == 'Approved':
            interest_rate = data.get('interest_rate')
            if not interest_rate:
                return Response({'detail': 'Interest rate is required for approval'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                interest_rate = float(interest_rate)  # Ensure interest rate is a float
            except ValueError:
                return Response({'detail': 'Invalid interest rate'}, status=status.HTTP_400_BAD_REQUEST)

            loan_application.status = 'Approved'
            loan_application.approvalDate = timezone.now()
            loan_application.save()

            loan = Loan(
                application=loan_application,
                username=loan_application.username,
                amount=loan_application.amount,
                durationOfLoan=loan_application.durationOfLoan,
                purpose=loan_application.purpose,
                interest_rate=interest_rate,
                repayment_schedule=self.generate_repayment_schedule(loan_application.amount, loan_application.durationOfLoan, interest_rate),
                status='Ongoing',  # Default status for a new loan
                outstanding_balance=loan_application.amount * (1 + interest_rate / 100)
            )
            loan.save()

            return Response({'message': 'Loan application approved successfully'}, status=status.HTTP_200_OK)
        elif data.get('status') == 'Denied':
            loan_application.status = 'Denied'
            loan_application.save()
            return Response({'message': 'Loan application denied'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    def generate_repayment_schedule(self, amount, duration, interest_rate):
        # Implement logic to generate repayment schedule
        monthly_payment = (amount * (1 + interest_rate / 100)) / duration
        schedule = [{'month': i + 1, 'payment': monthly_payment} for i in range(duration)]
        return schedule




stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentView(APIView):
    def post(self, request):
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            loan_id = serializer.validated_data['loan_id']
            amount = serializer.validated_data['amount']
            payment_method_id = serializer.validated_data['payment_method_id']

            try:
                # Create a PaymentIntent on Stripe
                intent = stripe.PaymentIntent.create(
                    amount=int(amount * 100),  # Stripe works with cents
                    currency='usd',
                    payment_method=payment_method_id,
                    confirm=True,
                     automatic_payment_methods={
                        "enabled": True,
                        "allow_redirects": "never"
                    }
                )

                # Payment was successful, update the loan and create a payment record
                loan = Loan.objects.get(loanID=loan_id)
                loan.outstanding_balance -= amount
                if loan.outstanding_balance <= 0:
                    loan.status = 'Fully Paid'
                loan.save()

                Payment.objects.create(
                    loan=loan,
                    amount=amount,
                    paymentDate=timezone.now(),
                )

                return Response({'message': 'Payment successful.'}, status=status.HTTP_200_OK)
            except stripe.error.CardError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerViewLoanApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        loan_applications = LoanApplication.objects.filter(username=user)
        if not loan_applications.exists():
            return Response({'detail': 'No applications found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LoanApplicationSerializer(loan_applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class CustomerViewLoanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

        loans = Loan.objects.filter(username=user)
        if not loans.exists():
            return Response({'detail': 'No loans found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LoanSerializer(loans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)







class LoanDetailView(APIView):
    def get(self, request, loanID):
        try:
            loan = Loan.objects.get(loanID=loanID)
            serializer = LoanSerializer(loan)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DocumentUploadView(APIView):
    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
