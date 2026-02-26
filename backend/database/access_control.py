from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from database.db import User, Door, AccessLog
import datetime
import random

def simulate_access_attempt(db: Session, user_id: Optional[int] = None, door_id: Optional[int] = None):
    """Simulate and log an access attempt."""
    if not user_id:
        user_id = random.randint(1, 3)
    if not door_id:
        door_id = random.randint(1, 4)
    status = random.choice(['GRANTED', 'GRANTED', 'GRANTED', 'DENIED'])
    
    new_log = AccessLog(user_id=user_id, door_id=door_id, status=status)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

def get_recent_logs(db: Session, limit: int = 10):
    """Retrieve recent access logs with user and door details."""
    logs = db.query(AccessLog, User.name, Door.location)\
        .join(User, AccessLog.user_id == User.id)\
        .join(Door, AccessLog.door_id == Door.id)\
        .order_by(AccessLog.timestamp.desc())\
        .limit(limit).all()
    
    return [
        {
            "id": log[0].id,
            "user": log[1],
            "door": log[2],
            "timestamp": log[0].timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "status": log[0].status
        } for log in logs
    ]

def get_security_analytics(db: Session):
    """Retrieve security analytics for the building."""
    # Busiest Hour
    busiest_hour_query = db.query(
        func.strftime('%H', AccessLog.timestamp).label('hour'),
        func.count(AccessLog.id).label('attempts')
    ).group_by('hour').order_by(func.count(AccessLog.id).desc()).first()
    
    busiest_hour = f"{busiest_hour_query[0]}:00" if busiest_hour_query else "N/A"
    
    # High-Risk Users (Denied attempts >= 3)
    high_risk_users_query = db.query(
        User.name, func.count(AccessLog.id).label('denied_attempts')
    ).join(AccessLog, User.id == AccessLog.user_id)\
    .filter(AccessLog.status == 'DENIED')\
    .group_by(User.name)\
    .having(func.count(AccessLog.id) >= 3)\
    .order_by(func.count(AccessLog.id).desc()).all()
    
    high_risk_users = [
        {"name": row[0], "denied_attempts": row[1]} for row in high_risk_users_query
    ]
    
    # Total Denials (Current Month)
    total_denials = db.query(AccessLog).filter(AccessLog.status == 'DENIED').count()
    
    return {
        "busiest_hour": busiest_hour,
        "high_risk_users": high_risk_users,
        "total_denials": total_denials
    }
