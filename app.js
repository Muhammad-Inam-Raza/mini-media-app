let currentUser = null;
let posts = [];

// Load data on start
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("currentUser");
  const savedPosts = localStorage.getItem("posts");

  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  }

  if (savedPosts) {
    posts = JSON.parse(savedPosts);
    renderPosts();
  }
});

// Auth Functions
function showSignup() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPass").value;

  if (name && email && pass) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) {
      alert("Email already exists!");
      return;
    }
    users.push({ name, email, password: pass });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Account created! Please login.");
    showLogin();
  }
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === pass);

  if (user) {
    currentUser = { name: user.name, email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    renderPosts();
  } else {
    alert("Invalid credentials!");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
}

// Post Functions
function addPost() {
  const text = document.getElementById("postText").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!text) return alert("Write something!");

  const post = {
    id: Date.now(),
    text,
    imageUrl: imageUrl || null,
    likes: 0,
    reactions: { "❤️": 0, "😂": 0, "👍": 0, "😢": 0, "🔥": 0 },
    timestamp: new Date().toISOString(),
    author: currentUser.name
  };

  posts.unshift(post);
  saveAndRender();
  document.getElementById("postText").value = "";
  document.getElementById("imageUrl").value = "";
}

function deletePost(id) {
  if (confirm("Delete this post?")) {
    posts = posts.filter(p => p.id !== id);
    saveAndRender();
  }
}

function toggleReaction(postId, reaction) {
  const post = posts.find(p => p.id === postId);
  const current = Object.keys(post.reactions).find(r => post.reactions[r] > 0);
  
  if (current === reaction) {
    post.reactions[reaction] = 0;
    post.likes = 0;
  } else {
    if (current) post.reactions[current] = 0;
    post.reactions[reaction] = 1;
    post.likes = 1;
  }
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
  sortPosts(); // Re-apply sorting
}

function renderPosts(filtered = posts) {
  const feed = document.getElementById("postsFeed");
  feed.innerHTML = "";

  filtered.forEach(post => {
    const date = new Date(post.timestamp).toLocaleString();
    const activeReaction = Object.keys(post.reactions).find(r => post.reactions[r] > 0) || "❤️";

    feed.innerHTML += `
      <div class="post">
        <div class="post-header">
          <strong>${post.author}</strong>
          <span>${date}</span>
        </div>
        <div class="post-text">${post.text.replace(/\n/g, "<br>")}</div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="post image" onerror="this.style.display='none'">` : ""}
        
        <div class="post-actions-bar">
          <div class="reactions">
            <button onclick="toggleReaction(${post.id}, '❤️')">${activeReaction === '❤️' ? '❤️' : '♡'}</button>
            <button onclick="toggleReaction(${post.id}, '😂')">😂</button>
            <button onclick="toggleReaction(${post.id}, '👍')">👍</button>
            <button onclick="toggleReaction(${post.id}, '😢')">😢</button>
            <button onclick="toggleReaction(${post.id}, '🔥')">🔥</button>
            <span class="like-count">${post.likes} ${post.likes === 1 ? 'Like' : 'Likes'}</span>
          </div>
          <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
        </div>
      </div>
    `;
  });
}

function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = posts.filter(p => p.text.toLowerCase().includes(query));
  renderPosts(filtered);
}

function sortPosts() {
  const sortBy = document.getElementById("sortSelect").value;
  let sorted = [...posts];

  if (sortBy === "latest") {
    sorted.sort((a, b) => b.id - a.id);
  } else if (sortBy === "oldest") {
    sorted.sort((a, b) => a.id - b.id);
  } else if (sortBy === "mostLiked") {
    sorted.sort((a, b) => b.likes - a.likes);
  }

  renderPosts(sorted);
}

// Theme Toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = document.querySelector("#themeToggle i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
});