/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;
let multipleHighlighted = false;

async function showNotification(title,message){
        const options = {
                "type": "basic",
                "iconUrl": browser.runtime.getURL("icon.png"),
                "title": "Save Tabs to Bookmark Folder",
                "message": message
        };
        try {
                const nID = await browser.notifications.create(extname, options);
                setTimeout(() => {
                    browser.notifications.clear(nID);
                },6*1000);
        }catch(err){
                console.error(err);
        }
        return null;
}

async function getFromStorage(storeid,fallback) {
	return (await (async () => {
		try {
			let tmp = await browser.storage.local.get(storeid);
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

    const tabs = await (async () => {
        try {
            let queryObj = {
                "url": ["http://*/*", "https://*/*"],
                "currentWindow": true
            };
            if(multipleHighlighted) {
                queryObj["highlighted"] = true;
            }
            return await browser.tabs.query(queryObj);
        }catch(e){
            console.error(e);
            return null;
        }
    })();

    if(tabs === null){return 0;}
    if(tabs.length < 1){return 0;}

    // get or create parent save folder
    const saveFolderBM = await (async ()=> {
        const saveFolder = await getFromStorage('saveFolder', 'Saved Tabs')
        // search
        try {
            const arr = await browser.bookmarks.search({'title': saveFolder });
            if( arr.length > 0){
                return arr[0];
            }
        }catch(e){
            console.error(e);
        }
        // create
        try {
            return await browser.bookmarks.create({'title': saveFolder });
        }catch(e){
            console.error(e);
            return null;
        }
    })();
    if (saveFolderBM === null){return 0;}

    // create timestamp save folder
    let tsBM = await (async ()=> {
        try {
            return await browser.bookmarks.create({'parentId': saveFolderBM.id, 'title': getTimeStampStr() });
        }catch(e){
            console.error(e);
            return null;
        }
    })();
    if (tsBM === null){return 0;}

    // save each tab into the created folder
    tabs.forEach( async (tab) => {
        await browser.bookmarks.create({
            'parentId': tsBM.id
            ,'url': tab.url
        });
    });
    // return amount of bookmarks
    return tabs.length;
}

async function saveAll(){
    const nbtabs = await save();
    showNotification("", "#Tabs Saved: " + nbtabs);
}

browser.browserAction.onClicked.addListener(saveAll);

function handleHighlighted(highlightInfo) {
    multipleHighlighted = (highlightInfo.tabIds.length > 1);
}

browser.tabs.onHighlighted.addListener(handleHighlighted);

