const supabaseUrl = "https://lojkgsoxehcqzixvfusd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvamtnc294ZWhjcXppeHZmdXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzk4MTYsImV4cCI6MjA4NDE1NTgxNn0.g-fmRoHSFpNqQuf67PF7bgLtLGNQkswI7TYZUgxzMT4";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function getUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user;
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) alert(error.message);
  else alert("Signup successful! Please login.");
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) alert(error.message);
  else initApp();
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

async function initApp() {
  const user = await getUser();

  if (user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("logoutBtn").style.display = "block";
    fetchTasks();
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
  }
}


async function fetchTasks() {
  const user = await getUser();
  if (!user) return;

  const res = await fetch(`http://localhost:3000/todos/${user.id}`);
  const data = await res.json();

  renderTasks(data);
}

async function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value.trim()) return;

  const user = await getUser();

  await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task: input.value,
      user_id: user.id
    })
  });

  input.value = "";
  fetchTasks();
}

async function editTask(id, oldText) {
  const newText = prompt("Edit task", oldText);
  if (!newText) return;

  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: newText })
  });

  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE"
  });

  fetchTasks();
}

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  if (!tasks || tasks.length === 0) {
    list.innerHTML = "<li style='text-align:center;'>No tasks yet</li>";
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.innerHTML = `
      <strong>${task.task}</strong><br>
      <small>
        Added: ${formatDateTime(task.created_at)}
        ${task.updated_at ? `<br>Edited: ${formatDateTime(task.updated_at)}` : ""}
      </small>
    `;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTask(task.id, task.task);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}
  
function formatDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleString();
}



initApp();