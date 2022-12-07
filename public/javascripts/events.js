"use strict";

import { loadIdentity } from "./identity.js";
import { fetchJSON, fromNow, id } from "./utils.js";

(async () => {
  window.addEventListener("load", init);

  async function init() {
    await loadIdentity();
    await loadEvents();
  }

  async function loadEvents() {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get("orgId");
    if (!orgId) {
      // Invalid visit
      return;
    }
    
    const org = await fetchJSON(`/api/org/${orgId}`);
    const events = await fetchJSON(`/api/event/${orgId}`);

    const memberCount = Object.keys(org.members).length;
    const table = id("table-org-events");
    for (const event of events) {
      // Create rows of events
      const row = table.insertRow();
      row.id = event.id;
      const name = row.insertCell();
      name.innerText = event.name;
      const starts = row.insertCell();
      const startsAt = new Date(event.timeNotBefore);
      starts.innerText = `${startsAt.toLocaleString()} (${fromNow(startsAt)})`;
      const ends = row.insertCell();
      const endsAt = new Date(event.timeNotAfter);
      ends.innerText = `${endsAt.toLocaleString()} (${fromNow(endsAt)})`;
      const attendance = row.insertCell();
      if (event.attendances) {
        const attendCount = Object.keys(event.attendances).length;
        const ratio = `${(attendCount / memberCount * 100).toFixed(2)}%`;
        attendance.innerText = `${attendCount} / ${memberCount} (${ratio})`;
      } else {
        attendance.innerText = `0 / ${memberCount} (0.00%)`;
      }

      // Also create buttons
      const editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.classList.add("btn", "btn-primary");
      editButton.addEventListener("click", onEventEdit);
      const edit = row.insertCell();
      edit.appendChild(editButton);
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.classList.add("btn", "btn-danger");
      deleteButton.addEventListener("click", onEventDelete);
      const delete_ = row.insertCell();
      delete_.appendChild(deleteButton);
    }
  }

  async function onEventEdit() {
    // ...
  }

  async function onEventDelete() {
    // ...
  }
})();