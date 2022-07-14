// Display 'your top artists' and allow to pick from them to select their top
// 10 albums.

// let redirect_uri = "http://127.0.0.1:5500/Spotify-API-Game/artistPicker.html";
let redirect_uri = "https://playa-spotify-game.netlify.app/artistpicker";

// NOT BEST PRACTICE: only done because this project doesn't have a server
let client_id = '707ddb1c1701414db37c26ccdd399cd0';
let client_secret = 'fa89a50fa328403e8aaace62f84760ac';

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const TOP_USER_ARTISTS = "https://api.spotify.com/v1/me/top/artists?limit=8" // Gets top 8 user artists

const requestAuthBtn = document.getElementById('request-auth');
const makeApiCallBtn = document.getElementById('apiCall');
const topArtistList = document.getElementById('topArtistList');

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

    getUserTopArtists();

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

    let url = AUTHORIZE;    
    url += '?client_id=' + client_id;
    url += '&response_type=code';
    url += '&redirect_uri=' + encodeURI(redirect_uri);
    url += '&show_dialog=true'
    url += '&scope=user-library-read user-top-read' //user-library-read user-top-read
    window.location.href = url; //show Spotify authorization screen
}

let score = 0;
let count = 0;
const modal = document.querySelector('.modal-bg');
const finalScore = document.getElementById('final-score');
const text1 = document.querySelector('.text1')
const text2 = document.querySelector('.text2')
const text3 = document.querySelector('.text3')
const text4 = document.querySelector('.text4')

let eventListenerPlaced = false;

const playAgainBtn = document.getElementById('play-again');

if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
        window.location.href = 'artistPicker.html'
        doThis();
    })    
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
        displayAlbumInfo(randomAlbums);

        function displayAlbumInfo(albumInfo) {

            console.log('porky')
            
            let albumOne = albumInfo[0];
            let albumTwo = albumInfo[1];
        
            // Album One
            albumCoverImg1.src = albumOne.cover;
            albumTitle1.innerText = albumOne.name;
            let pop1 = albumOne.popularity;

            // Album Two
            albumCoverImg2.src = albumTwo.cover;
            albumTitle2.innerText = albumTwo.name;
            let pop2 = albumTwo.popularity;

            albumContainer1.addEventListener('click', playGameOne);
            albumContainer2.addEventListener('click', playGameTwo);

            function playGameOne() {
                // Removes event listeners after click to allow access to new data
                albumContainer1.removeEventListener('click', playGameOne);
                albumContainer2.removeEventListener('click', playGameTwo);
                console.log(pop1, pop2)
                if (count < 9) {
                    if (pop1 > pop2) {
                        console.log('You Win!');
                        count += 1;
                        score += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    } else {
                        count += 1;
                        displayScore.innerText = `${score} / ${count}`;
                        console.log('You Lose')
                    }

                    let res = pickRandomAlbums(filteredAlbums);
                    displayAlbumInfo(res);
                    let albumOne = res[0];
                    let albumTwo = res[1];
                } else {
                    if (pop1 > pop2) {
                        count += 1;
                        score += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    } else {
                        count += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    }
                    modal.classList.toggle('bg-active');
                    finalScore.innerText = `${score}/${count}`;
                    if (score == 9 || score == 10) {
                        text1.classList.toggle('hide');
                    } else if (score == 6 || score == 7 || score == 8) {
                        text2.classList.toggle('hide');
                    } else if (score == 3 || score == 4 || score == 5) {
                        text3.classList.toggle('hide');
                    } else {
                        text4.classList.toggle('hide');
                    }
                    return;
                }
            };
                
            function playGameTwo() {
                albumContainer1.removeEventListener('click', playGameOne);
                albumContainer2.removeEventListener('click', playGameTwo);
                console.log(pop1, pop2)
                if (count < 9) {
                    if (pop1 < pop2) {
                        console.log('You Win!');
                        count += 1;
                        score += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    } else {
                        count += 1;
                        displayScore.innerText = `${score} / ${count}`;
                        console.log('You Lose')
                    }
        
                    let res = pickRandomAlbums(filteredAlbums);
                    displayAlbumInfo(res);
                    let albumOne = res[0];
                    let albumTwo = res[1];
                } else {
                    if (pop1 < pop2) {
                        count += 1;
                        score += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    } else {
                        count += 1;
                        displayScore.innerText = `${score} / ${count}`;
                    }
                    modal.classList.toggle('bg-active');
                    finalScore.innerText = `${score}/${count}`;
                    if (score == 9 || score == 10) {
                        text1.classList.toggle('hide');
                    } else if (score == 6 || score == 7 || score == 8) {
                        text2.classList.toggle('hide');
                    } else if (score == 3 || score == 4 || score == 5) {
                        text3.classList.toggle('hide');
                    } else {
                        text4.classList.toggle('hide');
                    }
                    return;
                }
            };
        }
        
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

