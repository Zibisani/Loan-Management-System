# loan_management/urls.py

from django.urls import path
from .views import LoanApplicationView, LoanApplicationReviewView, LoanApplicationListView, PaymentView, CustomerViewLoanApplicationView, CustomerViewLoanView, LoanDetailView


urlpatterns = [
    path('submit-loan/', LoanApplicationView.as_view(), name='submit-loan'),
    path('loan-application-list/', LoanApplicationListView.as_view(), name='loan-application-list'),
    path('loan-application-review/<int:applicationID>/review/', LoanApplicationReviewView.as_view(), name='loan-application-review'),
    path('make-payment/', PaymentView.as_view(), name='make-payment'),
    path('applications/<str:username>/', CustomerViewLoanApplicationView.as_view(), name='customer_view_loan_applications'),
    path('customer_view_loans/<str:username>/', CustomerViewLoanView.as_view(), name='customer_view_loans'),
    path('loan/<int:loanID>/', LoanDetailView.as_view(), name='loan-detail'),

]
