"use strict";

import { loadIdentity } from "./identity.js";
import { fetchJSON } from "./utils.js";

(async () => {
  window.addEventListener("load", init);

  async function init(){
    console.log("initializing");
    await loadIdentity();
    loadOrgDetails();

    document.getElementById("btn-delete-club").addEventListener("click", onDeleteClub);
    document.getElementById("btn-add-member").addEventListener("click", onAddMember);
    document.getElementById("btn-add-officer").addEventListener("click", onAddOfficer);
    document.getElementById("btn-change-club-dues").addEventListener("click", onChangeClubDues);
  }

  async function loadOrgDetails(){
    console.log("Loading Org Details");
    try{
      const urlParams = new URLSearchParams(window.location.search);
      const orgID = urlParams.get('org');
      let orgInfo = await fetchJSON(`api/org/${orgID}`);
      document.getElementById("club-name").innerText = orgInfo.name;

      // Create member list
      for (const memberId of Object.keys(orgInfo.members)) {
        const member = await fetchJSON(`/api/user/${memberId}`);
        const memberName = member.name;
        const li = document.createElement("li");
        const span = document.createElement("span");
        li.appendChild(span);
        span.innerText = memberName;
        document.getElementById("ul-members").appendChild(li);
      }
    } catch(e) {
      throw e;
    }
    console.log("Finished Org Details");
  }

  async function onDeleteClub(){
    console.log("Deleting Club");
    try{
      const urlParams = new URLSearchParams(window.location.search);
      const orgID = urlParams.get('org');
      await fetchJSON(`api/org/delete`, {
        method: "DELETE",
        body: {org: orgID}
      });
    } catch(e) {
      throw e;
    }
    console.log("Club deleted");
  }

  async function onAddMember(){
    try{
      const urlParams = new URLSearchParams(window.location.search);
      const org = urlParams.get('org');
      let email = document.getElementById("add-user-email").value;
      let name = document.getElementById("add-user-name").value;
      console.log("Added User to Userbase");
      await fetchJSON("api/org/addMember", {
        method: "POST",
        body: {email: email, name: name, org: org}
      });
      console.log("Added User to org");
    } catch(e) {
      throw e;
    }

    document.getElementById("add-user-email").value = "";
    document.getElementById("add-user-name").value = "";
  }


  async function onAddOfficer() {
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org')
    let email = document.getElementById("add-officer-email").value;
    let name = document.getElementById("add-officer-name").value;

    try{
      console.log("Adding Officer to Club");
      await fetchJSON(`api/org/addOfficer`, {
        method: "POST",
        body: {name: name, email : email, org: org}
      });
      console.log("Added Officer");
    } catch(e) {
      throw e;
    }

    document.getElementById("add-officer-email").value = "";
    document.getElementById("add-officer-name").value = "";
  }

  async function onChangeClubDues(){
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org');
    let dues = document.getElementById("change-club-dues").value;
    let duesSchedule = document.getElementById("change-club-dues-schedule").value;

    try{
      console.log("Changing Club dues");
      await fetchJSON(`api/org`, {
        method: "POST",
        body: {dues: dues, duesSchedule: duesSchedule, org: org} //dues: dues, schedule: duesSchedule
      });
      console.log("Changed Club Dues");
    } catch(e) {
      throw e;
    }

    document.getElementById("change-club-dues").value = "";
    document.getElementById("change-club-dues-schedule").value = "";
  }
})();