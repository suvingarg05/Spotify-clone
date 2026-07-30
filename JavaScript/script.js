console.log("Let's write JavaScript")


let currSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    //console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let lis = div.getElementsByTagName("li");
    console.log(lis);
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    //get the list of all songs

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <img src="img/music.svg">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Suvin Garg</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                            
                                <img class="invert playnow" src="img/play.svg">
                            </div></li> `;


    }

    //Attach an event listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    });

    return songs;

}
const playMusic = (track, pause = false) => {
    //let audio=new Audio(("/songs/"+track));

    currSong.src = `/${currFolder}/` + track;


    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00";

    if (!pause) {
        currSong.play();
        play.src = "img/pause.svg";
    }

}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            //get the metadata of the folder

            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                                <!-- Green circular background -->
                                <circle cx="18" cy="18" r="18" fill="#1DB954" />

                                <!-- Font Awesome play icon -->
                                <path fill="#000" transform="translate(7 7) scale(0.034)"
                                    d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`

        }
    }




}

async function main() {



    await getSongs("songs/ncs");

    playMusic(songs[0], true);

    //display all the albums on the page

    await displayAlbums();






    //Attach an event listener to previous,play and next
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currSong.pause();
            play.src = "img/play.svg";
        }
    })
    //listen for time update event

    currSong.addEventListener("timeupdate", () => {
        //console.log(currSong.duration, currSong.currentTime);
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";


    })
    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = (currSong.duration) * percent / 100;
    })



    //add an event listener to hamburger 

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";

    })
    //add an event listeneer to close button
    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%";
    })


    // add an event listener to previous and next

    previous.addEventListener("click", () => {

        currSong.pause();

        console.log("previous");
        console.log(currSong);
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);

        //console.log(songs,index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }


    })

    next.addEventListener("click", () => {

        currSong.pause();
        console.log("next");
        console.log(currSong);
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);

        //console.log(songs,index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }

    })
    //load the playlist whenever a card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            // console.log(item,item.currentTarget.dataset);
            console.log("fetching songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })


    // add an event listener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to:", e.target.value, '/ 100');

        currSong.volume = parseInt(e.target.value) / 100;

        if(currSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg");
        }
    })

    

    // add an event listener to mute the track

    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        //console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
            currSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

  
}
main()

