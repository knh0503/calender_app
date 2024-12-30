// Fetch and display users
fetch('/users')
    .then(response => response.json())
    .then(data => {
        const usersTable = document.getElementById('users-table').querySelector('tbody');
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
            `;
            usersTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching users:', error));

// Fetch and display events
fetch('/events')
    .then(response => response.json())
    .then(data => {
        const eventsTable = document.getElementById('events-table').querySelector('tbody');
        data.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.id}</td>
                <td>${event.title}</td>
                <td>${event.start_date}</td>
                <td>${event.end_date}</td>
            `;
            eventsTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching events:', error));
