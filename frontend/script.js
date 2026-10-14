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