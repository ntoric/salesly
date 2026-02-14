import csv
import io
import datetime
from django.http import StreamingHttpResponse, HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils.dateparse import parse_date
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch

from sales.models import Sale
from purchases.models import Purchase
from customers.models import Customer

class Echo:
    """An object that implements just the write method of the file-like interface."""
    def write(self, value):
        return value

from drf_spectacular.utils import extend_schema

@extend_schema(tags=['Reports'])
class SalesReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        start_date = parse_date(request.query_params.get('start_date', ''))
        end_date = parse_date(request.query_params.get('end_date', ''))
        
        queryset = Sale.objects.filter(seller=request.user, status='COMPLETED')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        queryset = queryset.select_related('customer').prefetch_related('items__product')

        if fmt == 'xlsx':
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Sales Report"
            
            headers = ['Sale ID', 'Date', 'Customer', 'Total Amount', 'Items']
            ws.append(headers)
            
            for sale in queryset:
                item_str = ", ".join([f"{i.product.name} (x{i.quantity})" for i in sale.items.all()])
                ws.append([
                    sale.id, 
                    sale.created_at.strftime('%Y-%m-%d %H:%M'),
                    sale.customer.name if sale.customer else 'Walk-in',
                    sale.total_amount,
                    item_str
                ])
                
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="sales_report_{datetime.date.today()}.xlsx"'
            wb.save(response)
            return response
            
        else: # CSV
            rows = (
                [
                str(sale.id), 
                sale.created_at.strftime('%Y-%m-%d %H:%M'),
                sale.customer.name if sale.customer else 'Walk-in',
                str(sale.total_amount),
                ] for sale in queryset
            )
            
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)
            
            response = StreamingHttpResponse(
                (writer.writerow(row) for row in rows),
                content_type="text/csv"
            )
            response['Content-Disposition'] = f'attachment; filename="sales_report_{datetime.date.today()}.csv"'
            return response

@extend_schema(tags=['Reports'])
class PurchaseReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        fmt = request.query_params.get('format', 'csv')
        # ... (Similar logic filtering Purchase objects) ...
        # For brevity, implementing minimal CSV version or full if requested. 
        # Implementing full CSV for robustness.
        
        start_date = parse_date(request.query_params.get('start_date', ''))
        end_date = parse_date(request.query_params.get('end_date', ''))

        queryset = Purchase.objects.filter(seller=request.user, status='RECEIVED')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        rows = (
            [str(p.id), p.created_at.strftime('%Y-%m-%d'), p.vendor_name, str(p.total_amount)]
            for p in queryset
        )
        
        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        
        response = StreamingHttpResponse(
            (writer.writerow(row) for row in rows),
            content_type="text/csv"
        )
        response['Content-Disposition'] = f'attachment; filename="purchase_report_{datetime.date.today()}.csv"'
        return response

@extend_schema(tags=['Reports'])
class AddressLabelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Customer.objects.filter(seller=request.user, address__isnull=False).select_related('address')
        
        # Create PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        y = height - 1 * inch
        x = 1 * inch
        
        p.setFont("Helvetica", 12)
        
        for customer in queryset:
            addr = customer.address
            text = p.beginText(x, y)
            text.textLines([
                f"To: {customer.name}",
                f"{addr.street}",
                f"{addr.city}, {addr.state} {addr.postal_code}",
                f"{addr.country}"
            ])
            p.drawText(text)
            
            y -= 2 * inch
            if y < 1 * inch:
                p.showPage()
                y = height - 1 * inch
                
        p.save()
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')
