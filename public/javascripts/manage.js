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
      if(orgInfo.due){
        document.getElementById("current-dues").innerText = "Amount: " + orgInfo.due.amount;
      } else {
        document.getElementById("current-dues").innerText = "None";
      }

      // Create member list
      for (const memberId of Object.keys(orgInfo.members)) {
        const member = await fetchJSON(`/api/user/${memberId}`);
        const memberName = member.name;
        const li = document.createElement("li");
        const myButton = document.createElement("button");
        myButton.id = memberId;
        li.addEventListener("click", onMemberButtonClick);
        const span = document.createElement("span");
        li.appendChild(span);
        span.innerText = "Name: " + memberName + " ID: " + memberId;
        const promoteButton = document.createElement("Button");

        document.getElementById("ul-members").appendChild(li);
      }
    } catch(e) {
      throw e;
    }
    console.log("Finished Org Details");
  }

  async function onMemberButtonClick(e) {
    // e.target.id === (memberId)
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
    window.location.href = '/';
    console.log("Club deleted");
  }

  async function onAddMember(){
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    let email = document.getElementById("add-user-email").value;
    let name = document.getElementById("add-user-name").value;

    try{
      console.log("Adding User to Club");
      await fetchJSON(`api/org/member`, {
        method: "POST",
        body: {email: email, name: name, orgId: orgId}
      });
      console.log("Added User");
    } catch(e) {
      throw e;
    }

    document.getElementById("add-user-email").value = "";
    document.getElementById("add-user-name").value = "";
    window.location.reload();
    //Can add a sentence that tells user the member has been add
  }


  async function onAddOfficer() {
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org')
    let officerId = document.getElementById("add-officer-id").value;

    try{
      console.log("Adding Officer to Club");
      await fetchJSON(`api/org/officer`, {
        method: "POST",
        body: {id: officerId, org: org}
      });
      console.log("Added Officer");
    } catch(e) {
      throw e;
    }
    window.location.reload();
    document.getElementById("add-officer-email").value = "";
    document.getElementById("add-officer-name").value = "";
  }

  async function onChangeClubDues(){
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org');
    let amount = document.getElementById("change-club-dues").value;
    let duesSchedule = document.getElementById("change-club-dues-schedule").value;

    try{
      console.log("Changing Club dues");
      await fetchJSON(`api/org/dues`, {
        method: "POST",
        body: {amount : amount, schedule: duesSchedule, org: org}
      });
      console.log("Changed Club Dues");
    } catch(e) {
      throw e;
    }

    document.getElementById("change-club-dues").value = "";
    document.getElementById("change-club-dues-schedule").value = "";
    window.location.reload();
  }
})();