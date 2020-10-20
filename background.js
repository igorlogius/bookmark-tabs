
//add listener to browser button
browser.browserAction.onClicked.addListener(async function(tab) {

	// gen foldername
	const now = new Date();
	const date = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
	const time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	const dateTime = date+' '+time;

	const foldername = dateTime;

	//console.log(foldername);

	if(foldername === '') {return;}

	const treenode = await browser.bookmarks.create({
		'title': foldername
	});

	//on click get all open tabs
	const tabs = await browser.tabs.query({});

	tabs.forEach(function(tab) {

		//enclosed return function
		var searchRet = (function(page){
			return (function(res){
				//save page only if not exist
				if(res.length < 1){
					console.log(page.title, page.url);
					browser.bookmarks.create({'parentId': treenode.id,
						'title': page.title, 'url': page.url});
				}
			});
		})(tab);

		//search each url if already exist
		browser.bookmarks.search(tab.url, searchRet);
	});

});
