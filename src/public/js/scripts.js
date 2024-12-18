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

                        window.location.href = `/weather-page/${encodeURIComponent(li.textContent)}`;
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

if (window.location.pathname.includes('weather-page')) {
    document.getElementById('saveWeatherBtn').style.display = 'inline-block';
}

function redirectToHomePage() {
    window.location.href = '/home-page';
}

$(function() {
    $('#weatherLink').on('click', function(event) {
        event.preventDefault();

        const address = localStorage.getItem('address');

        if (address) {
            window.location.href = `/weather-page/${encodeURIComponent(address)}`;
        } else {
            alert('No address saved. Please save an address before accessing the weather page.');
        }
    });

    $('#saveWeatherBtn').on('click', function () {
        const address = localStorage.getItem('address');
    
        if (!address) {
            alert('No address found in storage. Please save an address first.');
            return;
        }
    
        $.ajax({
            url: `${baseUrl}/weather/${encodeURIComponent(address)}`,
            method: 'GET',
            success: function (response) {
                response.address = address;
    
                localStorage.setItem('weatherData', JSON.stringify(response));
    
                $.ajax({
                    url: `${baseUrl}/save-weather`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(response),
                    success: function (saveResponse) {
                        console.log('Weather data saved successfully:', saveResponse);
    
                        confetti();
    
                        setTimeout(function () {
                            window.location.href = '/history-page';
                        }, 2000);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error saving weather data:', textStatus, errorThrown);
                        alert('Failed to save weather data. Please try again later.');
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error fetching weather data:', textStatus, errorThrown);
                alert('Failed to fetch weather data. Please try again later.');
            }
        });
    });
});