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
            let container = document.getElementsByClassName("container")[0];
            let increment = 0;
            let beerFavorites = {};
            let store = [];

            let yourBeer = [];
            let favoriteArray = [];
            let resultProducts;
            let beerToFind;
            let result;

            let loading = document.getElementsByClassName("loading")[0];
            let user = {};
            let userList = [];

            let userLoggedIn;
            let id = "";


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
                        header: document.getElementsByTagName("header")[0],
                        userDiv: document.createElement("div"),
                        logOutBtn: document.createElement("button"),
                        imgcontainer: document.createElement("div"),
                        img: document.createElement("img"),
                        name: document.createElement("span"),
                    };

                    if (user) {
                        // User is signed in.


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
                        // Log-out function
                        let loggedOut = document.getElementById('logOut');
                        let logOut = function (event) {
                            firebase.auth().signOut().then(function (result) {
                                    console.log('User signed out');
                                    elements.userDiv.style.display = "none";

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

                                    addToFavorites()









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

            function addToFavorites() {
                db.ref(`users/${id}/favorites/`).on("child_added", function (snapshot) {
                    let database = snapshot.val();
                    //Lägger till ett objekt för varje ny child_added
                    beerFavorites = {
                        name: database.name,
                        style: database.style,
                        description: database.description,
                        brewery: database.brewery,
                        img: database.img,
                        id: snapshot.key,
                    }

                    favoriteArray.push(beerFavorites);

                    //Skickas till funktionen output för att visas på sidan
                    output(beerFavorites);
                })
            }









            //carl är bara ett exempel, key för riktiga användaren ska vara där





            //Hämtar hem alla produkter som finns på systembolaget
            fetch("https://cors-anywhere.herokuapp.com/https://www.systembolaget.se/api/assortment/products/xml")
                .then(function (requestProducts) {
                    return requestProducts.text();
                })
                .then(function (json) {
                    beerToFind = json;
                    resultProducts = xmlToJSON.parseString(beerToFind);

                })
                .catch(function (error) {
                    console.log(error);
                })

            //Hämtar hem butiker och deras sortiment
            fetch("https://cors-anywhere.herokuapp.com/https://www.systembolaget.se/api/assortment/stock/xml")
                .then(function (requestInStock) {
                    return requestInStock.text();
                })
                .then(function (json) {
                    let beerDB = json;
                    result = xmlToJSON.parseString(beerDB);
                    loading.style.display = "none";
                })
                .catch(function (error) {
                    console.log(error);
                })




            //Skriver ut lista på sidan över favoriter
            function output(favoriteArray) {
                //                console.log(favoriteArray)

                let content = {
                    div: document.createElement("div"),
                    img: document.createElement("img"),
                    beerName: document.createElement("h2"),
                    style: document.createElement("h4"),
                    brewery: document.createElement("h5"),
                    description: document.createElement("p"),
                    favorite: document.createElement("button"),
                    remove: document.createElement("button"),
                }


                if (favoriteArray.length !== 0) {
                    content.div.setAttribute("class", "card-body beer");
                    content.img.setAttribute("src", favoriteArray.img);
                    content.img.setAttribute("height", "140px");
                    content.favorite.setAttribute("class", "btn btn-outline-light");
                    content.favorite.setAttribute("id", "favorite" + increment);
                    content.favorite.innerText = "Does it exist?";

                    content.remove.setAttribute("class", "btn btn-outline-danger");
                    content.remove.setAttribute("id", favoriteArray.id);
                    content.remove.innerText = "Remove beer";

                    content.beerName.innerText = favoriteArray.name;
                    content.style.innerText = favoriteArray.style;
                    content.brewery.innerText = favoriteArray.brewery;
                    content.description.innerText = favoriteArray.description;

                    content.div.appendChild(content.img);
                    content.div.appendChild(content.beerName);
                    content.div.appendChild(content.style);
                    content.div.appendChild(content.brewery);
                    content.div.appendChild(content.description);
                    content.div.appendChild(content.favorite);
                    content.div.appendChild(content.remove);
                    container.appendChild(content.div);

                    increment++;
                    loading.style.display = "none";
                }
            }

            ///////////////////////////////////////////////////////////////            
            //Ta bort öl från databasen, arrayen och output 
            function removeBeerFromDb(remove, node) {
                for (let i = 0; i < favoriteArray.length; i++) {
                    if (remove === favoriteArray[i].id) {
                        favoriteArray.splice(i, 1);
                        node.remove();
                    }
                }
                db.ref(`users/${id}/favorites/` + remove).remove();

            }

            db.ref(`users/${id}/favorites/`).on("child_removed", function (snapshot) {
                // Inträffar när ett objekt tas bort.
                let data = snapshot.val(); // det borttagna objektet
                let key = snapshot.key;
            })


            container.addEventListener("click", function (e) {
                let parentNodeForBeer = e.target.parentNode.lastChild.id;

                let removeId = e.target.id;

                if (removeId === parentNodeForBeer && removeId !== "" && removeId !== undefined) {
                    let removeParent = e.target.parentNode;
                    removeBeerFromDb(removeId, removeParent)
                }
            })

            ///////////////////////////////////////////////////////////////

            //Loopar igenom numret på ölen och kollar om match finns mellan öl och sortiment i butik
            function loopIt(beer) {
                let bool;
                if (beer[0].nr[0]._text !== undefined) {
                    for (let i = 0; i < store[0].ArtikelNr.length; i++) {
                        for (let y = 0; y < beer.length; y++) {
                            if (store[0].ArtikelNr[i]._text == beer[y].nr[0]._text) { // 154803 Brooklyn lager
                                console.log("match!")
                                bool = true;
                                break;
                            }
                        }
                    }
                }

                if (bool == true)
                    console.log("Beer exists in store, now go and pick up that beer bro! ;)");
                else
                    console.log("Beer exists but not in store, been searching everywhere");
            }


            //Matchar knapp id vid tryck med childnode id för att se om array ska sökas igenom och matchas mot artiklarna i butik (om den finns)
            function doesBeerExist(favoriteId, idOfBeer, inputArray) {
                let beerNumbers = [];
                store = [];
                for (let i = 0; i < inputArray.length; i++) {
                    beerNumbers[i] = {
                        nr: inputArray[i],
                    }
                }
                if (favoriteId === idOfBeer && inputArray.length !== 0) {
                    for (let i = 0; i < result.ButikArtikel[0].Butik.length; i++) {
                        if (result.ButikArtikel[0].Butik[i]._attr.ButikNr._value == 1508) { //1410 - Nordstan | 1508 - Solkatten | 1423 - Angered
                            console.log("Store exists, moving on");
                            store.push(result.ButikArtikel[0].Butik[i]);
                        }
                    }
                    loopIt(beerNumbers);
                } else {
                    console.log("Your beer seem to be lost in space or something");
                }
            }

            //Söker med hjälp av bolaget.io efter produkt och sparar ner numret på ölen och skickar till doesBeerExists
            function fetchFromBolagetIO(favoriteId, parentNodeForBeer, name) {
                let bolagetSearch;
                fetch("https://bolaget.io/v1/products?search=" + name)
                    .then(function (search) {
                        return search.json();
                    })
                    .then(function (json) {
                        bolagetSearch = json;
                        for (let i = 0; i < resultProducts.artiklar[0].artikel.length; i++) {
                            for (let y = 0; y < bolagetSearch.length; y++) {
                                if (resultProducts.artiklar[0].artikel[i].nr[0]._text == bolagetSearch[y].nr && resultProducts.artiklar[0].artikel[i].Varugrupp[0]._text == "Öl") {
                                    console.log("Beer exists - found it through bolaget.io");
                                    yourBeer.push(resultProducts.artiklar[0].artikel[i].nr);
                                    break;
                                }
                            }
                        }
                        doesBeerExist(favoriteId, parentNodeForBeer, yourBeer);
                    })
            }

            //Klick på "does it exist?" kollar target.id mot id på child om de matchar så söker vi igenom systembolagets produkter med namnet vi fått från Untappd
            container.addEventListener("click", function (e) {
                let parentNodeForBeer = e.target.parentNode.childNodes[5].id;
                let parentNodeBeerName = e.target.parentNode.childNodes[1].innerText;
                let favoriteId = e.target.id;
                yourBeer = [];

                //Systembolaget använder två namn, kan endast matcha på en av dom, slutar leta om den matchar
                for (let i = 0; i < resultProducts.artiklar[0].artikel.length; i++) {
                    if (resultProducts.artiklar[0].artikel[i].Namn[0]._text == parentNodeBeerName && resultProducts.artiklar[0].artikel[i].Varugrupp[0]._text == "Öl") {
                        console.log("Beer exists - found it through 'Namn'");
                        yourBeer.push(resultProducts.artiklar[0].artikel[i].nr);
                        break;
                    } else if (resultProducts.artiklar[0].artikel[i].Namn2[0]._text == parentNodeBeerName && resultProducts.artiklar[0].artikel[i].Varugrupp[0]._text == "Öl") {
                        console.log("Beer exists - found it through 'Namn2'");
                        yourBeer.push(resultProducts.artiklar[0].artikel[i].nr);
                        break;
                    }
                }

                //Om listan är tom har vi inte matchat via systembolagets API, då kollar vi bolaget.io om en mindre sträng sökning kan hjälpa
                if (yourBeer.length === 0) {
                    console.log(parentNodeBeerName);
                    fetchFromBolagetIO(favoriteId, parentNodeForBeer, parentNodeBeerName);

                    //Är listan inte tom har vi hittat något, då anropar vi funktion som kollar om ölen finns i vald butik
                } else if (yourBeer.length !== 0) {
                    console.log(yourBeer);
                    doesBeerExist(favoriteId, parentNodeForBeer, yourBeer);
                }
            })

        })
