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
      const orgId = urlParams.get('org');
      let orgInfo = await fetchJSON(`api/org/${orgId}`);
      document.getElementById("club-name").innerText = orgInfo.name;
      if(orgInfo.due){
        document.getElementById("current-dues").innerText = "Amount: " + orgInfo.due.amount;
      } else {
        document.getElementById("current-dues").innerText = "None";
      }

      for (const memberId of Object.keys(orgInfo.members)) {
        const member = await fetchJSON(`/api/user/${memberId}`);
        var memberName = member.name;

        // if(orgInfo.members.memberId.tags._owner){
        //   var promote = "Officer";
        //   var kick = "N/A";
        // } else {
        //   var promote = document.createElement("button");
        //   promote.id = memberId;
        //   promote.innerText = "Promote";
        //   promote.addEventListener("click", onMemberPromoteClick);

        //   var kick = document.createElement("button");
        //   kick.id = memberId;
        //   kick.innerText = "Kick";
        //   kick.addEventListener("click", onMemberKickClick);
        // }

        // if(orgInfo.members.memberId.tags._unverified){
        //   var due = document.createElement("button");
        //   due.id = memberId;
        //   due.innerText = "Mark Due";
        //   due.addEventListener("click", onMemberDueClick);
        // } else if(member.tags._verified) {
        //   var due = "Paid";
        // } else {
        //   var due = "None";
        // }

        var promote = document.createElement("button");
        promote.id = memberId;
        promote.innerText = "Promote";
        promote.addEventListener("click", onMemberPromoteClick);

        var kick = document.createElement("button");
        kick.id = memberId;
        kick.innerText = "Kick";
        kick.addEventListener("click", onMemberKickClick);

        var due = document.createElement("button");
        due.id = memberId;
        due.innerText = "Mark Due";
        due.addEventListener("click", onMemberDueClick);

        var table = document.getElementById(`member-info`);

        var newRow = table.insertRow(-1);

        var cell = newRow.insertCell(0);
        var cell1 = newRow.insertCell(1);
        var cell2 = newRow.insertCell(2);
        var cell3 = newRow.insertCell(3);
        var cell4 = newRow.insertCell(4);

        cell.innerHTML = memberId;
        cell1.innerHTML = memberName;
        cell2.appendChild(due);
        cell3.appendChild(kick);
        cell4.appendChild(promote);
      }
    } catch(e) {
      throw e;
    }
    console.log("Finished Org Details");
  }

  async function onMemberPromoteClick() {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    try{
      await fetchJSON(`api/org/officer`, {
        method: "POST",
        body: {member: this.id, orgId: orgId}
      });
      window.location.reload();
    } catch(e) {
      throw e;
    }
  }

  async function onMemberKickClick() {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    try{
      await fetchJSON(`api/org/member`, {
        method: "DELETE",
        body: {member: this.id, orgId: orgId}
      });
      window.location.reload();
    } catch(e) {
      throw e;
    }
  }

  // Change the member's status to verified member after they pay dues
  async function onMemberDueClick() {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('org');
    try{
      await fetchJSON(`api/org/dues/paid`, {
        method: "POST",
        body: {member: this.id, orgId: orgId}
      });
      window.location.reload();
    } catch(e) {
      throw e;
    }
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

    try{
      console.log("Changing Club dues");
      await fetchJSON(`api/org/dues`, {
        method: "POST",
        body: {amount : amount, org: org}
      });
      console.log("Changed Club Dues");
    } catch(e) {
      throw e;
    }

    document.getElementById("change-club-dues").value = "";
    window.location.reload();
  }
})();