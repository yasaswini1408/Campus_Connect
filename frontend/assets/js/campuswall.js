import { BASE_URL } from "./config.js";

const token = localStorage.getItem('token');

// Redirect to login if no token
if (!token) {
  alert('You must log in first!');
  window.location.href = 'login.html';
}

// Fetch posts
async function getPosts() {
  try {
    const res = await fetch(`${BASE_URL}/api/posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const posts = await res.json();
    console.log("Posts response:", posts); // Debug

    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';

    if (Array.isArray(posts)) {
      posts.forEach(post => renderPost(post));
    } else {
      postsDiv.innerHTML = `<p>No posts found.</p>`;
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
  }
}

// Render a single post with upvote + replies
function renderPost(post) {
  const postsDiv = document.getElementById('posts');

  const div = document.createElement('div');
  div.classList.add('post');
  div.innerHTML = `
    <h3>${post.title}</h3>
    <p>${post.content}</p>
    <small>
      By ${post.author?.name || 'Unknown'} (${post.author?.role || ''})
      • ${new Date(post.date).toLocaleString()} • ${post.type}
    </small>
    <button class="upvote" onclick="upvotePost('${post._id}')">
       Upvote &uarr;
    </button>
    <span id="upvotes-${post._id}">${post.upvotes?.length || 0}</span> upvotes
    <div class="replies" id="replies-${post._id}"></div>

    <form class="reply-form" onsubmit="replyPost(event, '${post._id}')">
      <input type="text" placeholder="Write a reply..." required>
      <button type="submit">Reply</button>
    </form>
  `;

  postsDiv.appendChild(div);

  // Render replies if any
  renderReplies(post);
}

// Render replies under a post
function renderReplies(post) {
  const container = document.getElementById(`replies-${post._id}`);
  if (!container) return;

  container.innerHTML = '';
  if (Array.isArray(post.replies)) {
    post.replies.forEach(r => {
      const replyDiv = document.createElement('div');
      replyDiv.innerHTML = `
        <p><strong>${r.author?.name || 'Anonymous'}:</strong> ${r.content}</p>
      `;
      container.appendChild(replyDiv);
    });
  }
}

// Upvote a post
async function upvotePost(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/posts/${id}/upvote`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const updatedPost = await res.json();

    if (res.ok) {
      document.getElementById(`upvotes-${id}`).innerText = updatedPost.upvotes.length;
    } else {
      alert(updatedPost.msg); // e.g. "You already upvoted this post"
    }
  } catch (err) {
    console.error("Error upvoting:", err);
  }
}


// Reply to a post
async function replyPost(e, id) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const content = input.value;

  try {
    const res = await fetch(`${BASE_URL}/api/posts/${id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (res.ok) {
      const updatedPost = await res.json();
      renderReplies(updatedPost);
      input.value = '';
    } else {
      const errMsg = await res.json();
      alert(errMsg.msg || "Error replying");
    }
  } catch (err) {
    console.error("Error replying:", err);
  }
}

// Submit new post
document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const type = document.getElementById('type').value;

  try {
    const res = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, type })
    });

    if (res.ok) {
      document.getElementById('postForm').reset();
      getPosts(); // refresh posts
    } else {
      const data = await res.json();
      alert(data.msg || 'Error creating post');
    }
  } catch (err) {
    console.error('Error creating post:', err);
  }
});
window.upvotePost = upvotePost;
window.replyPost = replyPost;

// Load posts initially
getPosts();
// setInterval(() => {
//   location.reload();
// }, 20000); 
