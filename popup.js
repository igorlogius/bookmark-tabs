/* global browser */

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

function onChange(evt) {
  let id = evt.target.id;
  let el = document.getElementById(id);

  let value = el.type === "checkbox" ? el.checked : el.value;
  let obj = {};

  //console.log(id, value, el.type);
  if (value === "") {
    return;
  }
  if (el.type === "number") {
    try {
      value = parseInt(value);
      if (isNaN(value)) {
        value = el.min;
      }
      if (value < el.min) {
        value = el.min;
      }
    } catch (e) {
      value = el.min;
    }
  }

  obj[id] = value;

  browser.storage.local.set(obj).catch(console.error);
}

["noTimestampSubfolder", "saveFolder", "closeAfterSave"].map((id) => {
  browser.storage.local
    .get(id)
    .then((obj) => {
      let el = document.getElementById(id);
      let val = obj[id];

      if (typeof val !== "undefined") {
        if (el.type === "checkbox") {
          el.checked = val;
        } else {
          el.value = val;
        }
      }
      el.addEventListener("input", onChange);
    })
    .catch(console.error);
});

let folders = document.getElementById("saveFolder");

function recGetFolders(node, depth = 0) {
  let out = new Map();
  if (typeof node.url !== "string") {
    if (node.id !== "root________") {
      out.set(node.id, { depth: depth, title: node.title });
    }
    if (node.children) {
      for (let child of node.children) {
        out = new Map([...out, ...recGetFolders(child, depth + 1)]);
      }
    }
  }
  return out;
}

async function initSelect() {
  //console.debug("initSelect");
  const nodes = await browser.bookmarks.getTree();
  let out = new Map();
  let depth = 1;
  for (const node of nodes) {
    out = new Map([...out, ...recGetFolders(node, depth)]);
  }
  let tmp = await getFromStorage("string", "saveFolder", "unfiled_____");
  let last_val = "";
  for (const [k, v] of out) {
    //console.debug(v.title, k, tmp);
    //folders.add(new Option("-".repeat(v.depth) + " " + v.title, k));
    //folders.add(new Option(v.title + " (L" + (v.depth - 1) + ")", k));
    o = new Option(v.title, k);
    folders.add(o);
    if (k === tmp) {
      //o.selected = true;
      last_val = k;
    } /*else{
        o.selected = false;
    }*/
  }
  folders.value = last_val;
}

async function onLoad() {
  await initSelect();

  document.getElementById("savebtn").addEventListener("click", async (el) => {
    await browser.runtime.sendMessage({
      cmd: "bookmark-tabs",
      postfix: document.getElementById("postfix").value,
    });
  });

  document.getElementById("postfix").addEventListener("keyup", async (el) => {
    if (el.key === "Enter") {
      await browser.runtime.sendMessage({
        cmd: "bookmark-tabs",
        postfix: document.getElementById("postfix").value,
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", onLoad);
