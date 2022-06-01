
async function getFromStorage(storeid,fallback) {
	return (await (async () => {
		try {
			let tmp = await browser.storage.local.get(storeid);
			console.log(JSON.stringify(tmp));
			if (typeof tmp[storeid] !== 'undefined'){
				return tmp[storeid];

			}
        }catch(e){
			console.error(e);
		}
		return fallback;
	})());
}

// add zero padding
function pad (val) { return ((val < 10)?"0":"") + val; }

function getTimeStampStr() {

	const now = new Date();

	const YY = now.getFullYear();
	const MM = pad((now.getMonth()+1));
	const DD = pad(now.getDate());

	const hh = pad(now.getHours());
	const mm = pad(now.getMinutes());
	const ss = pad(now.getSeconds());

	return YY+'-'+MM+'-'+DD+' '+hh+":"+mm+":"+ss;
}

async function save() {
    // get open tabs
    const tabs = await (async () => {
        try {
            // save everything
            const saveHidden = await getFromStorage('saveHidden', false)
            if(saveHidden){
                return await browser.tabs.query({
                    url: ["http://*/*", "https://*/*"]
                });
            }
            // normally people want to save what they see are focused on
            return await browser.tabs.query({
                hidden: false,
                currentWindow: true,
                url: ["http://*/*", "https://*/*"]
            });
        }catch(error){
            console.log(error);
            return null;
        }
    })();
    if(tabs === null){return;}
    if(tabs.length < 1){return;}

    // get or create parent save folder
    const saveFolderBM = await (async ()=> {
        const saveFolder = await getFromStorage('saveFolder', 'Saved Tabs')
        // search
        try {
            const arr = await browser.bookmarks.search({'title': saveFolder });
            if( arr.length > 0){
                return arr[0];
            }
        }catch(error){
            console.error(error);
        }
        // create
        try {
            return await browser.bookmarks.create({'title': saveFolder });
        }catch(error){
            console.error(error);
            return null;
        }
    })();
    if (saveFolderBM === null){return;}

    // create timestamp save folder
    let tsBM = await (async ()=> {
        try {
            return await browser.bookmarks.create({'parentId': saveFolderBM.id, 'title': getTimeStampStr() });
        }catch(error){
            console.error(error);
            return null;
        }
    })();
    if (tsBM === null){return;}

    // save each tab into the created folder
    tabs.forEach( async (tab) => {
        await browser.bookmarks.create({
            'parentId': tsBM.id
            ,'url': tab.url
        });
    });
    // done
}


async function save_selected() {
    // get open tabs
    const tabs = await (async () => {
        try {
            // save highlighted tabs
            return await browser.tabs.query({
                highlighted: true,
                currentWindow: true,
                url: ["http://*/*", "https://*/*"]
            });
        }catch(error){
            console.log(error);
            return null;
        }
    })();
    if(tabs === null){return;}
    if(tabs.length < 1){return;}

    // get or create parent save folder
    const saveFolderBM = await (async ()=> {
        const saveFolder = await getFromStorage('saveFolder', 'Saved Tabs')
        // search
        try {
            const arr = await browser.bookmarks.search({'title': saveFolder });
            if( arr.length > 0){
                return arr[0];
            }
        }catch(error){
            console.error(error);
        }
        // create
        try {
            return await browser.bookmarks.create({'title': saveFolder });
        }catch(error){
            console.error(error);
            return null;
        }
    })();
    if (saveFolderBM === null){return;}

    // create timestamp save folder
    let tsBM = await (async ()=> {
        try {
            return await browser.bookmarks.create({'parentId': saveFolderBM.id, 'title': getTimeStampStr() });
        }catch(error){
            console.error(error);
            return null;
        }
    })();
    if (tsBM === null){return;}

    // save each tab into the created folder
    tabs.forEach( async (tab) => {
        await browser.bookmarks.create({
            'parentId': tsBM.id
            ,'url': tab.url
        });
    });
    // done
}

//add listener
browser.browserAction.onClicked.addListener(save);

browser.menus.create({
  id: 'save-tabs-to-bookmark-folder-selected',
  title: 'Save Selected Tabs to Bookmark Folder',
  contexts: ["tab"],
  onclick: save_selected
});


browser.menus.create({
  id: 'save-tabs-to-bookmark-folder-all',
  title: 'Save All Tabs to Bookmark Folder',
  contexts: ["all"],
  onclick: save
});
