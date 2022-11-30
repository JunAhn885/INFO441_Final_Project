"use strict";

import { loadIdentity } from "./identity.js";

(async () => {
  window.addEventListener("load", init);

  async function init(){
    console.log("initializing");
    await loadIdentity();
  }
})();
