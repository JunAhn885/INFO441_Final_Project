"use strict";

import { loadIdentity } from "./identity.js";
import { fetchJSON } from "./utils.js";

(async () => {
  window.addEventListener("load", init);

  async function init(){
    console.log("initializing");
    await loadIdentity();
    loadClubs();

    document.getElementById("btn-create-club").addEventListener("click", onCreateClub);
    document.getElementById("btn-manage-club").addEventListener("click", onManage);
  }

  async function loadClubs() {
    try {
      console.log('Loading joined clubs');
      let clubsJSON = await fetchJSON(`api/org`);
      let eachClub = clubsJSON.map(club => {
        console.log(club);
        return `
        <div>
          ${club.name}
          <a href="/manage.html?org=${encodeURIComponent(club.id)}"><button id="btn-manage-club">Manage Club</button></a>
        </div>
        `
      }).join('\n');
      document.getElementById("user-clubs").innerHTML = eachClub;
    } catch (e) {
      throw e;
    }
  }

  async function onCreateClub(){
    let clubName = document.getElementById("clubName").value;

    try{
      console.log("Creating Club");
      await fetchJSON(`api/org`, {
        method: "POST",
        body: {name: clubName}
      });
      console.log("Created Club");
    } catch(e) {
      throw e;
    }
    document.getElementById("clubName").value = "";
  }

  // async function onManage() {
  //   try {
  //     export function
  //   } catch (e) {
  //     throw e;
  //   }
  // }
})();