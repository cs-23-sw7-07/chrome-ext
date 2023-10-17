const MIN_LISTEN_TIME = 10_000

// import { Handler } from "../handler";
// import { Operator } from "../operater"; 
import { Song } from "../models/song"

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!sender.tab && request.type == "NewState") {
        handleNewState().finally(() => {
            sendResponse()
        })
    }
});

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
            let song = new Song(track.name, track.album.name, track.artists.map(artist => artist.name), track.external_ids.isrc)
            return Promise.resolve(song)
        }
    }
    return Promise.reject("Invalid Playback state to consider")
}





function saveTracksforUser(songs) {
    let track_ids = []
    songs.forEach(song => {
        track_ids.push(getTrackIdBySong(song))
    });

    const chunkSize = 50;
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = track_ids.slice(i, i + chunkSize);
        fetch("https://api.spotify.com/v1/me/tracks", {
            method: "PUT",
            headers: new Headers({
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }),
            body: JSON.stringify({ ids: chunk })
        }).catch(err => {
            //Do somenthing
        })
    }

}

function getTrackIdBySong(song) {
    let params = {}
    if (song.isrc != undefined) {
        params["q"] = `isrc:${song.isrc}`
    }
    else {
        params["q"] = `album:${song.album} artist:${song.artists.join(" ")}, track:${song.titel}`
    }
    return searchTrack(params)
}

function searchTrack(params) {
    params["type"] = "track"
    params["limit"] = 1
    return fetch('https://api.spotify.com/v1/search?' + (new URLSearchParams(params)).toString())
}