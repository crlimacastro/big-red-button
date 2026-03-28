export function initTheme() {
  document.documentElement.dataset.theme = getTheme();
}

export function getTheme() {
  return localStorage.getItem("theme") || "dark";
}

export function toggleTheme() {
  const currentTheme = getTheme();
  document.documentElement.dataset.theme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", document.documentElement.dataset.theme);
}
