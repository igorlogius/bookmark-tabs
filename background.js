
//add listener 
browser.browserAction.onClicked.addListener(async (tab) => {

	// get timestamp
	const now = new Date();
	const date = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
	const time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	const dateTime = date + ' ' + time;

	// use timestamp as foldername
	const foldername = dateTime;

	// create folder
	const treenode = await browser.bookmarks.create({ 
		'title': foldername 
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

