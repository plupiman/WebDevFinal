let API_URL = "https://api.opendota.com/api/";
var matchInfo = [];
var iteration = 0;
function setup(){
    let dotaID = localStorage.getItem("dotaID");
	
	//testing requesthandler
	const requestHandler = new RequestHandler();

	let url = API_URL + "players/" + dotaID + "/";

	document.getElementById("loader").innerHTML = '<div class="sk-cube-grid"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div><div class="sk-cube sk-cube3"></div><div class="sk-cube sk-cube4"></div><div class="sk-cube sk-cube5"></div><div class="sk-cube sk-cube6"></div><div class="sk-cube sk-cube7"></div><div class="sk-cube sk-cube8"></div><div class="sk-cube sk-cube9"></div></div>';

	//this is how u make a request so u dont have to do the onreadystate change thing every time
	//gets information from 
	requestHandler.makeRequest("GET", url, function personaName(data) {
		const player = JSON.parse(data);
		let profile = player.profile;
		document.getElementById("personaName").innerHTML = profile.personaname;
		document.getElementById("profilePic").src = profile.avatarmedium;
		winLoss(url, requestHandler);
	});

	getRecentMatches(url, requestHandler, matchInfo);


	//requestHandler = new RequestHandler();
	//requestHandler.makeRequest("GET", url, )
	
}

function winLoss(url, requestHandler) {
	requestHandler.makeRequest("GET", url + "wl", function getWinLoss(data) {
		let wl = JSON.parse(data);
		document.getElementById("win").innerHTML = "Wins: " +  wl.win;
		document.getElementById("loss").innerHTML = "Losses: " + wl.lose;
		document.getElementById("loader").innerHTML = "";
	});
}

function getRecentMatches(url, requestHandler, matchInfo) {
	requestHandler.makeRequest("GET", url + "recentmatches", function (data) {
		let matchStats = JSON.parse(data);
		let matchArray = [];
		console.log(matchStats);
		console.log(matchStats[0].match_id);
		for (let i = 0; i < 15 ; i++){
			var curMatch = matchStats[i];
			matchArray.push({matchID : curMatch.match_id, 
			kills: curMatch.kills,
			deaths: curMatch.deaths,
			assists: curMatch.assists});
		}
		heroNameIDFetch(matchStats, requestHandler, url);
	});
}

function heroNameIDFetch(matchStats, requestHandler, url){
	console.log(matchInfo);
	let heroNamesToID = [];
	requestHandler.makeRequest("GET", API_URL + "heroes", function getHeroStats(data) {
		let heroNames = JSON.parse(data);
		console.log(heroNames);
		for (let i = 0; i < heroNames.length ; i++){
			heroNamesToID.push({name: heroNames[i].localized_name,
								id: heroNames[i].id});
		}
		matchStatsFetch(matchStats, requestHandler, url, heroNamesToID)
	});
}
function matchStatsFetch(matches, requestHandler, url, heroNamesToID){
	console.log(heroNamesToID);
	for (let i = 0 ; i < 20 ; i++){
		requestHandler.makeRequest("GET", API_URL + "matches/" + matches[i].match_id, function (data){
			let indivMatchData = JSON.parse(data);
			let hasFound = false;
			let playerValue = 0;
			while (hasFound != true){
				if (indivMatchData.players[playerValue].player_slot == matches[i].player_slot){
					hasFound = true;
				} else {
					playerValue++;
				}
			}		
			/*matchInfo.push({matchID : matches[i].match_id,
							hero : indivMatchData.players[playerValue].hero_id,
							kills : indivMatchData.players[playerValue].kills,
							deaths: indivMatchData.players[playerValue].deaths,
							assists: indivMatchData.players[playerValue].assists,
							seconds: indivMatchData.players[playerValue].duration,
							result: indivMatchData.radiant_win,
							usage_5 : indivMatchData.players[playerValue].item_5});*/
			//matchInfo = matchData;
			let heroNameForMatch = "";
			for (let j = 0 ; j < 115 ; j++){
				if(heroNamesToID[j].id == indivMatchData.players[playerValue].hero_id){
					heroNameForMatch = heroNamesToID[j].name;
					j = 999;
				}
				
			}
			console.log(indivMatchData.players[playerValue].item_5 );
			createMatchTable(document.getElementById("matchTable"),{matchID : matches[i].match_id,
																		hero : heroNameForMatch,
																		kills : indivMatchData.players[playerValue].kills,
																		deaths: indivMatchData.players[playerValue].deaths,
																		assists: indivMatchData.players[playerValue].assists,
																		seconds: indivMatchData.players[playerValue].duration,
																		result: indivMatchData.radiant_win,
																		usage_5 : indivMatchData.players[playerValue].item_5 + 0} );
		});
	}
}

