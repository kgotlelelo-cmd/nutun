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
            const response = await fetch(`http://localhost:3000/suggestions?searchText=${encodeURIComponent(searchText)}`);
            const data = await response.json();

            suggestionsList.innerHTML = '';
            if (data.suggestions.length > 0) {
                data.suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion.full_address || suggestion.name;
                    li.addEventListener('click', () => {
                        input.value = li.textContent;
                        suggestionsList.innerHTML = '';
                        suggestionsList.style.display = 'none';
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

    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
        }
    });
});