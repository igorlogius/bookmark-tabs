
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

	// create folder
	const treenode = await (async ()=> {
		try {
			return await browser.bookmarks.create({'title': getTimeStampStr() });
		}catch(error){
			console.error(error);
			return null;
		}
	})();
	if (treenode === null){return;}
	// save each tab into the created folder
	tabs.forEach( async (tab) => {
		// only include http and https pages
		//if( /^https?:\/\//.test(tab.url) ){
			await browser.bookmarks.create({
				'parentId': treenode.id
				,'url': tab.url
			});
		//}
	});
	//
}
//add listener
browser.browserAction.onClicked.addListener(save);

/*
browser.menus.create({
  id: 'save-tabs-to-bookmark-folder',
  title: 'Save tabs to bookmark folder',
  contexts: ["all"],
  onclick: save
});
*/