const albumDisplay = document.getElementById('albumDisplay');

const albumContainer1 = document.getElementById('albumContainer1');
const imageContainerDiv1 = document.getElementById('imageContainer1');
let albumCoverImg1 = document.getElementById('coverArt1');
let albumTitle1 = document.getElementById('albumTitle1');

const albumContainer2 = document.getElementById('albumContainer2');
const imageContainerDiv2 = document.getElementById('imageContainer2');
let albumCoverImg2 = document.getElementById('coverArt2');
let albumTitle2 = document.getElementById('albumTitle2');

const displayScore = document.getElementById('scoreNumber');

// Picks two random albums from array of album objects
// Places random albums in an array
function pickRandomAlbums(albumList) {

    console.log(albumList)

    // Return random index from 0 until length of album list
    const randomNum1 = Math.floor(Math.random() * albumList.length);

    // Selects first album before it is deleted
    const firstAlbum = albumList[randomNum1];

    // Select second number 
    let randomNum2 = Math.floor(Math.random() * albumList.length);

    // Makes sure numbers aren't the same
    while (randomNum1 === randomNum2) {
        randomNum2 = Math.floor(Math.random() * albumList.length);
    }

    // Selects second album
    const secondAlbum = albumList[randomNum2];


    // Return array of two randomly chosen albums
    return [firstAlbum, secondAlbum];
}

// Calls API to obtain all of selected artist's albums
async function callArtistAlbumApi(artist) {
    let access_token1 = localStorage.getItem('access_token')
    let url = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album&limit=50`;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token1);
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

// Gets top 10 user artists as objects
async function getUserTopArtists() {
    let access_token = localStorage.getItem('access_token')
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
        // artistDiv.addEventListener('click', callArtistAlbumApi.bind(null, artist))

        artistDiv.addEventListener('click', () => {
            // Allows us to access clicked on artist name on next page
            localStorage.setItem('artist', JSON.stringify(artist));
            window.location.href = 'APIgame.html';
            doThis();
        })
    })
}

// Pull clicked on artist name
function doThis() {
    let res = localStorage.getItem('artist');
    res = JSON.parse(res);
    console.log(res)
    callArtistAlbumApi(res);
    displayArtistName(res)
}

// Displays artist name to the DOM
function displayArtistName(artist) {
    const emptySpansForName = document.querySelectorAll('.artist-name');
    emptySpansForName.forEach(span => {
        span.innerText = artist.name;
    })
}

// Takes an array of album ID's and returns their cover art and titles
async function getAlbumCoversandTitles(albumIds) {
    let access_token1 = localStorage.getItem('access_token')
    const res1 = await Promise.all(albumIds.map(async albumId => {
        let answer = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            method: 'GET', 
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'Bearer ' + access_token1,
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
                
    return res1;
}

// Filters duplicates of album titles from array of objects.
function filterAlbumDuplicates(albumInfo) {

    // Sort by popularity so most popular form of album gets returned
    albumInfo = albumInfo.sort((a, b) => b.popularity - a.popularity);
    
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
    
    // Returns filtered list 'unique', not uniqueNames
    return unique;
    
}

if (requestAuthBtn) {
    requestAuthBtn.addEventListener('click', requestAuthorization);
}


