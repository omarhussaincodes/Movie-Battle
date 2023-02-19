export const createAutoComplete = ({
    root,
    renderOption,
    onOptionSelect,
    inputValue,
    fetchData
}) => {
    root.innerHTML = `
    <label><b>Search for a movie:</b></label>
    <input class="input is-primary" type="text" placeholder="Search for a movie">

    <div class="dropdown">
        <div class="dropdown-menu" role="menu">
            <div class="dropdown-content results">
            </div>
        </div>
    </div>
`;

    const dropdown = root.querySelector('.dropdown');
    const resultsWrapper = root.querySelector('.results');

    async function onInput(e) {

        const items = await fetchData(e.target.value);

        if (!items.length) {
            dropdown.classList.remove('is-active');
            return;
        }

        // empty the previous results from the dropdown
        resultsWrapper.innerHTML = '';
        dropdown.classList.add('is-active');

        for (let item of items) {
            const option = document.createElement('a');
            option.classList.add('dropdown-item');

            option.innerHTML = renderOption(item);

            option.addEventListener('click', async (event) => {
                // set the selected title in input box
                inputElement.value = inputValue(item);
                // close dropdown menu
                dropdown.classList.remove('is-active');
                // fetch movie details
                onOptionSelect(item);
            });
            resultsWrapper.appendChild(option);
        }
    }

    const inputElement = root.querySelector("input");
    if (inputElement !== null || inputElement !== undefined) {
        inputElement.addEventListener('input', debounce(onInput, 500));
    }

    document.addEventListener('click', event => {
        // root element encapsulates the entire dropdown
        // here we are adding event listener to the entire document
        // and checking if the clicked event is within the root element
        // if it isn't then close the dropdown
        if (!root.contains(event.target)) {
            // close dropdown menu
            dropdown.classList.remove('is-active');
        }
    });
};
