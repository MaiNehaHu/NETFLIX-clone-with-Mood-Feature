//Consts
const apiKey = "89baa223d65eb626c13d7431f219368d";
const apiEndPoint = "https://api.themoviedb.org/3/";
const imgPath = "https://image.tmdb.org/t/p/original";
const ytEndPoint = `https://www.googleapis.com/youtube/v3/`;
const YTGoogleAPI = `AIzaSyDX9KJ5YuUTHhUpKGwuxS-eM0I6guGWFjc`;

/**🌈 Mood selected status 🌈 */
var selectedMood = false;
/**flag to control dual call of buildMoviesHtml()*/
var buildMoviesSection = false;

/*all consts of document*/
//to append HTML
const Mood = document.querySelector(".mood");
const InnerDiv = document.querySelector(".my-feature");

const bannerContainer = document.getElementById("banner-section");
const movieContainer = document.getElementById("movie-cont");

//mooooood
const moodResultPage = document.querySelector(".mood-result");
const moodResultContainer = document.querySelector(".mood-result-container");
const moodResult = document.querySelector(".mood-result");

//remove button
const removeBtn = document.querySelector(".remove"); //cross button
const removeMoodResult = document.querySelector(".remove-mood-result");

//filter docs
const actionMood = document.querySelector(".action");
const sadMood = document.querySelector(".sad");
const romanceMood = document.querySelector(".romance");
const happyMood = document.querySelector(".happy");
const horrorMood = document.querySelector(".horror");
const familyMood = document.querySelector(".family");

const loader = document.querySelector(".loader");
const moviesLoader = document.querySelector(".loading-movies");
const offline = document.querySelector(".offline");
const online = document.querySelector(".online");
const connectionStatus = document.querySelector(".internet-status");

//online offline status
window.onload = () => {
  function ajax() {
    let xhr = new XMLHttpRequest();
    const url =
      `${apiEndPoint}/genre/movie/list?api_key=${apiKey}` &&
      `${apiEndPoint}trending/all/week?api_key=${apiKey}&language=en-US`;
    xhr.open("GET", url, true);

    xhr.onload = () => {
      if (xhr.status === 200 && xhr.status < 300) {
        console.log("All good at Movies API");
        onlineStatus();

        //reload contiously
        loader.classList.add("loader--hidden");

        //remove loader and show mood options
        MoodOptions();
      } else {
        //something
      }
    };
    xhr.onerror = () => {
      console.log("Offline");
      offlineStatus();
      reLoad();
    };
    xhr.send();
  }
  ajax();
};

function onlineStatus() {
  offline.style.display = "none";
  online.style.display = "flex";
  setTimeout(() => {
    connectionStatus.style.display = "none";
    online.style.display = "none";
  }, 2000);
}
function offlineStatus() {
  online.style.display = "none";
  offline.style.display = "flex";
  connectionStatus.style.display = "flex";
}

//loader
function reLoad() {
  setInterval(() => {
    window.location.reload();
  }, 7000);
  return;
}

