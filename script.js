
const themeToggle = document.getElementById("themeToggle");
const langToggle = document.getElementById("langToggle");
const html = document.documentElement;
const nameEl = document.getElementById("name");
const titleEl = document.getElementById("title");

let currentLang = "en";

themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    html.setAttribute("data-theme", current === "light" ? "dark" : "light");
});

langToggle.addEventListener("click", () => {
    if (currentLang === "en") {
        html.setAttribute("lang", "fa");
        html.setAttribute("dir", "rtl");
        nameEl.textContent = "میلاد تهجدی";
        titleEl.textContent = "طراح و مشاور رابط و تجربه کاربری";
        currentLang = "fa";
    } else {
        html.setAttribute("lang", "en");
        html.setAttribute("dir", "ltr");
        nameEl.textContent = "Milad Tahajody";
        titleEl.textContent = "UI/UX Designer & Consultant";
        currentLang = "en";
    }
});
