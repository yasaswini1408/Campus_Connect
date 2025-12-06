import { BASE_URL } from "./config.js";

function getToken() {
  return localStorage.getItem('token');
}

async function searchBooks() {
  const query = document.getElementById("searchBar").value;
  try {
    const res = await fetch(`${BASE_URL}/api/library/books?search=${query}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) {
      alert("Error fetching books");
      return;
    }

    const books = await res.json();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (books.length === 0) {
      resultsDiv.innerHTML = "<p>No books found.</p>";
      return;
    }

    books.forEach(book => {
      const div = document.createElement("div");
      div.classList.add("book");

      let actionBtn = "";
      if (book.available) {
        actionBtn = `<button onclick="borrowBook('${book._id}')">Borrow</button>`;
      } else {
        actionBtn = `<button onclick="reserveBook('${book._id}')">Reserve</button>
                     <p><small>Borrowed, due back: ${book.dueDate ? new Date(book.dueDate).toLocaleDateString() : "Unknown"}</small></p>`;
      }

      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><small>Author: ${book.author} | ISBN: ${book.isbn}</small></p>
        ${actionBtn}
      `;
      resultsDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error searching books:", err);
  }
}

async function borrowBook(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/library/book/${id}/borrow`, {
      method: "POST",
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await res.json();
    alert(data.msg);
    searchBooks();
    loadMyBooks();
  } catch (err) {
    console.error("Error borrowing book:", err);
  }
}

async function reserveBook(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/library/book/${id}/reserve`, {
      method: "POST",
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await res.json();
    alert(data.msg);
    searchBooks();
  } catch (err) {
    console.error("Error reserving book:", err);
  }
}

async function loadMyBooks() {
  try {
    const res = await fetch(`${BASE_URL}/api/library/my`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!res.ok) return;

    const books = await res.json();
    const myBooksDiv = document.getElementById("myBooks");
    myBooksDiv.innerHTML = "";

    if (books.length === 0) {
      myBooksDiv.innerHTML = "<p>You have not borrowed any books yet.</p>";
      return;
    }

    books.forEach(book => {
      const div = document.createElement("div");
      div.classList.add("mybook");
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><small>Author: ${book.author} | ISBN: ${book.isbn}</small></p>
        <p><strong>Due Date:</strong> ${book.dueDate ? new Date(book.dueDate).toLocaleDateString() : "Unknown"}</p>
      `;
      myBooksDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading borrowed books:", err);
  }
}

// Load borrowed books initially
loadMyBooks();
