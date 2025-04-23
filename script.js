console.log("lets write js")
let currentSong=new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainigSeconds=Math.floor(seconds%60);

    const fromattedMinutes=String(minutes).padStart(2,'0')
    const formattedSeconds=String(remainigSeconds).padStart(2,'0')

    return `${fromattedMinutes}:${formattedSeconds}`;
  }


async function getSongs(folder){
    currfolder=folder;
    let a=await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response=await a.text()
    console.log(response)
    let div=document.createElement('div')
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
    songs=[]
    for(let index=0;index<as.length;index++){
        const element=as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    // show all songs in playlist
    let songUl=document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML=" "
    for (const song of songs) {
        songUl.innerHTML=songUl.innerHTML + `        
        <li>
            <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div> ${song.replaceAll("%20", " ")}</div>
                    <div>Song Artist</div>
                </div>
                <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div></li>`;
    }
    
    // attach the event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
            e.addEventListener("click",element=>{
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        });

    return songs
}

const playMusic=(track,pause=false)=>{
    // let audio=new Audio("/songs/"+track)
    currentSong.src = `/${currfolder}/` + track
    if(!pause){
        currentSong.play()
        play.src="img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00"

}

async function displayAlbums(){
    let a=await fetch(`http://127.0.0.1:3000/songs/`)
    let response=await a.text()
    let div=document.createElement("div")
    div.innerHTML=response;
    let anchors=div.getElementsByTagName("a")
    let cardContainer=document.querySelector(".cardContainer")
    let array=Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if(e.href.includes("/songs")){
            let folder=e.href.split("/").slice(-2)[0]
            // get the metadata of folder

            let a=await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response=await a.json()            
            console.log(response)
            cardContainer.innerHTML=cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="50" cy="50" r="48" fill="#1fdf64" stroke="#1fdf64" stroke-width="4"/>
                              
                                <!-- Play triangle with black stroke and green fill (matches background) -->
                                <polygon points="40,30 70,50 40,70" fill="#1fdf64" stroke="#000000" stroke-width="4"/>
                              </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }   }
        // load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            console.log(e)
            e.addEventListener("click",async item=>{
            console.log("Fetching Servers")
            songs=await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            })
        })
    console.log(anchors)
}

async function main(){

    // get the list of all songs
    await getSongs("songs/ncs")
    playMusic(songs[0],true)

    // display all the albums on the page
    displayAlbums()

    // attach an event listener to play, next and previous id's
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate",()=>{
        console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML=`${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)*100 + "%"
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left=percent + "%"
        currentSong.currentTime = ((currentSong.duration)*percent)/100
    })
    
    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    // add an event listener for cross button
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    // add an event listener to previous and next
    previous.addEventListener("click",()=>{
        console.log("Previous clicked")

        let index=songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        console.log(songs,index)
        if((index-1)>=0){
            playMusic(songs[index+1])
        }
    })
    next.addEventListener("click",()=>{
        console.log("Next clicked")

        let index=songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        console.log(songs,index)
        if((index+1)<(songs.length-1)){
            playMusic(songs[index+1])
        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to - ",e.target.value," / 100")
        currentSong.volume=parseInt(e.target.value)/100
    })

    // add event listener to mute the volume
    document.querySelector(".volumes > img").addEventListener("click",(e)=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","volumemute.svg")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("volumemute.svg","volume.svg")
            currentSong.volume=.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
    
}

main()



{/* <div data-folder="ncs" class="card">
                        <div data-folder="cs" class="play">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="50" cy="50" r="48" fill="#1fdf64" stroke="#1fdf64" stroke-width="4"/>
                              
                                <!-- Play triangle with black stroke and green fill (matches background) -->
                                <polygon points="40,30 70,50 40,70" fill="#1fdf64" stroke="#000000" stroke-width="4"/>
                              </svg>
                        </div>
                        <img src="img/happyhits.jpeg" alt="">
                        <h2>Happy Hits</h2>
                        <p>Hits to boost your mood and fill with happiness!</p>
                    </div>

                    <div data-folder="cs" class="card">
                        <div class="play">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="50" cy="50" r="48" fill="#1fdf64" stroke="#1fdf64" stroke-width="4"/>
                              
                                <!-- Play triangle with black stroke and green fill (matches background) -->
                                <polygon points="40,30 70,50 40,70" fill="#1fdf64" stroke="#000000" stroke-width="4"/>
                              </svg>
                        </div>
                        <img src="img/happyhits.jpeg" alt="">
                        <h2>Happy Hits</h2>
                        <p>Hits to boost your mood and fill with happiness!</p>
                    </div>

                    <div data-folder="ArijitSingh" class="card">
                        <div class="play">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="50" cy="50" r="48" fill="#1fdf64" stroke="#1fdf64" stroke-width="4"/>
                              
                                <!-- Play triangle with black stroke and green fill (matches background) -->
                                <polygon points="40,30 70,50 40,70" fill="#1fdf64" stroke="#000000" stroke-width="4"/>
                              </svg>
                        </div>
                        <img src="img/arijit.jpeg" alt="">
                        <h2>Arijit Singh</h2>
                        <p>Dive into the emotional universe !</p>
                    </div>
                    
                    <div data-folder="HoneySingh" class="card">
                        <div class="play">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <!-- Green circular background -->
                                <circle cx="50" cy="50" r="48" fill="#1fdf64" stroke="#1fdf64" stroke-width="4"/>
                              
                                <!-- Play triangle with black stroke and green fill (matches background) -->
                                <polygon points="40,30 70,50 40,70" fill="#1fdf64" stroke="#000000" stroke-width="4"/>
                              </svg>
                        </div>
                        <img src="img/honeysingh.jpeg" alt="">
                        <h2>Honey Singh</h2>
                        <p>Have fun with the blender hits of YoYo Honey Singh !</p>
                    </div> */}