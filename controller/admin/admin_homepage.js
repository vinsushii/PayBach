document.addEventListener("DOMContentLoaded", async () => {
  // Check session
  const me = await fetch("http://localhost:3000/api/admin/me", {
    credentials: "include"
  });

  const meData = await me.json();
  if (!meData.loggedIn) {
    window.location.href = "/PayBach/index.html";
    return;
  }

  // Fetch dashboard data
  const res = await fetch("http://localhost:3000/api/admin/dashboard", {
    credentials: "include"
  });

  const data = await res.json();

  document.getElementById("total-bids").textContent = data.totalBids;
  document.getElementById("total-trades").textContent = data.totalTrades;
  document.getElementById("total-members").textContent = data.totalMembers;
  document.getElementById("total-admins").textContent = data.totalAdmins;
  document.getElementById("to-validate").textContent = data.toValidate;
  document.getElementById("to-review").textContent = data.toReview;
});
