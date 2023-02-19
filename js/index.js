import { API_SECRET_KEY, base_URL } from '../config/config.js';
import { createAutoComplete } from './autocomplete.js';

let rightMovieData, leftMovieData;

const autoCompleteConfig = {
    renderOption(movie) {
        const imgSrc = (movie.Poster === 'N/A' ? '' : movie.Poster);

        return `
            <img src="${imgSrc}" />
            ${movie.Title}
        `;
    },
    inputValue(movie) {
        return movie.Title;
    },
    async fetchData(searchInput) {
        try {
            const response = await axios.get(`${base_URL}`, {
                params: {
                    apiKey: API_SECRET_KEY,
                    s: searchInput
                }
            });

            if (response.data.Error) {
                return [];
            }

            return response.data.Search;
        }
        catch (e) {
            console.log("Oops! Something went wrong!, Movie retrieval failed!", e.message);
        }
    }
};

createAutoComplete(
    {
        ...autoCompleteConfig,
        root: document.querySelector('#left-autocomplete'),
        onOptionSelect(movie) {
            document.querySelector('#message').classList.add('is-hidden');
            onMovieSelect(movie.imdbID, document.querySelector('#left-summary'), "left");
        }
    }
);

createAutoComplete(
    {
        ...autoCompleteConfig,
        root: document.querySelector('#right-autocomplete'),
        onOptionSelect(movie) {
            document.querySelector('#message').classList.add('is-hidden');
            onMovieSelect(movie.imdbID, document.querySelector('#right-summary'), "right");
        }
    }
);

async function onMovieSelect(imdbId, summaryElement, selectedSide) {
    try {
        // ex: fhttps://www.omdbapi.com/?apikey=e9cecd9b&i=tt0848228
        const response = await axios.get(`${base_URL}`, {
            params: {
                apiKey: API_SECRET_KEY,
                i: imdbId
            }
        });

        summaryElement.innerHTML = movieTemplate(response.data);

        if (response.data.Error) {
            return [];
        } else {
            if (selectedSide === "left") {
                leftMovieData = response.data;
            } else {
                rightMovieData = response.data;
            }

            if (rightMovieData && leftMovieData) {
                runComparison();
            }
        }

    }
    catch (e) {
        console.log("Oops! Something went wrong!, Movie details retrieval failed!", e.message);
    }
}

const runComparison = () => {

    const leftSideStats = document.querySelectorAll('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStat, idx) => {
        const rightStat = rightSideStats[idx];

        const leftStatValue = parseInt(leftStat.dataset.value);
        const rightStatValue = parseInt(rightStat.dataset.value);

        if (rightStatValue > leftStatValue) {
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warning');
        } else {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning');
        }
    });
};

function movieTemplate(movieDetail) {

    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, ""));
    const metaScore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
    const awards = movieDetail.Awards.split(" ").reduce((prev, curr) => {
        const value = parseInt(curr);

        if (isNaN(value)) {
            return prev;
        } else {
            return prev + value;
        }
    }, 0)

    console.log(awards, dollars, metaScore, imdbRating, imdbVotes);

    return `
<div class="card">
<div class="card-content">
  <div class="media">
    <div class="media-left">
      <figure class="image is-96x96">
        <img src=${movieDetail.Poster} alt="Placeholder image">
      </figure>
    </div>
    <div class="media-content">
      <p class="title is-4">${movieDetail.Title}</p>
      <p class="subtitle is-6">${movieDetail.Plot || 'N/A'}</p>
    </div>
  </div>

  <article data-value=${awards} class="notification is-primary">
  <p class="title is-4">${movieDetail.Awards || 'N/A'}</p>
  <p class="subtitle is-6">Awards</p>
  </article>

  <article data-value=${dollars} class="notification is-primary">
  <p class="title is-4">${movieDetail.BoxOffice || 'N/A'}</p>
  <p class="subtitle is-6">BoxOffice</p>
  </article>

  <article data-value=${metaScore} class="notification is-primary">
  <p class="title is-4">${movieDetail.Metascore || 'N/A'}</p>
  <p class="subtitle is-6">Metascore</p>
  </article>

  <article data-value=${imdbRating} class="notification is-primary">
  <p class="title is-4">${movieDetail.imdbRating || 'N/A'}</p>
  <p class="subtitle is-6">IMDB</p>
  </article>

  <article data-value=${imdbVotes} class="notification is-primary">
  <p class="title is-4">${movieDetail.imdbVotes || 'N/A'}</p>
  <p class="subtitle is-6">IMDB Votes</p>
  </article>

</div>
</div>
`;
}


