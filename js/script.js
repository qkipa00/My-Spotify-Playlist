var searchBtn = $('#search');
var searchInput = $('#search-input');
var results = $('#results');
var playlist = $('#playlist');


var clientId = '99ec5f87417540d58f7ea0523ff0c9d3';
var redirectUri = 'https://qkipa00.github.io/My-Spotify-Playlist/';
var accessToken;
var scopes = 'user-read-private playlist-modify-private playlist-modify-public';


var searchlistArr = [];
var playlistArr = [];


getAccessToken();


if (window.localStorage.searchValue !== '' ){
	
	search(window.localStorage.searchValue);

}


$('#search').click(function(event){
	event.preventDefault(); 
	
	var searchInputVal = searchInput.val();

	if(accessToken){

		search(searchInputVal);
		
	} else {
	
		getAccessToken()
	}
})



function getAccessToken() {

	if( accessToken ){ 
		return accessToken; 
	} else { 

		if(window.location.href.match(/access_token=([^&]*)/)){ 

			tokenDeadline();

			return accessToken = window.location.href.match(/access_token=([^&]*)/)[1];

		} else { 
				
				window.localStorage.setItem('searchValue', searchInput.val() );
				window.location = 'https://accounts.spotify.com/authorize?client_id='+clientId+'&redirect_uri='+redirectUri+'&scope='+scopes+'&response_type=token';

		}

	}
}


function tokenDeadline() {

	expirationTime = parseFloat(window.location.href.match(/expires_in=([^&]*)/)[1];
	window.setTimeout(() => { 
		accessToken = '';
		window.history.pushState('Access Token', null, '/My-Spotify-Playlist/'); 
	}, expirationTime * 10); 
}


function search(text) {
	
	if(searchInput.val().length !== 0 || window.localStorage.searchValue !== ''){
		results.html(''); 
			
		$.ajax({ 

			url: 'https://api.spotify.com/v1/search?type=track&q='+text, 
			type: 'GET', 
			headers: { 
				'Authorization': 'Bearer '+getAccessToken()
			}
		}).done(function(data){
			
			searchlistArr = data.tracks.items; 
			renderSearchlist();

		}).error(function(data){
			showNotification(data.responseJSON.error.message)
		})
	} else {
		showNotification('Min. value is 1 letter.')
	}
	window.localStorage.setItem('searchValue', '' );
}

function pushToPlaylist(item) {

	playlistArr.push(item);
	renderPlaylist();

}

function renderPlaylist() {

	$('#playlist').html('');
	$.each(playlistArr, function(index, el){
		renderTrackItem(playlist,index,el)
	});

}

function renderSearchlist() {

	$('#results').html('');
	$.each(searchlistArr, function(index, el){
		renderTrackItem(results,index,el)
	});

}

function renderTrackItem(domEl, id, item) {
	domEl.append('<li class="track"><span class="track__id">'+ (id + 1) +'</span><div><h3 class="track__title">'+item.name+'</h3><p class="track__artist">'+item.artists[0].name+'</p></div></li>');
}



function savePlaylist(tracks) {
	var tracks = [];
	var playlistName = $('#playlistName').val();

	$.each(playlistArr, function(index, el){
		tracks.push(el.uri);
	})


if(tracks.length > 0) {


	$.ajax({

		url: 'https://api.spotify.com/v1/me',
		type: 'GET',
		headers: {
			'Authorization': "Bearer " + getAccessToken(),
			'Content-Type': 'application/json'
		}
	}).done(function(userInfo){

		$.ajax({
			url: 'https://api.spotify.com/v1/users/'+ userInfo.id +'/playlists',
			type: 'POST',
			headers: {
				'Authorization': "Bearer " + accessToken,
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
					name: playlistName,
					public: false
				})

		}).done(function(playlist){
			
				$.ajax({
			url: 'https://api.spotify.com/v1/users/'+userInfo.id+'/playlists/'+playlist.id+'/tracks/',
			type: 'POST',
			headers: {
				'Authorization': "Bearer " + getAccessToken(),
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
					uris: tracks
				})

		}).done(function(data){
			
			$('#playlist').html('');
			showNotification('Playlist added successfully. Check your Spotify App')
		})


		})

	})

	} else {
		showNotification('Add tracks to playlist')
	}
}


$('#save-playlist').click(function() {
	savePlaylist(playlistArr);
	playlistArr=[];
});


$(document).on('click', '#results .track', function() {
	var clickedItemId = $(this).index();
	var itemToAdd = searchlistArr[clickedItemId]

	if (playlistArr.includes(itemToAdd)) {

		alert('already in playlist')

	} else {

		pushToPlaylist(itemToAdd);

	}
});



function showNotification(msg) {
	$('#notification').html('');
	$('#notification').append('<p>'+ msg +'</p>');
}

