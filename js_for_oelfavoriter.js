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

            let user = {};
            let userList = [];

            let beerOnly = [];
            let storeOnly = [];

            let userLoggedIn;
            let id = "";

            let city = "";
            let butik = "";
            let butikNr = undefined;
            initPopUp();


            let spinnerObject = {
                fetching: true,
                notFetching: false,
                loadText1: "Loading beers . . .",
                loadText2: "Fetching stores . . .",
                spinner: function (getData, textVal) {

                    let body = document.getElementsByTagName("body")[0];
                    let spinContainer = document.getElementsByClassName("loaderContainer")[0];
                    let lSpinner = document.getElementsByClassName("sk-folding-cube")[0];
                    let text = document.createElement("h1");

                    text.innerText = textVal;
                    text.setAttribute("class", "spinnerText");
                    spinContainer.appendChild(text);
                    spinContainer.appendChild(lSpinner);
                    body.appendChild(spinContainer);

                    if (getData === true) {
                        spinContainer.style.display = "block";
                        lSpinner.style.display = "block";
                    } else {
                        lSpinner.style.display = "none";
                        spinContainer.style.display = "none";
                    }
                }
            };

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
                    //                    console.log(userList);
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

                        

                        //                        console.log('onAuthStateChanged: user is signed in', user);
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
                                    //                                    console.log("Match = " + userList[i].uId);
                                    userExist = true;
                                    id = userList[i].dbId;
                                    addToFavorites()
                                    break; // Isf bryt loopen
                                } else { // Annars ingen match, och userExist är false
                                    //                                    console.log("No Match");
                                    userExist = false;

                                }
                            }
                            if (userExist === false)
                                db.ref("users/").push(uData);

                        }; // End of checkUsers
                        checkUsers(uList);
                        getProducts();
                    } else {
                        spinnerObject.spinner(spinnerObject.notFetching);
                        console.log("No User");
                        window.location.href = "untappd.html";
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

            //Hämtar hem alla produkter som finns på systembolaget
            function getProducts() {
                spinnerObject.spinner(spinnerObject.fetching, spinnerObject.loadText1);
                fetch("https://cors-anywhere.herokuapp.com/https://www.systembolaget.se/api/assortment/products/xml")
                    .then(function (requestProducts) {
                        return requestProducts.text();
                    })
                    .then(function (json) {
                        getStores();
                        beerToFind = json;
                        resultProducts = xmlToJSON.parseString(beerToFind);
                        beerOnlyList(resultProducts)

                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            }
            //Kör fetchen
            
            
            //Hämtar hem butiker och deras sortiment
            function getStores() {
                spinnerObject.spinner(spinnerObject.fetching, spinnerObject.loadText2);
                let loadCont = document.getElementsByClassName("loaderContainer")[0];
                loadCont.removeChild(loadCont.children[0]);
                fetch("https://cors-anywhere.herokuapp.com/https://www.systembolaget.se/api/assortment/stock/xml")
                    .then(function (requestInStock) {
                        return requestInStock.text();
                    })
                    .then(function (json) {
                        spinnerObject.spinner(spinnerObject.notFetching);
                        let beerDB = json;
                        result = xmlToJSON.parseString(beerDB);
                        specificStore(result);
                    })
                    .catch(function (error) {
                        console.log(error);
                    })

            }
            
            fetch("https://cors-anywhere.herokuapp.com/https://www.systembolaget.se/api/assortment/stores/xml")
                    .then(function (req) {
                        return req.text();
                    })
                    .then(function (xml) {
                        let json = xmlToJSON.parseString(xml);
                        let counties = createCountiesList(json);
                        addToListOfCounties(counties);
                        document.getElementById('listOfCounties').addEventListener('change', function() {
                            let cities = createCitiesList(json, document.getElementById('listOfCounties').value);
                            clearCities();
                            clearStores();
                            addToListOfCities(cities);
                            let stores = createStoresList(json, document.getElementById('listOfCities').value);
                            clearStores();
                            addToListOfStores(stores);
                        })
                        document.getElementById('listOfCities').addEventListener('change', function() {
                            let stores = createStoresList(json, document.getElementById('listOfCities').value);
                            clearStores();
                            addToListOfStores(stores);
                        })
                    })
                    .catch(function (error) {
                        console.log(error);
                    })

                function clearCities(){
                    while(document.getElementById('listOfCities').firstChild) {
                        document.getElementById('listOfCities').removeChild(document.getElementById('listOfCities').firstChild);
                    }
                }

                function clearStores(){
                    while(document.getElementById('listOfStores').firstChild) {
                        document.getElementById('listOfStores').removeChild(document.getElementById('listOfStores').firstChild);
                    }
                }


                function addToListOfCounties(countyList) {
                    let dropDown = document.getElementById('listOfCounties');
                    countyList.forEach( county =>  {
                        let newCounty = document.createElement('option');
                        newCounty.setAttribute('value', county);
                        newCounty.innerText = county;
                        dropDown.appendChild(newCounty);
                    })
                }

                function createCountiesList(json) {
                    let newList = [];
                    json.ButikerOmbud[0].ButikOmbud.forEach( store => {
                        let county = store.Address5[0]._text;
                        newList[county] = county;
                    });
                    return Object.keys(newList).sort();
                }

                function addToListOfCities(citiesList) {
                    let dropDown = document.getElementById('listOfCities');
                    citiesList.forEach( city =>  {
                        let cityName = "";
                        let newCity = document.createElement('option');
                        newCity.setAttribute('value', city);
                        cityName = city.substring(0, 1).toUpperCase() + city.substring(1).toLowerCase();
                        newCity.innerText = cityName;
                        dropDown.appendChild(newCity);
                    })
                }

                function createCitiesList(json, county) {
                    let newList = [];
                    json.ButikerOmbud[0].ButikOmbud.forEach( store => {
                        if(store.Address5[0]._text === county && typeof(store.Nr[0]._text) == "number") {
                            let city = store.Address4[0]._text;
                            newList[city] = city;
                        }
                    });
                    return Object.keys(newList).sort();
                }

                function addToListOfStores(storeList) {
                    let dropDown = document.getElementById('listOfStores');
                    storeList.forEach( butik =>  {
                        let newStore = document.createElement('option');
                        newStore.setAttribute('value', butik.nr);
                        newStore.innerText = butik.address;
                        dropDown.appendChild(newStore);
                    })
                }

                function createStoresList(json, city) {
                    let newList = [];
                    function NewStore(address, nr) {
                        this.address = address,
                        this.nr = nr
                    }
                    json.ButikerOmbud[0].ButikOmbud.forEach( store => {
                        let place = "";
                        if(store.Address4[0]._text == city && typeof(store.Nr[0]._text) == 'number') {
                            if(typeof(store.Namn[0]._text) == "string") {
                                place = store.Namn[0]._text + ", " + store.Address1[0]._text;
                            }
                            else {
                                place = store.Address1[0]._text;
                            }
                            
                            newList.push(new NewStore(place, store.Nr[0]._text));
                        }
                    });
                    //return Object.keys(newList).sort();
                    return newList;
                }

            function beerOnlyList(outputFromFetch) {
                beerOnly = [];
                for (let i = 0; i < outputFromFetch.artiklar[0].artikel.length; i++) {
                    try {
                        if (outputFromFetch.artiklar[0].artikel[i].Varugrupp[0]._text === "Öl") {
                            beerOnly = {
                                nr: outputFromFetch.artiklar[0].artikel[i].nr[0]._text,
                                namn: outputFromFetch.artiklar[0].artikel[i].Namn[0]._text,
                                namn2: outputFromFetch.artiklar[0].artikel[i].Namn2[0]._text,
                                producent: outputFromFetch.artiklar[0].artikel[i].Producent[0]._text,
                            }
                        }
                        index.addDoc(beerOnly);
                    } catch (error) {
                        //catch om producer inte finns, då lägger vi till i beerOnly utan producent
                        beerOnly = {
                            nr: outputFromFetch.artiklar[0].artikel[i].nr[0]._text,
                            namn: outputFromFetch.artiklar[0].artikel[i].Namn[0]._text,
                            namn2: outputFromFetch.artiklar[0].artikel[i].Namn2[0]._text,
                        }
                        index.addDoc(beerOnly);
                    }
                }
            }


            let myStore = 1410; //Ska vara vald butik när vi kommer till sidan
            function specificStore(outputfromStoreFetch) {
                storeOnly = [];
                for (let i = 0; i < outputfromStoreFetch.ButikArtikel[0].Butik.length; i++) {
                    if (outputfromStoreFetch.ButikArtikel[0].Butik[i]._attr.ButikNr._value === myStore) {
                        storeOnly.push(outputfromStoreFetch.ButikArtikel[0].Butik[i])
                    }
                }
            }

            //Optimera sökning med lightweight elasticlunr function
            var index = elasticlunr(function () {
                this.addField('namn');
                this.addField('namn2');
                this.addField('producent');
                this.setRef('nr');
            })

            //Skriver ut lista på sidan över favoriter
            function output(favoriteArray) {
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
            });

            //Klick på "does it exist?" kollar target.id mot id på child om de matchar så söker vi igenom systembolagets produkter med namnet vi fått från Untappd
            container.addEventListener("click", function (e) {
                let parentNodeForBeer = e.target.parentNode.childNodes[5].id;
                let parentNodeBeerName = e.target.parentNode.childNodes[1].innerText;
                let parentNodeBrewery = e.target.parentNode.childNodes[3].innerText;
                let favoriteId = e.target.id;
                //                console.log(e.target.className)
                yourBeer = [];

                //tar namn och producent, skickar det till elasticlunr för att få score om produkt finns i sortiment
                if (e.target.className === "btn btn-outline-light") {
//                    index.search(parentNodeBeerName + " " + parentNodeBrewery);
                    yourBeer = index.search(parentNodeBeerName + " " + parentNodeBrewery, {
                        fields: {
                            namn: {
                                boost: 4,
                            },
                            namn2: {
                                boost:2,
                            },
                            producer: {
                                boost: 1.5,
                            }
                        }
                    });
                   
                    console.log(yourBeer[0]);
                    //ändra score kan behövas samt tweak av paramaterar till document
                    if (yourBeer[0].score > 10) {
                        console.log("this should exist in store! " + yourBeer[0].doc.namn);
                        console.log("the nr is: " + yourBeer[0].doc.nr);
                    } 
                    else {
                        console.log("I doubt you will find what you are looking for " + yourBeer[0].doc.namn);
                    }
                }
            })

            function initPopUp() {
                document.getElementById('popUpButton').addEventListener('click', function() {
                    document.getElementById('popUp').style.display = 'block';
                });
               document.getElementById('confirmButton').addEventListener('click', function() {
                   document.getElementById('popUp').style.display = "none";
                   butikNr = document.getElementById('listOfStores').value;
                   console.log(butikNr);

               })
            }

            //function för att söka igenom document över all öl som finns på systemet
            //http://elasticlunr.com/
            var index = elasticlunr(function () {
                this.addField('namn');
                this.addField('namn2');
                this.addField('producent');
                this.setRef('nr');
            });

        })
