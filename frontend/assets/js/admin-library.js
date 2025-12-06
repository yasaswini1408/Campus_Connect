import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

async function loadBooks() {
  try {
    const res = await fetch(`${BASE_URL}/api/library/books`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const books = await res.json();
    const div = document.getElementById("allBooks");
    div.innerHTML = "";

    if (books.length === 0) {
      div.innerHTML = "<p>No books in library yet.</p>";
      return;
    }

    books.forEach(book => {
      const el = document.createElement("div");
      el.classList.add("book");
      el.innerHTML = `
        <h3>${book.title}</h3>
        <p><small>Author: ${book.author} | ISBN: ${book.isbn}</small></p>
        <p>Status: ${book.available ? "✅ Available" : "❌ Borrowed"}</p>
      `;
      div.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading books:", err);
  }
}

document.getElementById("addBookForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const isbn = document.getElementById("isbn").value;

  try {
    const res = await fetch(`${BASE_URL}/api/library/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ title, author, isbn })
    });

    const data = await res.json();
    alert(data.msg || "Book added");
    document.getElementById("addBookForm").reset();
    loadBooks();
  } catch (err) {
    console.error("Error adding book:", err);
  }
});

// Load all books on page load
loadBooks();
