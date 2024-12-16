const baseUrl = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('address-input');
    const suggestionsList = document.getElementById('suggestions-list');

    input.addEventListener('input', async () => {
        const searchText = input.value;

        if (searchText.length < 3) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/suggestions?searchText=${encodeURIComponent(searchText)}`);
            const data = await response.json();

            suggestionsList.innerHTML = '';
            if (data.suggestions.length > 0) {
                data.suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion.full_address || suggestion.name;
                    li.addEventListener('click', async () => {
                        input.value = li.textContent;
                        suggestionsList.innerHTML = '';
                        suggestionsList.style.display = 'none';

                        localStorage.setItem('address', li.textContent);

                        window.location.href = '/weather-page';
                    });
                    suggestionsList.appendChild(li);
                });
                suggestionsList.style.display = 'block';
            } else {
                suggestionsList.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    });

    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        }
    });
});

if (window.location.pathname === '/weather-page') {
    document.getElementById('saveWeatherBtn').style.display = 'inline-block';
}


document.getElementById('saveWeatherBtn').addEventListener('click', function () {
    confetti();

    setTimeout(function () {
        window.location.href = '/history-page';
    }, 2000);
    // const weatherData = localStorage.getItem('weatherdata');

    // if (weatherData) {
    //     fetch('http://localhost:3000/save-weather', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ data: weatherData })
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Success:', data);
    //         confetti();
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error);
    //     });
    // } else {
    //     alert('No weather data found in storage.');
    // }
});

function redirectToHomePage() {
    window.location.href = '/home-page';
}