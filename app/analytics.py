import pandas as pd
import numpy as np
from .models import Task

def get_task_analytics(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()
    
    if not tasks:
        return {
            'total': 0,
            'completed': 0,
            'pending': 0,
            'completion_percentage': 0.0
        }
        
    # Convert tasks to pandas DataFrame
    data = [{'id': t.id, 'status': t.status} for t in tasks]
    df = pd.DataFrame(data)
    
    total = len(df)
    
    # Use pandas to count statuses
    status_counts = df['status'].value_counts()
    
    completed = int(status_counts.get('Completed', 0))
    pending = int(status_counts.get('Pending', 0))
    
    # Use numpy to calculate percentage and handle division by zero (though total > 0 here)
    completion_percentage = float(np.round((completed / total) * 100, 1)) if total > 0 else 0.0
    
    return {
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_percentage': completion_percentage
    }
