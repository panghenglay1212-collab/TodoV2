from sqlalchemy.orm import Session
import models, schemas
from auth import hash_password

def get_user_by_username(db: Session, username:str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = hash_password(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_todos(db: Session, owner_id: int):
    return db.query(models.Todo).filter(models.Todo.owner_id == owner_id).all()

def get_todo(db:Session, todo_id: int, owner_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.owner_id == owner_id).first()

def create_todo(db: Session, todo: schemas.TodoCreate, owner_id: int):
    db_todo = models.Todo(**todo.dict(), owner_id=owner_id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, todo_id: int, todo: schemas.TodoUpdate, owner_id: int):
    db_todo = get_todo(db, todo_id, owner_id)
    if db_todo:
        for key, value in todo.dict().items():
            setattr(db_todo, key, value)
        db.commit()
        db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, todo_id:int, owner_id: int):
    db_todo = get_todo(db, todo_id, owner_id)
    if db_todo:
        db.delete(db_todo)
        db.commit()
    return db_todo

