from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from sales.models import Sale
from purchases.models import Purchase
from customers.models import Customer
from core.models import Address
from drf_spectacular.utils import extend_schema

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Get Dashboard Statistics")
    def list(self, request):
        user = request.user
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
            
        start_date = timezone.now() - timedelta(days=days)

        # Filter logic based on user role
        if user.role == 'SUPER_ADMIN':
            sales_qs = Sale.objects.filter(created_at__gte=start_date)
            purchases_qs = Purchase.objects.filter(date__gte=start_date)
            customers_qs = Customer.objects.filter(created_at__gte=start_date)
            all_sales_qs = Sale.objects.all()
            all_purchases_qs = Purchase.objects.all()
            all_customers_qs = Customer.objects.all()
        elif user.role == 'TENANT_ADMIN':
            # Tenant sees their own + their merchants
            sales_qs = Sale.objects.filter(created_at__gte=start_date).filter(seller__parent_admin=user) | Sale.objects.filter(created_at__gte=start_date).filter(seller=user)
            purchases_qs = Purchase.objects.filter(date__gte=start_date).filter(seller__parent_admin=user) | Purchase.objects.filter(date__gte=start_date).filter(seller=user)
            customers_qs = Customer.objects.filter(created_at__gte=start_date).filter(seller__parent_admin=user) | Customer.objects.filter(created_at__gte=start_date).filter(seller=user)
             # Totals (all time)
            all_sales_qs = Sale.objects.filter(seller__parent_admin=user) | Sale.objects.filter(seller=user)
            all_purchases_qs = Purchase.objects.filter(seller__parent_admin=user) | Purchase.objects.filter(seller=user)
            all_customers_qs = Customer.objects.filter(seller__parent_admin=user) | Customer.objects.filter(seller=user)

        else: # MERCHANT
            sales_qs = Sale.objects.filter(created_at__gte=start_date, seller=user)
            purchases_qs = Purchase.objects.filter(date__gte=start_date, seller=user)
            customers_qs = Customer.objects.filter(created_at__gte=start_date, seller=user)
            all_sales_qs = Sale.objects.filter(seller=user)
            all_purchases_qs = Purchase.objects.filter(seller=user)
            all_customers_qs = Customer.objects.filter(seller=user)

        
        # Calculate Stats
        total_sales_value = all_sales_qs.annotate(val=F('volume')*F('rate')).aggregate(Sum('val'))['val__sum'] or 0
        total_purchases_value = all_purchases_qs.aggregate(Sum('purchase_amount'))['purchase_amount__sum'] or 0
        total_customers = all_customers_qs.count()
        
        # Growth (stub logic for now, or simple comparison)
        # For simplicity, just returning totals
        
        stats = {
            'totalSales': total_sales_value,
            'salesGrowth': 0, # Implement real growth logic if needed
            'totalPurchases': total_purchases_value,
            'purchasesGrowth': 0,
            'totalCustomers': total_customers,
            'customersGrowth': 0,
            'activeProducts': 0,
            'productsGrowth': 0,
        }

        # Chart Data
        sales_by_date = sales_qs.annotate(date=TruncDate('created_at')).values('date').annotate(val=Sum(F('volume')*F('rate'))).order_by('date')
        purchases_by_date = purchases_qs.annotate(date_only=TruncDate('date')).values('date_only').annotate(val=Sum('purchase_amount')).order_by('date_only')
        
        # Merge dates for chart
        chart_data_map = {}
        for s in sales_by_date:
            d = s['date'].strftime('%Y-%m-%d')
            chart_data_map[d] = {'name': d, 'sales': s['val'], 'purchases': 0}
            
        for p in purchases_by_date:
            d = p['date_only'].strftime('%Y-%m-%d')
            if d not in chart_data_map:
                chart_data_map[d] = {'name': d, 'sales': 0, 'purchases': 0}
            chart_data_map[d]['purchases'] = p['val']
            
        chart_data = sorted(chart_data_map.values(), key=lambda x: x['name'])

        # Recent Activity
        recent_sales = all_sales_qs.order_by('-created_at')[:5]
        recent_purchases = all_purchases_qs.order_by('-date')[:5]
        recent_customers = all_customers_qs.order_by('-created_at')[:5]
        
        recent_activity = []
        for s in recent_sales:
             recent_activity.append({
                'id': f's-{s.id}',
                'type': 'sale',
                'title': f'Sale #{s.id} - {s.currency}/{s.sale_currency}',
                'time': s.created_at,
                'amount': f'{s.volume} @ {s.rate}' 
            })
        for p in recent_purchases:
             recent_activity.append({
                'id': f'p-{p.id}',
                'type': 'purchase',
                'title': f'Purchase #{p.id} - {p.currency}/{p.purchase_currency}',
                'time': p.date, # This is date, might need datetime for sorting if available
                'amount': f'{p.volume} @ {p.rate}' 
            })
        
        # Sort by time desc
        recent_activity.sort(key=lambda x: str(x['time']), reverse=True)
        recent_activity = recent_activity[:10]

        return Response({
            'stats': stats,
            'chartData': chart_data,
            'recentActivity': recent_activity
        })

class GlobalSearchView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(summary="Global Search (Addresses Only)")
    def list(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'addresses': []})

        user = request.user
        results = {
            'addresses': []
        }

        # Search Addresses (Partial Match)
        address_qs = Address.objects.filter(
            address_line_1__icontains=query
        ) | Address.objects.filter(
            city__icontains=query
        ) | Address.objects.filter(
            customer_name__icontains=query
        )

        if user.role != 'SUPER_ADMIN':
            if user.role == 'TENANT_ADMIN':
                address_qs = address_qs.filter(customer__seller__parent_admin=user) | address_qs.filter(customer__seller=user)
            else:
                address_qs = address_qs.filter(customer__seller=user)
        # For SUPER_ADMIN, no filter applied (sees all, including unlinked)

        for addr in address_qs[:10]: # Increased limit since it's the only result type
             results['addresses'].append({
                'id': addr.id,
                'type': 'address',
                'title': addr.customer_name or 'Address',
                'subtitle': f'{addr.address_line_1}, {addr.city}',
                'url': f'/addresses/{addr.id}'
            })

        return Response(results)
