 window.addEventListener("load", function () {
     // Initialize Firebase
     var config = {
         apiKey: "AIzaSyAl6h2TDLbhuqPvCcRenX7KVgvtPtJVUDE",
         authDomain: "bringmybeerbro-a2b2e.firebaseapp.com",
         databaseURL: "https://bringmybeerbro-a2b2e.firebaseio.com",
         projectId: "bringmybeerbro-a2b2e",
         storageBucket: "bringmybeerbro-a2b2e.appspot.com",
         messagingSenderId: "787446559372"
     };
     firebase.initializeApp(config);

     // Initialize Firebase
     const db = firebase.database();

     // Autentisering börjar här
     // AuthSpinner object  
     let authSpinner = {
         ifUser: false,
         myStorage: window.localStorage,
         key: "userStatus",
         activated: "1",
         unactivated: "0",
         activateSpinner: function () {
             for (var i = 0; i < this.myStorage.length; i++) {
                 let localKey = this.myStorage.key(i);
                 let localVal = this.myStorage.getItem(this.myStorage.key(i));
                 if (localKey === this.key && localVal === this.activated) {
                     this.myStorage.setItem(this.key, this.unactivated);
                     this.spinner(this.ifUser);
                 }
             }
         },
         spinner: function(aUser) {
                    let container = document.getElementsByClassName("loaderContainer")[0];
                    let lSpinner = document.getElementsByClassName("sk-folding-cube")[0];
                    let loadText = document.getElementsByClassName("loadText")[0];
                    let body = document.getElementsByTagName("body")[0];
                    container.appendChild(loadText);
                    container.appendChild(lSpinner);
                    body.appendChild(container);

                    if (aUser === false) {
                        container.style.display = "block";
                        lSpinner.style.display = "block";
                    } else {
                        lSpinner.style.display = "none";
                        container.style.display = "none";
                    }
                }
            };
     authSpinner.activateSpinner(); // Kör igång spinner funktionen

     // Providers
     let facebookProvider = new firebase.auth.FacebookAuthProvider();
     let googleProvider = new firebase.auth.GoogleAuthProvider();
     let logInWithFb = document.getElementById("facebookBtn");
     let logInWithgoogle = document.getElementById("googleBtn");
     // Signar in med Google
     logInWithgoogle.addEventListener("click", function (event) {
         firebase.auth().signInWithRedirect(googleProvider);
         authSpinner.myStorage.setItem(authSpinner.key, authSpinner.activated);
     });
     // Signar in med FB
     logInWithFb.addEventListener("click", function (event) {
         firebase.auth().signInWithRedirect(facebookProvider);
         authSpinner.myStorage.setItem(authSpinner.key, authSpinner.activated);
     });
     let user = {};
     let userList = [];
     let id;
  let footer =  document.getElementsByTagName("footer")[0];
     
     

     //används av showMore funktionen för att se nästkommande 5 öl
     let counter = 5;
     let offset;
     let value;

     
     
     let showMore = document.getElementById("showMore");
     showMore.style.display = "none";

     function getUsers() {
         db.ref("users/").once("value", function (snapshot) {
             let data = snapshot.val();
             let keys = Object.keys(data);
             let keyNr = 0;
             for (let user in data) {
                 let userInfo = data[user];
                 let key = keys[keyNr];
                 keyNr++;
                 user = {
                     dbId: key,
                     name: userInfo.name,
                     favorites: userInfo.favorites,
                     email: userInfo.email,
                     img: userInfo.profileImg,
                     uId: userInfo.id
                 }
                 userList.push(user);
             }
             console.log(userList);
             getUserInfo(userList);
         })
     }; // getUsers ends here
     getUsers(); // Activate function

     function getUserInfo(uList) {
         firebase.auth().onAuthStateChanged(function (user) {
             let elements = {
                 logged: document.getElementsByClassName("logged")[0],
                 notLogged: document.getElementsByClassName("notLogged")[0],
                 header: document.getElementsByTagName("header")[0],
                 userDiv: document.createElement("div"),
                 logOutBtn: document.createElement("button"),
                 imgcontainer: document.createElement("div"),
                 img: document.createElement("img"),
                 name: document.createElement("span"),
             };
             if (user) {
                 // User is signed in.
                 authSpinner.ifUser = true;
                 authSpinner.spinner(authSpinner.ifUser);

                 var displayName = user.displayName;
                 var email = user.email;
                 var emailVerified = user.emailVerified;
                 var photoURL = user.photoURL;
                 var isAnonymous = user.isAnonymous;
                 var uid = user.uid;
                 var providerData = user.providerData;

                 let uData = {
                     name: displayName,
                     email: email,
                     profileImg: photoURL,
                     id: uid
                 };

                 console.log('onAuthStateChanged: user is signed in', user);
                 console.log("User logged in..");
                 elements.userDiv.setAttribute("class", "userDiv");
                 elements.logOutBtn.setAttribute("id", "logOut");
                 elements.logOutBtn.setAttribute("class", "btn btn-outline-warning");
                 elements.logOutBtn.innerText = "Sign out";
                 elements.name.innerText = `${displayName}`;
                 elements.imgcontainer.setAttribute("class", "userInfo");
                 elements.img.setAttribute("class", "userImg");
                 elements.img.setAttribute("src", photoURL);
                 elements.imgcontainer.appendChild(elements.img);
                 elements.userDiv.appendChild(elements.logOutBtn);
                 elements.userDiv.appendChild(elements.name);
                 elements.userDiv.appendChild(elements.imgcontainer);
                 elements.header.appendChild(elements.userDiv);
                 elements.logged.style.display = "block";
                 elements.notLogged.style.display = "none";
                 // Log-out function
                 let loggedOut = document.getElementById('logOut');
                 let logOut = function (event) {
                     firebase.auth().signOut().then(function (result) {
                             console.log('User signed out');
                             elements.logged.style.display = "none";
                             elements.notLogged.style.display = "block";
                             elements.userDiv.style.display = "none";
                             authSpinner.myStorage.setItem(authSpinner.key, 0);
                         })
                         .catch(function (error) {
                             console.log('Signout failed');
                         })
                 };
                 loggedOut.addEventListener('click', logOut); // Logoutlistener

                 function checkUsers(list) {
                     let userExist = true; // Variabel som kollar om ett id som är identiskt som användaren
                     for (i = 0; i < userList.length; i++) { // Går igenom listan  
                         if (userList[i].uId === uData.id) { // Kollar om ett användar redan id redan finns
                             console.log("Match = " + userList[i].uId);
                             userExist = true;
                             id = userList[i].dbId;
                             break; // Isf bryt loopen
                         } else { // Annars ingen match, och userExist är false
                             console.log("No Match");
                             userExist = false;
                         }
                     }
                     if (userExist === false)
                         db.ref("users/").push(uData);

                 }; // End of checkUsers
                 checkUsers(uList);
             } else {
                 console.log("No User");
             }
         })
     }; // getUserInfo ends

     firebase.auth().getRedirectResult().then(function (result) {
         if (result.credential) { // authSpinner gives you a Facebook Access Token. You can use it to access the Facebook API.  
             var token = result.credential.accessToken;
         }
         var user = result.user; // The signed-in user info.
     }).catch(function (error) {
         // Handle Errors here.
         var errorCode = error.code;
         var errorMessage = error.message;
         var email = error.email;
         var credential = error.credential; // The firebase.auth.AuthCredential type that was used.
     })
     // Autentisering slutar här

     let clientId = "153D83356A0B65CE0BDB2F2058AA09CEE92F165D";
     let clientSecret = "7B480C43412EF225E1E7E6F802A05FEE835B016B";
     let searchBeerBtn = document.getElementById("searchBeerBtn");
     let searchBeerInput = document.getElementById("searchBeerInput");
     let container = document.getElementsByClassName("container")[0];
     let beerArray = [];

     function printOut(array) {

         container.innerHTML = "";
         let increment = 0;

         for (let i = 0; i < array.length; i++) {
             //                        console.log(db[i].id)
             let content = {
                 div: document.createElement("div"),

                 hide: document.createElement("a"),
                 show: document.createElement("a"),
                 moreInfo: document.createElement("div"),
                 arrowUp: document.createElement("div"),
                 arrowDown: document.createElement("div"),

                 img: document.createElement("img"),
                 beerNameShow: document.createElement("h2"),
                 beerNameHide: document.createElement("h2"),
                 infoDiv: document.createElement('div'),
                 style: document.createElement("h4"),
                 brewery: document.createElement("h5"),
                 description: document.createElement("p"),
                 favorite: document.createElement("button"),
             }

             content.div.setAttribute("class", "card-body beer");


             content.hide.setAttribute("id", "hide" + increment);
             content.hide.setAttribute("href", "#hide" + increment);
             content.hide.setAttribute("class", "hide");
             content.arrowUp.setAttribute("class", "arrowUp");


             content.show.setAttribute("id", "show" + increment);
             content.show.setAttribute("href", "#show" + increment);
             content.show.setAttribute("class", "show");
             content.arrowDown.setAttribute("class", "arrowDown");

             content.moreInfo.setAttribute("class", "details");

             content.img.setAttribute("src", array[i].beer.beer_label);
             content.img.setAttribute("height", "140px");

             content.favorite.setAttribute("class", "btn btn-outline-light favoriteBtn");
             content.favorite.setAttribute("id", array[i].beer.bid);

             content.favorite.innerText = "Favorite";
             content.beerNameShow.innerText = array[i].beer.beer_name;
             content.beerNameHide.innerText = array[i].beer.beer_name;
             content.style.innerText = 'Type of beer: ' + array[i].beer.beer_style;
             content.brewery.innerText = 'Brewery: ' + array[i].brewery.brewery_name;
             content.description.innerText = array[i].beer.beer_description;
             
             content.infoDiv.setAttribute('class', 'infoDiv')

             content.hide.appendChild(content.arrowDown);
             content.hide.appendChild(content.beerNameHide);
             content.div.appendChild(content.hide);

             content.show.appendChild(content.arrowUp);
             content.show.appendChild(content.beerNameShow);
             content.div.appendChild(content.show);


             content.moreInfo.appendChild(content.img);
             content.moreInfo.appendChild(content.infoDiv);
             content.infoDiv.appendChild(content.style);
             content.infoDiv.appendChild(content.brewery);
             content.moreInfo.appendChild(content.description);
             content.moreInfo.appendChild(content.favorite);

             content.div.appendChild(content.moreInfo);
             container.appendChild(content.div);

             increment++;
         }
     }


     searchBeerBtn.addEventListener("click", function () {
         
         offset = 0;
         beerArray = [];
         value = searchBeerInput.value;
         showMore.style.display = "none";
         fetch(`https://api.untappd.com/v4/search/beer?q=${value}&client_id=${clientId}&client_secret=${clientSecret}&limit=${counter}&offset=${offset}`)
             .then(function (request) {
                 return request.json();
             })
             .then(function (json) {
                 let beerDB = json;
                 for (let i = 0; i < beerDB.response.beers.items.length; i++) {
                     beerArray.push(beerDB.response.beers.items[i]);
                 }

                 printOut(beerArray);
             footer.style.position = "sticky";
             console.log(beerArray)
             if(beerArray.length >= 4)
             showMore.style.display = "block";
             else
                 showMore.style.display = "none";
             })
             .catch(function (error) {
                 console.log(error);
             })
     })



     showMore.addEventListener("click", function (e) {
      
      console.log("clicked showMore");
         console.log(e.target.id);

         offset = offset + 5;
         console.log(counter);
         console.log(offset)
         //                beerArray = [];
         fetch(`https://api.untappd.com/v4/search/beer?q=${value}&client_id=${clientId}&client_secret=${clientSecret}&limit=${counter}&offset=${offset}`)
             .then(function (request) {
                 return request.json();
             })
             .then(function (json) {
                 let beerDB = json;
                 for (let i = 0; i < beerDB.response.beers.items.length; i++) {
                     beerArray.push(beerDB.response.beers.items[i]);
                 }
                 printOut(beerArray);
             
             console.log(beerArray)
             if(beerArray.length >= 4)
             showMore.style.display = "block";
             else
                 showMore.style.display = "none";
             
             })
             .catch(function (error) {
                 console.log(error);
             })





     })

     container.addEventListener("click", function (e) {
         let toNumber = parseInt(e.target.id);
         //                console.log(beerArray)
         let beerObj = {}
         for (let i = 0; i < beerArray.length; i++) {
             if (toNumber == beerArray[i].beer.bid) {
                 beerObj.name = beerArray[i].beer.beer_name;
                 beerObj.style = beerArray[i].beer.beer_style;
                 beerObj.description = beerArray[i].beer.beer_description;
                 beerObj.brewery = beerArray[i].brewery.brewery_name;
                 beerObj.img = beerArray[i].beer.beer_label;
                 db.ref(`users/${id}/favorites/`).push(beerObj);
                 console.log(id);
                 console.log("ok")
             }
         }
     })
 })

