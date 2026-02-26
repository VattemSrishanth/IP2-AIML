from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./smart_building.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    role = Column(String)

class Door(Base):
    __tablename__ = "doors"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String)

class AccessLog(Base):
    __tablename__ = "access_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    door_id = Column(Integer, ForeignKey("doors.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if empty, populate with some dummy data if so
    if db.query(User).count() == 0:
        users = [User(name='Alice', role='Employee'), 
                 User(name='Bob', role='Manager'), 
                 User(name='Charlie', role='Contractor')]
        db.add_all(users)
        
        doors = [Door(location='Main Entrance'), 
                 Door(location='Data Center'), 
                 Door(location='Server Room'), 
                 Door(location='Cafeteria')]
        db.add_all(doors)
        db.commit()
    db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
