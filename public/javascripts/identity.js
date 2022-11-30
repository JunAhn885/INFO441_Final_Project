"use strict";

import { escapeHtml } from "./utils.js";

export async function loadIdentity() {
  try {
    let div = document.getElementById("identity_div");
    const res = await fetch("/api/user");
    if (res.status === 200) {
      // We are logged in
      const user = await res.json();
      div.innerHTML = `
        <a href="/userInfo.html?user=${user.id}">
          ${escapeHtml(user.name)}
          (${escapeHtml(user.email)})
        </a>
        <a href="signout" class="btn btn-danger" role="button">Log out</a>
      `;
    } else {
      // We are not logged in
      div.innerHTML = `
        <a href="signin" class="btn btn-primary" role="button">Log in</a>
      `;
    }
  } catch (error) {
    div.innerHTML = `
      <div>
        <button onclick="loadIdentity()">retry</button>
        Error loading identity: <span id="identity_error_span"></span>
      </div>
    `;
    document.getElementById("identity_error_span").innerText = error;
  }
}
