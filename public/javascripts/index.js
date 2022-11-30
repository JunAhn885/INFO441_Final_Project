"use strict";

import { loadIdentity } from "./identity.js";
import { fetchJSON } from "./utils.js";

(async () => {
  window.addEventListener("load", init);

  async function init(){
    console.log("initializing");
    await loadIdentity();

    document.getElementById("btn-create-club").addEventListener("click", onCreateClub);
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
})();