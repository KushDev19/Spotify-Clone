let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;

  // Formatting the result
  var formattedTime =
    minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

  return formattedTime;
}

async function getSongs(folder) {
  currFolder = folder;
  //fetching songs from directory through live http request
  let a = await fetch(`https://kushdev19.github.io/${folder}/`);

  //convert http req to text
  let response = await a.text();

  //created doc div
  let div = document.createElement("div");

  //saved elements in div
  div.innerHTML = response;

  //fetching song by a ref
  let as = div.getElementsByTagName("a");

  songs = [];

  //loop for fetching songs.. from (.mp3) file through the data
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  //sorting the songs to show into the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
          <img class="invert" src="svgfiles/music.svg" alt="">
          <div class="info">

              <div> ${decodeURIComponent(song)}
              </div>
              <div>Kush</div>

          </div>
          <img class="invert Pmusic" src="svgfiles/pmusic.svg" alt="">
     </li>`;
  }

  //Attach An Event listner to each Song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim(), 0);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    btnPlay.src = "./PNGIcons/Vpause.png";
  }

  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);

  // if (decodeURIComponent(track).length > 50) {
  //   decodeURIComponent(track).innerHTML = '<marquee>' + decodeURIComponent(track) + '</marquee>';
  // }

  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

const currentSongName = () => {
  for (const song of songs) {
    if (song.src("&amp;")) {
      song.src.replace("&amp;", "%26");
      return song;
    }
  }
};

async function DisplayAlbums() {
  //fetching albums from directory through live http request
  let a = await fetch(`/songs/`);

  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0];

      console.log(folder);
      
      //Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
              <!-- Add padding by adjusting the attributes of the circle -->
              <circle cx="22" cy="22" r="15"/>
              <!-- Center the play button within the circle -->
              <path d="M15 29V15L29 22L15 29Z" fill="#000000"/>
            </svg>
      </div>
      <img class="cardimg" src= "/songs/${folder}/cover.jpg" alt="">
      <h2>${response.title}</h2>
      <p>${response.description}</p>
      
      </div>`;
    }
  }

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0], false);  
    
    });
  });

}

async function main() {
  //Get the list of the all songs
  await getSongs("songs/Favorites");

  playMusic(songs[0], true);

  //Display all the albums on the page
  DisplayAlbums();

  //Attach An Event listner to the Play button (Play-Pause)
  btnPlay.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      btnPlay.src = "./PNGIcons/Vpause.png";
    } else {
      currentSong.pause();
      btnPlay.src = "./PNGIcons/Play.png";
    }
  });

  // Listen For time Update Event(responsive time in playbar of Current Song)
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = Math.floor(currentSong.currentTime);
    let totalTime = Math.floor(currentSong.duration);

    if (currentSong.currentTime == currentSong.duration) {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    }

    document.querySelector(".songtime").innerHTML =
      secondsToMinutesAndSeconds(currentTime) +
      " / " +
      secondsToMinutesAndSeconds(totalTime);

    document.querySelector(".circle").style.left =
      (currentTime / totalTime) * 100 + "%";
  });

  // add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    currentSong.currentTime =
      (e.offsetX / e.target.getBoundingClientRect().width) *
      currentSong.duration;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-1%";
  });

  // Add an event listener for cross
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener for previous button
  btnPrev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }

    if (index - 1 == -1) {
      playMusic(songs[0]);
    }
  });

  

  // Add an event listener for next button
  btnNext.addEventListener("click", () => {
    currentSong.pause();

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }

    if (index + 1 == songs.length){
      playMusic(songs[0]);
    }

  });

  
  

  // Add an event listener for volume button
  volume.addEventListener("click", (e) => {
    if (currentSong.volume == 1.0) {
      currentSong.volume = 0.0;
      volume.src = "svgfiles/voloff.svg";
    } else {
      currentSong.volume = 1.0;
      volume.src = "svgfiles/volume.svg";
    }
  });
}

main();
