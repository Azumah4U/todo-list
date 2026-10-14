from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
import os

app = FastAPI()

# IMPORTANT: Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "todos.db"
# If running from project root, adjust path
if not os.path.exists(DB_PATH):
    if os.path.exists("backend/todos.db"):
        DB_PATH = "backend/todos.db"

# Pydantic Model - Must contain id, title, description, completed (bool)
class Todo(BaseModel):
    id: int
    title: str
    description: str
    completed: bool

class TodoCreate(BaseModel):
    title: str
    description: str = ""

# Required: Function that opens a database connection
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Required: Function that initializes the database
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Required: Table-creation query
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            completed BOOLEAN NOT NULL
        )
    """)

    # Required: At least five todo records
    cursor.execute("SELECT COUNT(*) FROM todos")
    count = cursor.fetchone()[0]

    if count == 0:
        sample_todos = [
            ("Buy groceries", "Milk, Bread, Eggs, Fruits", 0),
            ("Study FastAPI", "Learn Pydantic models and SQLite", 1),
            ("Complete assignment", "Build todo list app with frontend and backend", 0),
            ("Exercise", "30 minutes walk in the park", 1),
            ("Call family", "Check in with parents and siblings", 0),
        ]
        cursor.executemany(
            "INSERT INTO todos (title, description, completed) VALUES (?,?,?)",
            sample_todos
        )

    conn.commit()
    conn.close()

# Required: Database must be initialized when application starts
init_db()

@app.get("/")
def root():
    return {"message": "Todo API running"}

# Required: GET /todos endpoint - Must open, select, convert, return JSON, close
@app.get("/todos", response_model=List[Todo])
def get_todos():
    conn = get_db_connection() # 1. Open connection
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM todos") # 2. Select all
    rows = cursor.fetchall()

    todos = []
    for row in rows: # 3. Convert records into todo objects
        todos.append(Todo(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            completed=bool(row["completed"])
        ))

    conn.close() # 5. Close connection
    return todos # 4. Return as JSON

# Optional bonus: Add new todos
@app.post("/todos", response_model=Todo)
def create_todo(todo: TodoCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO todos (title, description, completed) VALUES (?,?,?)",
        (todo.title, todo.description, False)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return Todo(id=new_id, title=todo.title, description=todo.description, completed=False)

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM todos WHERE id =?", (todo_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")

    new_completed = not bool(row["completed"])
    cursor.execute("UPDATE todos SET completed =? WHERE id =?", (new_completed, todo_id))
    conn.commit()
    conn.close()
    return Todo(id=row["id"], title=row["title"], description=row["description"], completed=new_completed)

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM todos WHERE id =?", (todo_id,))
    conn.commit()
    conn.close()
    return {"message": "Deleted"}