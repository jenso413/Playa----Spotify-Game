let redirect_uri = "http://127.0.0.1:5500/index.html";

let client_id = '';
let client_secret = '';

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const TOP_ARTISTS = "https://api.spotify.com/v1/me/top/type/artists"; // end with artists or tracks

const requestAuthBtn = document.getElementById('request-auth');
const makeApiCallBtn = document.getElementById('apiCall');

function onPageLoad() {
    // Persist to local storage so we can read them again after page load
    client_id = localStorage.getItem('client_id', client_id);
    client_secret = localStorage.getItem('client_secret', client_secret);

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

// function refreshAccessToken() {
//     refresh_token = localStorage.getItem('refresh_token');
//     let body1 = "grant_type=refresh_token";
//     body1 += '&refresh_token=' + refresh_token;
//     body1 += '&client_id=' += client_id;
//     callAuthorizationApi(body1);
// }

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
    console.log('hello')
    // Fetch client id and client secret from inputs
    client_id = document.getElementById('clientId').value;
    client_secret = document.getElementById('clientSecret').value;

    // Set them each in local storage
    localStorage.setItem('client_id', client_id);
    localStorage.setItem('client_secret', client_secret);

    // Build URL to request authorization from spotify
    let url = AUTHORIZE;    
    url += '?client_id=' + client_id;
    url += '&response_type=code';
    url += '&redirect_uri=' + encodeURI(redirect_uri);
    url += '&show_dialog=true'
    url += '&scope=user-library-read user-top-read' //user-library-read user-top-read
    window.location.href = url; //show Spotify authorization screen
}

function getUserTopArtists() {
    callApi(TOP_ARTISTS);
    console.log('1')
}

// function handleTopArtistResponse() {
//     console.log(this)
    
//     if (this.status == 200) {
//         let data = JSON.parse(this.responseText);
//         console.log(data);
//     } else if (this.status == 401) {
//         refreshAccessToken();
//     } else {
//         console.log(this.responseText);
//         alert(this.responseText);
//     }
// }

async function callApi(url) {
    console.log(access_token)
    const result = await fetch(url, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  'Bearer ' + access_token
        }
    });
    
    const data = await result.json();
    return data;


    // let xhr = new XMLHttpRequest();
    // xhr.open(method, url, true);
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    // xhr.send();
    // xhr.onload = callback;
    // console.log('2')
}


makeApiCallBtn.addEventListener('click', getUserTopArtists)
requestAuthBtn.addEventListener('click', requestAuthorization);