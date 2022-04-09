// Display 'your top artists' and allow to pick from them to select their top
// 10 albums.

let redirect_uri = "http://127.0.0.1:5500/index.html";

let client_id = '707ddb1c1701414db37c26ccdd399cd0';
let client_secret = 'fa89a50fa328403e8aaace62f84760ac';

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
// const ARTIST_ALBUM = "https://api.spotify.com/v1/artists/5K4W6rqBFWDnAN6FQUkS6x/albums?include_groups=album&limit=50"; // getting all of kanye's albums
const TOP_USER_ARTISTS = "https://api.spotify.com/v1/me/top/artists?limit=8" // Gets top 8 user artists

const requestAuthBtn = document.getElementById('request-auth');
const makeApiCallBtn = document.getElementById('apiCall');
const topArtistList = document.getElementById('topArtistList');

const hello = document.getElementById('hello')
hello.addEventListener('click', () => {
    console.log('hello')})

let angle = 0;

function gallerySpin(sign) {
    console.log('hello')
    const spinner = document.getElementById('topArtistList');
    if(!sign) {
        angle += 45;
    } else {
        angle -= 45;
    }
    spinner.setAttribute('style', `transform: rotateY(${angle}deg);`);
}

function onPageLoad() {
    // Persist to local storage so we can read them again after page load
    // client_id = localStorage.getItem('client_id', client_id);
    // client_secret = localStorage.getItem('client_secret', client_secret);

    // If the URL contains query params
    if (window.location.search.length > 0) {
        handleRedirect();
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState('', '', redirect_uri) //remove param from url
}

function fetchAccessToken(code) {
    // Building body of post request for access token
    let body = 'grant_type=authorization_code';
    body += `&code=${code}`;
    body += `&redirect_uri=${encodeURI(redirect_uri)}`;
    body += `&client_id=${client_id}`;
    body += `&client_secret=${client_secret}`;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body) {
    // Sends Post request for API Token
    let xhr = new XMLHttpRequest();
    xhr.open('POST', TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ':' + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
    // If all goes well
    if (this.status == 200) {
        let data = JSON.parse(this.responseText);
        console.log(data);  
        // Set access token to local storage
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem('access_token', access_token);
        }
        // Set refresh token to local storage
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem('refresh_token', refresh_token);
        }
        onPageLoad();
    }
    // Error handling
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getCode() {
    let code = null;

    // Get current URL
    const queryString = window.location.search;

    // If the URl has query params, get the value of the 'code' parameter
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function requestAuthorization() {

    // Fetch client id and client secret from inputs
    // client_id = document.getElementById('clientId').value;
    // client_secret = document.getElementById('clientSecret').value;

    // Set them each in local storage
    // localStorage.setItem('client_id', client_id);
    // localStorage.setItem('client_secret', client_secret);

    // Build URL to request authorization from spotify

    let url = AUTHORIZE;    
    url += '?client_id=' + client_id;
    url += '&response_type=code';
    url += '&redirect_uri=' + encodeURI(redirect_uri);
    url += '&show_dialog=true'
    url += '&scope=user-library-read user-top-read' //user-library-read user-top-read
    window.location.href = url; //show Spotify authorization screen
}

// 1 aka callback
async function handleArtistAlbum() {
    
    if (this.status == 200) {
        let data = JSON.parse(this.responseText);
        let items = data.items;
        let result = items.map(item => item.id); // Gives us album ID's
        let albumCoversandTitles = await getAlbumCoversandTitles(result)
        let filteredAlbums = filterAlbumDuplicates(albumCoversandTitles);
        let randomAlbums = pickRandomAlbums(filteredAlbums)
        let albumPopularityScores = await getAlbumPopularity(result) // returns array of album id's
        // Here we can get album art, including album title

        console.log(randomAlbums)
        displayAlbumInfo(randomAlbums)
        console.log(albumCoversandTitles)
        console.log(filterPopularityScores(albumPopularityScores))

        // Now that we have albums: iterate through albums, getting their
        // tracks and the individual popularity of each track. Then, reduce
        // that data and finally sort albums by total streams. 
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// Takes array of objects, with name popularity and cover properties
// Displays album cover and title to the DOM

const albumDisplay = document.getElementById('albumDisplay');

const albumContainer1 = document.getElementById('albumContainer1');
const imageContainerDiv1 = document.getElementById('imageContainer1');
let albumCoverImg1 = document.getElementById('coverArt1');
let albumTitle1 = document.getElementById('albumTitle1');

const albumContainer2 = document.getElementById('albumContainer2');
const imageContainerDiv2 = document.getElementById('imageContainer2');
let albumCoverImg2 = document.getElementById('coverArt2');
let albumTitle2 = document.getElementById('albumTitle2');

const score = document.getElementById('scoreNumber');
let count = 0;

function displayAlbumInfo(albumInfo) {
    
    let albumOne = albumInfo[0];
    let albumTwo = albumInfo[1];

    // Album One
    albumCoverImg1.src = albumOne.cover;
    albumTitle1.innerText = albumOne.name;
    albumContainer1.addEventListener('click', () => {
        console.log(albumOne.popularity, albumTwo.popularity)
        if (albumOne.popularity > albumTwo.popularity) {
            console.log('You Win!');
            count += 1;
            score.innerText = count;
        } else {
            console.log('You Lose')
        }
    });

    // Album Two
    albumCoverImg2.src = albumTwo.cover;
    albumTitle2.innerText = albumTwo.name;
    albumContainer2.addEventListener('click', () => {
        console.log(albumOne.popularity, albumTwo.popularity)
        if (albumTwo.popularity > albumOne.popularity) {
            console.log('You Win!')
            count += 1;
            score.innerText = count;
        } else {
            console.log('You Lose')
        }
    });
}

// Picks two random albums from array of album objects
// Places random albums in an array
function pickRandomAlbums(albumList) {

    // Return random index from 0 until length of album list
    const randomNum1 = Math.floor(Math.random() * albumList.length);

    // Selects first album before it is deleted
    const firstAlbum = albumList[randomNum1];

    console.log(firstAlbum)

    // Removes first number so that second num can't be a duplicate
    albumList.splice(randomNum1, 1);

    // Select second number 
    const randomNum2 = Math.floor(Math.random() * albumList.length);

    // Selects second album
    const secondAlbum = albumList[randomNum2];

    // Deletes second album
    albumList.splice(randomNum2, 1);

    console.log(albumList);

    // Return array of two randomly chosen albums
    return [firstAlbum, secondAlbum]
}

function getPopularityScore() {
    console.log(this)
}

function filterPopularityScores(popularityScores) {
    console.log('hello')
    // Sorts albums from highest pop. score to lowest
    const sortedScores = popularityScores.sort((a, b) => b - a)
    // Gets top 10 albums by popularity score
    const topTenScores = sortedScores.slice(0, 10)
    return topTenScores
}

// Large function that get's album popularity scores
async function getAlbumPopularity(albumIds) {

    // Gets array of album tracks for each album
    const getAlbumTracks = await Promise.all(albumIds.map(async albumId => {
            let albumTracks = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                method: 'GET',
                headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + access_token,
                }
                })
            return albumTracks;
        }))
            .then(results => Promise.all(results.map(r => r.json()))) // Returns array of objects with track data
            .then(data => data.map(r => r.items)); // Returns actual items(tracks) from data
 
    // Does multiple things: not good: gives final popularity score
    const processData = async () => {
        const albumTracks = getAlbumTracks; // Array of arrays with track info for each track ((20) [Array(20), Array(20), Array(11)]...)
        for (album of albumTracks) {
            for (let i = 0; i < album.length; i++) {
                album[i] = album[i].id // returns tracks as track id's
                let track = album[i];
                let res = await getTrackData(track);
                res = res.popularity;
                album[i] = res;
                // album[i] is giving undefined: need to find a way to assign
                // it to a variable
                // testing
            }
        }

        return albumTracks
    }

    // Returns object data for each individual track
    const getTrackData = async (track) => {
        let trackData = await fetch(`https://api.spotify.com/v1/tracks/${track}`, {
                    method: 'GET', 
                    headers: {
                        'Authorization' : 'Bearer ' + access_token,
                        'Content-Type' : 'application/json',
                    }
            })
            .then(res => res.json());
        
        return trackData // returns object of each track
    }

    // Gets average popularity for each album
    const getAveragePopularity = async () => {
        const albumPopularityList = await processData();

        // Averages track popularity (rename function)
        for (let i = 0; i < albumPopularityList.length; i++) {
            let length = albumPopularityList[i].length
            albumPopularityList[i] = albumPopularityList[i].reduce((acc, c) => acc += c, 0) // totals popularity scores for each album
            albumPopularityList[i] = albumPopularityList[i] / length  // averages popularity score
        }

        return albumPopularityList; // returns a single array of values: the popularity of each album!
    }


    // NEXT STEPS!
    // Worry about cleaning up code later? or maybe now
    // Get album art/title/artist etc to display on DOM
    // Turn array of numbers into array of objects? with album name as key, and 
    // popularity as value
    // Maybe make function to construct an object for each album, with
    // popularity, title, artist etc. and THEN append to dom



    // console.log(await getAveragePopularity())
    return await getAveragePopularity()

}

// Calls API to obtain all of selected artist's albums
async function callArtistAlbumApi(artist) {
    let url = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=50`;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send();
    xhr.onload = handleArtistAlbum;
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem('refresh_token');
    let body1 = "grant_type=refresh_token";
    body1 += '&refresh_token=' + refresh_token;
    body1 += '&client_id=' + client_id;
    callAuthorizationApi(body1);
}

const artistNameHeader = document.getElementById('artistName');

function displayArtistName(artistName) {
    artistNameHeader.innerText = artistName;
}

// Gets top 10 user artists as objects
async function getUserTopArtists() {
    const userTopArtists = await fetch(TOP_USER_ARTISTS, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + access_token,
        }
    })
        .then(res => res.json())
        .then(data => data.items)

    displayTopArtists(userTopArtists)
}

// Displays user's top artists to the dom
function displayTopArtists(artistList) {

    // Don't really need this part, just for organization
    const artistNames = artistList.map(artist => {
        return {name: artist.name, id: artist.id, picture: artist.images[0].url}
    })

    artistNames.forEach(artist => {
        // Making div
        let artistDiv = document.createElement('div');
        artistDiv.classList.add('artist')
        // Making Image
        let artistImage = document.createElement('img');
        artistImage.src = artist.picture;
        artistImage.alt = artist.name
        artistDiv.appendChild(artistImage);
        // Making name
        let artistName = document.createElement('h2');
        artistName.innerText = artist.name;
        artistDiv.appendChild(artistName);

        topArtistList.appendChild(artistDiv)
        artistDiv.addEventListener('click', callArtistAlbumApi.bind(null, artist))
        artistDiv.addEventListener('click', displayArtistName.bind(null, artist.name))
    })
}

// Takes an array of album ID's and returns their cover art and titles
async function getAlbumCoversandTitles(albumIds) {
    const res1 = await Promise.all(albumIds.map(async albumId => {
        let answer = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            method: 'GET', 
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'Bearer ' + access_token,
            }
        })
        return answer;
    }))
        .then(res => Promise.all(res.map(r => r.json())))
        .then(data => data.map(r => {
            return {
                name: r.name,
                popularity: r.popularity,
                cover: r.images[0].url,
            }
        }))
                // return {
                //     name: data.name,
                //     popularity: data.popularity,
                //     cover: data.images[0]
                // }
            // })
    return res1;
}

// Filters duplicates of album titles from array of objects.
function filterAlbumDuplicates(albumInfo) {
    
    let uniqueNames = [];

    const unique = albumInfo.filter(album => {
        // filter method adds to 'unique' variable if value returned is true
        const isDuplicate = uniqueNames.includes(album.name);

        // if isDuplicate is false
        if (!isDuplicate) {
            uniqueNames.push(album.name);
            return true;
        }
        
        return false;
    })
    console.log(unique)
    return unique;
    
    // let albumTitles = albumInfo.map(album => album.name);
    // return [...new Set(albumTitles)];
}


// const getAlbumTracks = await Promise.all(albumIds.map(async albumId => {
//     let albumTracks = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
//         method: 'GET',
//         headers: {
//             'Content-Type' : 'application/json',
//             'Authorization' : 'Bearer ' + access_token,
//         }
//         })
//     return albumTracks;
// }))
//     .then(results => Promise.all(results.map(r => r.json()))) // Returns array of objects with track data
//     .then(data => data.map(r => r.items)); // Returns actual items(tracks) from data


makeApiCallBtn.addEventListener('click', getUserTopArtists) // change back to getUserTopAlbums when done testing
requestAuthBtn.addEventListener('click', requestAuthorization);


fetch(dogurl)
    .then(res => res.json)
    .then(data => console.log(data))