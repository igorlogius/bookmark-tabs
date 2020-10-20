
// add zero padding
function pad (val) { return ((val < 10)?"0":"") + val; }

//add listener 
browser.browserAction.onClicked.addListener(async (tab) => {

	// get timestamp
	const now = new Date();

	const YY = now.getFullYear();
	const MM = pad((now.getMonth()+1));
	const DD = pad(now.getDate());

	const hh = pad(now.getHours());
	const mm = pad(now.getMinutes());
	const ss = pad(now.getSeconds());

	const ts = YY+'-'+MM+'-'+DD+' '+hh+":"+mm+":"+ss;

	// create folder
	const treenode = await browser.bookmarks.create({ 
		'title': ts
	});

	//on click get all open tabs
	const tabs = await browser.tabs.query({});

	tabs.forEach( (tab) => {
		browser.bookmarks.create({
			'parentId': treenode.id
			,'url': tab.url
		});
	});
});

