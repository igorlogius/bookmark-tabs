/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;
let multipleHighlighted = false;

async function notify(message, iconUrl = "icon.png") {
  try {
    const n = await browser.notifications.create("" + Date.now(), {
      type: "basic",
      iconUrl,
      title: extname,
      message,
    });

    setTimeout(() => {
      browser.notifications.clear(n);
    }, 3000);
  } catch (e) {
    // noop
  }
}

async function getFromStorage(expectedtype, storeid, fallback) {
  return await (async () => {
    try {
      let tmp = await browser.storage.local.get(storeid);
      //console.debug(storeid, tmp);
      if (typeof tmp[storeid] === expectedtype) {
        return tmp[storeid];
      }
    } catch (e) {
      console.error(e);
    }
    return fallback;
  })();
}

// add zero padding
function pad(val) {
  return (val < 10 ? "0" : "") + val;
}

function getTimeStampStr() {
  const now = new Date();

  const YY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());

  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return YY + "-" + MM + "-" + DD + " " + hh + ":" + mm + ":" + ss;
}

async function save() {
  const tabs = await (async () => {
    try {
      let queryObj = {
        url: ["http://*/*", "https://*/*"],
        currentWindow: true,
        hidden: false,
      };
      if (multipleHighlighted) {
        queryObj["highlighted"] = true;
      }
      return await browser.tabs.query(queryObj);
    } catch (e) {
      console.error(e);
      return null;
    }
  })();

  if (tabs === null) {
    return 0;
  }
  if (tabs.length < 1) {
    return 0;
  }

  // get or save Folder
  const saveFolderBM = await (async () => {
    const saveFolderId = await getFromStorage(
      "string",
      "saveFolder",
      "unfiled_____"
    );
    // search
    try {
      const arr = await browser.bookmarks.get(saveFolderId);
      if (arr.length > 0) {
        return arr[0];
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  })();
  if (saveFolderBM === null) {
    return 0;
  }

  // create timestamp save folder
  let tsBM = await (async () => {
    try {
      return await browser.bookmarks.create({
        parentId: saveFolderBM.id,
        title: getTimeStampStr(),
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  })();
  if (tsBM === null) {
    return 0;
  }

  // save each tab into the created folder
  tabs.forEach(async (tab) => {
    let bmCreateData = {
      parentId: tsBM.id,
      url: tab.url,
    };
    if (typeof tab.title === "string" && tab.title.trim() !== "") {
      bmCreateData["title"] = tab.title;
    }
    await browser.bookmarks.create(bmCreateData);
  });
  // return amount of bookmarks
  return tabs.length;
}

async function saveAll() {
  await browser.browserAction.disable();
  const nbtabs = await save();
  notify("Saved " + nbtabs + " Tabs");
  setTimeout(() => {
    browser.browserAction.enable();
  }, 3000);
}

browser.browserAction.onClicked.addListener(saveAll);

function handleHighlighted(highlightInfo) {
  multipleHighlighted = highlightInfo.tabIds.length > 1;
}

browser.tabs.onHighlighted.addListener(handleHighlighted);
