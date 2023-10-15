const MIN_LISTEN_TIME = 10_000

class Song {
    constructor(titel, album, artists) {
        this.titel = titel;
        this.album = album;
        this.artists = artists;
    }
}

function handleNewState() {
    return getAccessToken()
        .then(getPlaybackState)
        .then(handlePlaybackState)
        
        .then(temp => {
            console.log(temp)
        })
        .catch(err => {
            console.log(err)
        })
}

function getAccessToken() {
    return fetch("https://open.spotify.com/get_access_token")
        .then(response => response.json())
        .then(access => access.accessToken);
}

function getPlaybackState(accessToken) {
    return fetch("https://api.spotify.com/v1/me/player", {
        method: "GET",
        headers: new Headers({
            'Authorization': 'Bearer ' + accessToken,
        })
    })
        .then(response => response.json())
}

let prev_track_id = undefined
function handlePlaybackState(state) {
    if (state.currently_playing_type == "track") {
        let track = state.item
        if (state.progress_ms == null || state.progress_ms < MIN_LISTEN_TIME) {
            setTimeout(handleNewState, MIN_LISTEN_TIME + 1)
            return Promise.reject("Not satisfy MIN_LISTEN_TIME")
        }
        else if (prev_track_id != track.id) {
            prev_track_id = track.id
            let song = new Song(track.name, track.album.name, track.artists.map(artist => artist.name))
            return Promise.resolve(song)
        }
    }
    return Promise.reject("Not a valid Playback state to consider")
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!sender.tab && request.type == "NewState") {
        handleNewState().finally(() => {
            sendResponse()
        })
    }
});