class RequestHandler {
	makeRequest(method, url, handler) {
		let request = new XMLHttpRequest();
		request.onreadystatechange = function handleReady() {
			if (this.readyState == 4 && this.status == 200) {
				handler(this.responseText);
			}
		}
		request.open(method, url, true);
		request.send();
	}
}


function createMatchTable(table, matchJSON){
	console.log(table);
	console.log(iteration);
	var row = table.insertRow(iteration+1);
	console.log(matchJSON);
	var heroCell = row.insertCell(0);
	heroCell.innerHTML = matchJSON.hero;
	var DeathCell = row.insertCell(1);
	DeathCell.innerHTML = matchJSON.deaths;
	var KillsCell = row.insertCell(2);
	KillsCell.innerHTML = matchJSON.kills;
	var AssistsCell = row.insertCell(3);
	AssistsCell.innerHTML = matchJSON.assists;
	var durationCell = row.insertCell(4);
	durationCell.innerHTML = Math.round(matchJSON.seconds/60)+":"+matchJSON.seconds % 60
	var resultCell = row.insertCell(5);
	if (matchJSON.result == true){
		resultCell.innerHTML = "Radiant Victory";
	} else {
		resultCell.innerHTML = "Dire Victory";
	}
	var item5Cell = row.insertCell(6);
	item5Cell.innerHTML = matchJSON.usage_5;
	iteration++;
}

function sortTable(n) {
	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
	table = document.getElementById("matchTableContainer");
	firstRow = table.getElementsByTagName("TR")[0];
	firstRow.cells[0].style.color= "black";
	firstRow.cells[1].style.color= "black";
	firstRow.cells[2].style.color= "black";
	firstRow.cells[3].style.color= "black";
	firstRow.cells[4].style.color= "black";
	firstRow.cells[5].style.color= "black";
	firstRow.cells[6].style.color= "black";
	firstRow.cells[n].style.color= "red";
	switching = true;
	//Set the sorting direction to ascending:
	dir = "asc"; 
	/*Make a loop that will continue until
	no switching has been done:*/
	while (switching) {
	  //start by saying: no switching is done:
	  switching = false;
	  rows = table.getElementsByTagName("TR");
	  /*Loop through all table rows (except the
	  first, which contains table headers):*/
	  for (i = 1; i < (rows.length - 1); i++) {
		//start by saying there should be no switching:
		shouldSwitch = false;
		/*Get the two elements you want to compare,
		one from current row and one from the next:*/
		x = rows[i].getElementsByTagName("TD")[n];
		y = rows[i + 1].getElementsByTagName("TD")[n];
		/*check if the two rows should switch place,
		based on the direction, asc or desc:*/
		if (n == 0 | n == 5){
			if (dir == "asc") {
				if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
					//if so, mark as a switch and break the loop:
					shouldSwitch= true;
					break;
				}
			} else if (dir == "desc") {
				if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
					//if so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			}
		} else {
			if (dir == "asc") {
				if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
					//if so, mark as a switch and break the loop:
					shouldSwitch= true;
					break;
				}
			} else if (dir == "desc") {
				if ((parseInt(x.innerHTML) < parseInt(y.innerHTML))) {
					//if so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			}
		}
	  }
	  if (shouldSwitch) {
		/*If a switch has been marked, make the switch
		and mark that a switch has been done:*/
		rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
		switching = true;
		//Each time a switch is done, increase this count by 1:
		switchcount ++;      
	  } else {
		/*If no switching has been done AND the direction is "asc",
		set the direction to "desc" and run the while loop again.*/
		if (switchcount == 0 && dir == "asc") {
		  dir = "desc";
		  switching = true;
		}
	  }
	}
  }
setup();
