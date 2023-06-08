

function generateRandomString(){
  characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    random_string = "";
    for ( var i = 0; i <= 5; i++) {
      var indx = Math.floor(62*Math.random());   // Generates random integer number between 0-61
        random_string += characters[indx];
    }
    return random_string;
}

function urlsForUser(id,urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const urlEntry = urlDatabase[shortURL];
    if (urlEntry.userID === id) {
      userUrls[shortURL] = urlEntry;
    }
  }
  return userUrls;
}

module.exports = { generateRandomString,urlsForUser,};


