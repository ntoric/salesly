from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'status': 'error',
            'code': response.status_code,
            'message': response.data.get('detail', 'An error occurred'),
            'errors': []
        }
        
        # If there are validation errors (dict of field errors), put them in 'errors'
        if isinstance(response.data, dict) and 'detail' not in response.data:
            custom_data['message'] = "Validation Failed"
            custom_data['errors'] = response.data
        elif isinstance(response.data, list):
             custom_data['errors'] = response.data
            
        response.data = custom_data

    return response
