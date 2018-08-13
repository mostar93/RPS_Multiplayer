//  Initialize Firebase
var config = {
    apiKey: "AIzaSyCAjpLT_q3_MH9u9iwaOVRmrvi9UCl-f4E",
    authDomain: "train-or-rps-hwk.firebaseapp.com",
    databaseURL: "https://train-or-rps-hwk.firebaseio.com",
    projectId: "train-or-rps-hwk",
    storageBucket: "train-or-rps-hwk.appspot.com",
    messagingSenderId: "682649657870"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  var userChoice;
  var opponentChoice;
  var winCount = 0;
  var loseCount = 0;
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  function go() {
    var userId = prompt('Username?', 'Guest');
    // Consider adding '/<unique id>' if you have multiple games.
    var gameRef = database.ref("/game");
    assignPlayerNumberAndPlayGame(userId, gameRef);
  };

  go();

  var numPlayers = 4;
  var gameLocation = "/game";
  var playerLocation = "/game/playerLocation";
  var playerDataLocation = "/game/playerData";

  function playGame(myPlayerNumber, userId, justJoinedGame, gameRef) {
    var playerDataRef = gameRef.child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
    alert('You are player number ' + myPlayerNumber + 
        '.  Your data will be located at ' + playerDataRef.toString());
  
    if (justJoinedGame) {
      alert('Doing first-time initialization of data.');
      playerDataRef.set({userId: userId, state: 'game state'});
    }
  }
  
  // Use transaction() to assign a player number, then call playGame().
  function assignPlayerNumberAndPlayGame(userId, gameRef) {
    var playerListRef = gameRef.child(playerLocation);
    var myPlayerNumber, alreadyInGame = false;
  
    playerListRef.transaction(function(playerList) {
      // Attempt to (re)join the given game. Notes:
      //
      // 1. Upon very first call, playerList will likely appear null (even if the
      // list isn't empty), since Firebase runs the update function optimistically
      // before it receives any data.
      // 2. The list is assumed not to have any gaps (once a player joins, they 
      // don't leave).
      // 3. Our update function sets some external variables but doesn't act on
      // them until the completion callback, since the update function may be
      // called multiple times with different data.
      if (playerList === null) {
        playerList = [];
      }
  
      for (var i = 0; i < playerList.length; i++) {
        if (playerList[i] === userId) {
          // Already seated so abort transaction to not unnecessarily update playerList.
          alreadyInGame = true;
          myPlayerNumber = i; // Tell completion callback which seat we have.
          return;
        }
      }
  
      if (i < NUM_PLAYERS) {
        // Empty seat is available so grab it and attempt to commit modified playerList.
        playerList[i] = userId;  // Reserve our seat.
        myPlayerNumber = i; // Tell completion callback which seat we reserved.
        return playerList;
      }
  
      // Abort transaction and tell completion callback we failed to join.
      myPlayerNumber = null;
    }, function (error, committed) {
      // Transaction has completed.  Check if it succeeded or we were already in
      // the game and so it was aborted.
      if (committed || alreadyInGame) {
        playGame(myPlayerNumber, userId, !alreadyInGame, gameRef);
      } else {
        alert('Game is full.  Can\'t join. :-(');
      }
    });
  }

  

  connectedRef.on("value", function(snap){
    if (snap.val()){
      var con = connectionsRef.push(true);
      con.onDisconnect().remove();
    }
  })

  connectionsRef.on("value", function(snap) {
    console.log(snap.numChildren());
  })


  $(document).on("click", ".btn", function(){
      userChoice = $(this).val();
      console.log(userChoice);
      playGame();
      database.ref("/game").push({
        choice: userChoice,
    })
  })


  function playGame (){
      if (userChoice === "paper" && opponentChoice === "rock" ){
          alert("you win!");
          winCount++;
      } else if (userChoice === "rock" && opponentChoice === "scissors"){
          alert("you win!");
          winCount++;
      } else if (userChoice === "scissors" && opponentChoice === "rock") {
          alert("you lose!");
          loseCount++;
      } else if (userChoice === "paper" && opponentChoice === "scissors") {
          alert("you lose!")
          loseCount++;
      } else if (userChoice === "scissors" && opponentChoice === "paper"){
          alert("you win");
          winCount++;
      } else if (userChoice === "rock" && opponentChoice ==="paper"){
          alert("you lose");
          loseCount++;
      } else if (userChoice === opponentChoice){
          alert("you tied");
      }

  }

 

  

// make 2 seperate folders in Firebase
// compare values of 2 folders to decide winner using playGame() function
// need to figure out how to limit game to 2 connections
  