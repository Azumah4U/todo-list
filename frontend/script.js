const API_URL = "http://127.0.0.1:8000";
async function fetchTodos() {
    const res = await fetch(`${API_URL}/todos`);
    const todos = await res.json();
    const list = document.getElementById("todoList");
    list.innerHTML = "";
    todos.forEach(todo => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="${todo.completed ? 'completed' : ''}" onclick="toggleTodo(${todo.id})">${todo.title}</span> <button onclick="deleteTodo(${todo.id})">X</button>`;
        list.appendChild(li);
    });
}
async function addTodo() {notepad frontend/script.js
    const input = document.getElementById("todoInput");
    if (!input.value) return;
    await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.value })
    });
    input.value = "";
    fetchTodos();
}
async function toggleTodo(id) {
    await fetch(`${API_URL}/todos/${id}`, { method: "PUT" });
    fetchTodos();
}
async function deleteTodo(id) {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    fetchTodos();
}
fetchTodos();
const todoListElement = document.getElementById("todo-list");

async function loadTodos() {
    try {
        const response = await fetch("http://127.0.0.1:8000/todos");
        const todos = await response.json();
        
        todoListElement.innerHTML = "";

        todos.forEach(todo => {
            const taskElement = document.createElement("div");
            taskElement.className = `todo-item ${todo.completed ? 'completed' : 'incomplete'}`;

            const titleElement = document.createElement("h2");
            titleElement.textContent = todo.title;

            const descElement = document.createElement("p");
            descElement.textContent = todo.description;

            const statusElement = document.createElement("span");
            statusElement.className = "status";
            statusElement.textContent = todo.completed ? "Completed" : "Incomplete";

            taskElement.appendChild(titleElement);
            taskElement.appendChild(descElement);
            taskElement.appendChild(statusElement);
            
            todoListElement.appendChild(taskElement);
        });
    } catch (error) {
        console.error("Failed to load todos:", error);
        // Fallback data for Stage 1
        const fallbackTodos = [
            { id: 1, title: "Buy groceries", description: "Milk, Bread, Eggs", completed: false },
            { id: 2, title: "Study FastAPI", description: "Learn Pydantic models", completed: true },
            { id: 3, title: "Write assignment", description: "Complete todo app", completed: false },
            { id: 4, title: "Exercise", description: "30 min walk", completed: true },
            { id: 5, title: "Call family", description: "Check in with parents", completed: false }
        ];
        // Render fallback if backend not running
        if (todoListElement.children.length === 0) {
            fallbackTodos.forEach(todo => {
                const el = document.createElement("div");
                el.className = `todo-item ${todo.completed ? 'completed' : 'incomplete'}`;
                el.innerHTML = `<h2>${todo.title}</h2><p>${todo.description}</p><span class="status">${todo.completed ? 'Completed' : 'Incomplete'}</span>`;
                todoListElement.appendChild(el);
            });
        }
    }
}

loadTodos();