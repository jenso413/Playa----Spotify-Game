const client_id = '707ddb1c1701414db37c26ccdd399cd0';
const client_secret = 'fa89a50fa328403e8aaace62f84760ac';
const redirect_uri = "http://127.0.0.1:5500/index.html";

const requestAuthorization = async () => {

    console.log('hello')

    const result = await fetch("https://accounts.spotify.com/authorize", {
        method: 'GET',
        headers: {
            'client_id' : client_id,
            'response_type' : 'code',
            'redirect_uri' : redirect_uri,
            'scope' : 'user-library-read user-top-read'
            'Access-Control-Allow-Origin': 'test'
        }
    })

    const data = await result.json();
    return data;
}



// const apiController = (function() {

//     const getToken = async () => {

//         const result = await fetch('https://accounts.spotify.com/api/token', {
//             method: 'POST',
//             headers: {
//                 'Content-Type' : 'application/x-www-form-urlencoded',
//                 'Authorization' : 'Basic ' + btoa(client_id + ':' + client_secret)
//             },
//             body: {
//                 'grant_type' : 'authorization_code',
//                 'code' : code,
//                 'redirect_uri' : redirect_uri,
//                 'client_id' : client_id,
//                 'client_secret' : client_secret,
//             }
//         })
//     }
// })();