//APIs
const apiPaths = {
  fetchAllCategories: `${apiEndPoint}/genre/movie/list?api_key=${apiKey}`,
  fetchMoviesList: (id) =>
    `${apiEndPoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
  fetchTrending: `${apiEndPoint}trending/all/week?api_key=${apiKey}&language=en-US`,
  searchOnYoutube: (query) =>
    `${ytEndPoint}search?part=snippet&q=${query}&key=${YTGoogleAPI}`,
};

window.addEventListener("load", function () {
  init();
});

//Boots up the app
function init() {
  fetchTrendingMovies();
  fetch_Each_CategoryURL_And_BuildAllSections();
}

function fetchTrendingMovies() {
  fetch_MoviesList_from_categoryURL(apiPaths.fetchTrending, "Trending Now")
    .then((response) => {
      //Telling to build Banner of received response
      buildBanner(response[randomNumber(0, response.length - 1)]);
      return response;
    })
    .catch((err) => console.log(err));
}

//to generate random index to generate banner of different movies
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function buildBanner(movie) {
  bannerContainer.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;
  bannerContainer.style.backgroundPosition = "center";
  bannerContainer.style.backgroundSize = "cover";

  const div = document.createElement("div");
  div.className = "banner-content";

  div.innerHTML = `
    <h1>${movie.title || movie.name}</h1>
    <h2>Trending in movies | Release date: ${
      movie.release_date || movie.first_air_date
    }</h2>
    <p class="desciption">
     ${movie.overview}
    </p>
    <div class="buttons">
      <button class="play-btn"><i class="fa fa-play"></i>Play</button>
      <button class="info-btn">
      <i class="fa fa-info-circle"></i> More info
      </button>
    </div>
  `;

  bannerContainer.append(div);
}

function fetch_Each_CategoryURL_And_BuildAllSections() {
  movieContainer.append(moviesLoader);

  /**flag to control dual call of buildMoviesHtml()*/
  buildMoviesSection = true;
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      moviesLoader.classList.add("loader--hidden");
      const categories = response.genres;

      // fetching all category movies and asking to build "Each" movie section of "Each" category
      if (Array.isArray(categories) && categories.length) {
        categories.forEach((category) => {
          fetch_MoviesList_from_categoryURL(
            apiPaths.fetchMoviesList(
              category.id
            ) /**fetch url of category id */,
            category.name
          );
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
async function fetch_MoviesList_from_categoryURL(fetchUrl, categoryName) {
  // console.log(fetchUrl, categoryName);
  //fetching movie list of given categoryId
  //Sending to Build "One" section of "One" category
  try {
    const res = await fetch(fetchUrl);
    const res_1 = await res.json();
    const movies = res_1.results;
    if (Array.isArray(movies) && movies.length) {
      if (buildMoviesSection) {
        buildMovieSections(movies, categoryName);

        return movies;
      }
      if (selectedMood) {
        buildMoodResult(movies, categoryName);

        return movies;
      }
    }
  } catch (err) {
    return console.log(err);
  }
}

function buildMovieSections(list, categoryName) {
  // console.log(list, categoryName);
  //List has all moviesList of a category

  /**HTML */
  const movieSectionHTML = buildMoviesHtml(list, categoryName);

  const div = document.createElement("div");
  div.className = "movie-section";
  ///movie section div
  div.innerHTML = movieSectionHTML;
  //Sending all movies sections onscreen

  //append into movie container
  movieContainer.append(div);
}

/**mood result */
function buildMoodResult(list, categoryName) {
  // console.log(list, categoryName);
  //List has all moviesList of a category
  moodResultPage.style.display = "block";
  Mood.style.display = "none";
  /**HTML */
  const movieSectionHTML = buildMoodMoviesHTML(list, categoryName);

  const div = document.createElement("div");
  div.className = "mood-result-movie";
  ///movie section div
  div.innerHTML = movieSectionHTML;
  //Sending all movies sections onscreen

  //append into movie container
  moodResultContainer.append(div);
  return;
}

function buildMoviesHtml(list, categoryName) {
  /*Main movie container on screen*/

  const movieListHTML = list
    //Building one section of one category
    .map((item) => {
      if (!item.title || !item.backdrop_path)
        return `<div class="nothing"></div>`;
      else {
        return `
        <div class="movie">
          <img class="movie-banner"
          src="${imgPath}${item.backdrop_path}"
              alt="${item.title}"
              onmousedown="animateDown(this)"
              onmouseup="animateUp(this); searchMovieTrailer('${item.title}','${categoryName}${item.id}')"
          />
          <aside>
            <h1>${item.title}</h1>
          </aside>
          <iframe style="display:none;" 
            onmouseleave="CloseMovieiFrame(this)" 
            src="" 
            id="${categoryName}${item.id}" 
            title="YouTube video player" 
            frameborder="0" 
            allow="autoplay; encrypted-media;">
          </iframe>
        </div>
    `; //one movie returned in movie list
      }
    })
    .join(""); //.join to remove comma

  const movieSectionHTML =
    //Making all movies sections
    ` <hgroup>
      <h2>${categoryName}</h2> &rightarrowtail;
    </hgroup>
    <div class="movies-rows scrollerBox snaps-inline">
      ${movieListHTML}
    </div>
  `; //One movie sections returned on screen line by line
  return movieSectionHTML;
}

/**mood html */
function buildMoodMoviesHTML(list, moodName) {
  const randomMovie_fromList = list[randomNumber(0, list.length - 1)];

  if (!randomMovie_fromList.backdrop_path) {
    console.log(
      `${randomMovie_fromList.title} of ${moodName} Banner Doesn't exist`
    );
    return `<div class="nothing"></div>`;
  } else {
    const movieListHTML = `
    <img
      class="movie"
      src="${imgPath}${randomMovie_fromList.backdrop_path}"
      alt="${randomMovie_fromList.title}"
    /> 
    `;
    //Building one section of one category

    const moodMovieHTML =
      //Making movies sections
      `<div class="mood-result-details">
      ${movieListHTML}
      <h3>${randomMovie_fromList.title}</h3>
    </div>`;
    return moodMovieHTML;
  }
}

