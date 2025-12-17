document.addEventListener("DOMContentLoaded", async () => {
  const box = document.querySelector(".notifications-box");

  const res = await fetch("/PayBach/model/api/client/notification.php");
  const result = await res.json();

  if (!result.data.length) return;

  box.innerHTML = "<h2>Notifications</h2>";

  result.data.forEach(n => {
    const div = document.createElement("div");
    div.className = "notification-item";
    div.innerHTML = `
      <p>${n.message}</p>
      <small>Item: ${n.item_name}</small><br>
      <small>${new Date(n.created_at).toLocaleString()}</small>
    `;
    box.appendChild(div);
  });
});
