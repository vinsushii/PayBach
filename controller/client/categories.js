document.addEventListener("DOMContentLoaded", () => {
  fetch("/PayBach/model/api/client/fetch_categories.php")
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      renderHomepageCategories(data.categories);
      renderViewCategories(data.categories);
      renderNavCategories(data.categories);
    })
    .catch(err => console.error(err));
});


/* HOMEPAGE CATEGORIES */
function renderHomepageCategories(categories) {
  const container = document.getElementById("homepage-categories");
  if (!container) return;

  container.innerHTML = "";

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="../../images/${cat.image}" alt="${escapeHtml(cat.name)}">
      <p>${escapeHtml(cat.name)}</p>
    `;

    div.onclick = () => {
      location.href = `specific_category.html?category=${encodeURIComponent(cat.name)}`;
    };

    container.appendChild(div);
  });
}
/* VIEW CATEGORIES PAGE */
function renderViewCategories(categories) {
  const container = document.getElementById("view-categories");
  if (!container) return;

  container.innerHTML = "";

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-card";
    div.innerHTML = `
      <img src="../../images/${cat.image}" alt="${escapeHtml(cat.name)}">
      <p>${escapeHtml(cat.name)}</p>
    `;

    div.onclick = () => {
      location.href = `specific_category.html?category=${encodeURIComponent(cat.name)}`;
    };

    container.appendChild(div);
  });
}

/* NAV BAR */
function renderNavCategories(categories) {
  const navList = document.getElementById("nav-categories");
  if (!navList) return;

  navList.innerHTML = "";

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="view_categories.html?category=${encodeURIComponent(cat.name)}">
        ${escapeHtml(cat.name)}
      </a>
    `;
    navList.appendChild(li);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