//YT video as trailer or teaser or review
function searchMovieTrailer(movieName, iframeId) {
  console.log(`Clicked on ${movieName}, ${iframeId}`);

  if (!movieName) return;

  fetch(apiPaths.searchOnYoutube(movieName))
    .then((res) => res.json())
    .then((res) => {
      console.log("All good at Google YT API");
      const bestResult = res.items[randomNumber(0, 4)];

      const iFrameEle = document.getElementById(iframeId);
      const Body = document.querySelector("body");
      Body.addEventListener("touchmove",()=> CloseMovieiFrame(iFrameEle));
      
      iFrameEle.src = `https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&mute=1&controls=0`;
      iFrameEle.style.display = "flex";
    })
    .catch((err) => {
      alert("Facing Problem in getting video");
      console.log("Not getting data from Google API : ", err);
    });
}

/**Remove on mouse out */
function CloseMovieiFrame(movieName) {
  console.log("mouse out");
  movieName.style.display = "none";
}

/**Animate Push and Jump back of Banner*/
function animateDown(image) {
  image.style.transform = "scale(0.91)";
}
function animateUp(image) {
  image.style.transform = "scale(1)";
}

/*---------------mood result display on screen-------------*/

function MoodSelected(moodMoviesURL) {
  selectedMood = true;
  buildMoviesSection = false;
  moodMoviesURL.forEach((movie) => {
    fetch_MoviesList_from_categoryURL(
      apiPaths.fetchMoviesList(movie.id) /**fetch url of category id */,
      movie.name
    );
  });
}
/*===================🌈Our Feature🌈=========*/

//Popup on screen
function MoodOptions() {
  setTimeout(() => {
    console.log("Select mood");
    Mood.style.display = "flex";
  }, 20000);
}

/**happy filter*/
happyMood.addEventListener("click", filterHappy);
/**romance */
romanceMood.addEventListener("click", filterRomance);
/**Sad */
sadMood.addEventListener("click", filterSad);
/**Horror */
horrorMood.addEventListener("click", filterHorror);
/**Action */
actionMood.addEventListener("click", filterAction);
/**Family */
familyMood.addEventListener("click", filterFamily);

function filterHappy() {
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const happyMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Adventure" ||
          movieName.name == "Romance" ||
          movieName.name == "Comedy" ||
          movieName.name == "Drama" ||
          movieName.name == "Family" ||
          movieName.name == "Music" ||
          movieName.name == "Animation" ||
          movieName.name == "Science Fiction";
        return flag;
      });
      console.log("Happy mood", happyMovies);
      MoodSelected(happyMovies);
    })
    .catch((err) => console.log(err));
}

function filterRomance() {
  // console.log(allMovies);
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const romanceMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Romance" ||
          movieName.name == "Music" ||
          movieName.name == "Adventure" ||
          movieName.name == "Animation";
        return flag;
      });
      console.log("Romance mood", romanceMovies);
      MoodSelected(romanceMovies);
    })
    .catch((err) => console.log(err));
}

function filterSad() {
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const sadMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Adventure" ||
          movieName.name == "Animation" ||
          movieName.name == "Comedy";
        return flag;
      });
      console.log("sad mood", sadMovies);
      MoodSelected(sadMovies);
    })
    .catch((err) => console.log(err));
}
function filterHorror() {
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const horrorMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Horror" ||
          movieName.name == "Mystry" ||
          movieName.name == "Thriller";

        return flag;
      });
      console.log("Horror mood", horrorMovies);
      MoodSelected(horrorMovies);
    })
    .catch((err) => console.log(err));
}
function filterAction() {
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const actionMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Action" ||
          movieName.name == "Thriller" ||
          movieName.name == "War" ||
          movieName.name == "Western";

        return flag;
      });

      console.log("Action mood", actionMovies);
      MoodSelected(actionMovies);
    })
    .catch((err) => console.log(err));
}
function filterFamily() {
  fetch(apiPaths.fetchAllCategories)
    .then((response) => response.json())
    .then((response) => {
      const allMovies = response.genres;
      // console.log(allMovies);

      const familyMovies = allMovies.filter((movieName) => {
        let flag =
          movieName.name == "Family" ||
          movieName.name == "Comedy" ||
          movieName.name == "Animation" ||
          movieName.name == "Fantasy" ||
          movieName.name == "Science Fiction" ||
          movieName.name == "TV movie" ||
          movieName.name == "Mystery" ||
          movieName.name == "Adventure" ||
          movieName.name == "Drama";

        return flag;
      });
      console.log("Family mood", familyMovies);
      MoodSelected(familyMovies);
    })
    .catch((err) => console.log(err));
}

//remove mood display
removeBtn.addEventListener("click", () => {
  Mood.style.display = "none";
});

//mood result removing
removeMoodResult.addEventListener("click", () => {
  moodResult.style.display = "none";
});

/*===================🌈Our Feature🌈=========*/

/**------------------last------------------------*/

// window.addEventListener("contextmenu", (event) => {
//   event.preventDefault();

//   alert("Can't console my dear friend 😜");
// });
