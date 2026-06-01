const USERS = [
  {
    email: "admin@organicpestar.co.za",
    password: "Admin123",
    role: "admin",
    name: "Admin"
  },
  {
    email: "tech@organicpestar.co.za",
    password: "Tech123",
    role: "technician",
    name: "Technician 1"
  },
  {
    email: "tech2@organicpestar.co.za",
    password: "Tech123",
    role: "technician",
    name: "Technician 2"
  }
];

function getSession() {
  return JSON.parse(localStorage.getItem("op_session") || "null");
}

function setSession(user) {
  localStorage.setItem("op_session", JSON.stringify({
    email: user.email,
    role: user.role,
    name: user.name,
    loginAt: new Date().toISOString()
  }));
}

function clearSession() {
  localStorage.removeItem("op_session");
}

function protectPage() {
  const protectedPage = document.body.dataset.protected === "true";
  if (!protectedPage) return;

  const requiredRole = document.body.dataset.role;
  const session = getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  if (requiredRole === "admin" && session.role !== "admin") {
    window.location.href = "technician.html";
    return;
  }

  if (requiredRole === "technician" && !["admin", "technician"].includes(session.role)) {
    window.location.href = "login.html";
    return;
  }

  const label = document.getElementById("currentUserLabel");
  if (label) label.textContent = `${session.name} • ${session.role}`;
}

function setupLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    const user = USERS.find((item) => item.email === email && item.password === password);

    if (!user) {
      message.textContent = "Incorrect login details. Please try again.";
      message.style.color = "#9d2f2f";
      return;
    }

    setSession(user);

    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "technician.html";
    }
  });
}

function setupLogout() {
  document.querySelectorAll("#logoutBtn").forEach((button) => {
    button.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  });
}

function setupMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  setupLogin();
  setupLogout();
  setupMobileMenu();
});
