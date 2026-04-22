// --- Element Selections ---
const section = document.getElementById('week-list-section');


// --- Functions ---

function createWeekArticle(week) {
  const article = document.createElement('article');

  article.innerHTML = `
    <h2>${week.title}</h2>
    <p>Starts on: ${week.start_date}</p>
    <p>${week.description}</p>
    <a href="details.html?id=${week.id}">View Details & Discussion</a>
  `;

  return article;
}


async function loadWeeks() {
  try {
    const res = await fetch('./api/index.php');
    const result = await res.json();

    section.innerHTML = '';

    if (result.success) {
      result.data.forEach(week => {
        const article = createWeekArticle(week);
        section.appendChild(article);
      });
    }

  } catch (error) {
    console.error(error);
    section.innerHTML = "<p>Error loading weeks.</p>";
  }
}


// --- Initial Page Load ---
loadWeeks();