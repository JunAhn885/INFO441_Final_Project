"use strict";

import { loadIdentity } from "./identity.js";
import { fetchJSON, fromNow, id } from "./utils.js";

(async () => {
  let orgId;

  window.addEventListener("load", init);

  async function init() {
    id("form-add-event").addEventListener("submit", onFormSubmit);

    await loadIdentity();
    await loadEvents();
  }

  async function loadEvents() {
    const urlParams = new URLSearchParams(window.location.search);
    orgId = urlParams.get("orgId");
    if (!orgId) {
      // Invalid visit
      return;
    }
    
    const org = await fetchJSON(`/api/org/${orgId}`);
    const events = await fetchJSON(`/api/event/${orgId}`);

    id("h2-org-name").textContent = org.name;

    const memberCount = Object.keys(org.members).length;
    const table = document.querySelector("#table-org-events > tbody");
    table.innerHTML = null;

    for (const event of events) {
      // Create rows of events
      const row = table.insertRow();
      row.id = event.id;
      const name = row.insertCell();
      name.textContent = event.name;
      const starts = row.insertCell();
      const startsAt = new Date(event.timeNotBefore);
      starts.textContent = `${startsAt.toLocaleString()} (${fromNow(startsAt)})`;
      const ends = row.insertCell();
      const endsAt = new Date(event.timeNotAfter);
      ends.textContent = `${endsAt.toLocaleString()} (${fromNow(endsAt)})`;
      const attendance = row.insertCell();
      if (event.attendances) {
        const attendCount = Object.keys(event.attendances).length;
        const ratio = `${(attendCount / memberCount * 100).toFixed(2)}%`;
        attendance.textContent = `${attendCount} / ${memberCount} (${ratio})`;
      } else {
        attendance.textContent = `0 / ${memberCount} (0.00%)`;
      }

      // Also create buttons
      const viewButton = document.createElement("button");
      viewButton.textContent = "View";
      viewButton.classList.add("btn", "btn-primary");
      viewButton.addEventListener("click", onEventView);
      viewButton.setAttribute("data-bs-toggle", "collapse");
      viewButton.setAttribute("data-bs-target", `#collapse-${event.id}`);
      const edit = row.insertCell();
      edit.appendChild(viewButton);
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("btn", "btn-danger");
      deleteButton.addEventListener("click", onEventDelete);
      const delete_ = row.insertCell();
      delete_.appendChild(deleteButton);

      // Create another row for collapsible
      const hiddenRow = table.insertRow();
      hiddenRow.classList.add("row-collapsible");
      const hiddenCell = hiddenRow.insertCell();
      hiddenCell.colSpan = 6;
      const div = document.createElement("div");
      div.id = `collapse-${event.id}`;
      div.classList.add("collapse", "card", "card-body");
      const caption = document.createElement("h3");
      caption.innerText = "Scan to check in";
      div.appendChild(caption);
      const qrDiv = document.createElement("div");
      div.appendChild(qrDiv);
      const qr = new QRCode(qrDiv, {
        text: window.location.origin + `/direct/checkin/${event.key}`,
        width: 256,
        height: 256,
        colorDark : "#4b2e83",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
      hiddenCell.appendChild(div);
    }
  }

  async function onEventView() {
    // ...
  }

  async function onEventDelete() {
    const eventId = this.parentElement.parentElement.id;  // ID is on <tr>
    try {
      await fetch(`/api/event/${orgId}/${eventId}`, {
        method: "DELETE"
      });

      id("em-modify-result").textContent = "Success! Reloading events."
      await loadEvents();
      id("em-modify-result").textContent = null;
    } catch (e) {
      id("em-modify-result").textContent = `Error deleting event: ${e}`;
    }
  }

  async function onFormSubmit(e) {
    e.preventDefault();

    try {
      await fetchJSON(`/api/event/${orgId}`, {
        method: "POST",
        body: Object.fromEntries(new FormData(e.target))
      });

      id("em-form-result").textContent = "Success! Reloading events.";
      await loadEvents();
      id("em-form-result").textContent = null;
    } catch (e) {
      id("em-form-result").textContent = `Error adding event: ${e}`;
    }
  }
})();