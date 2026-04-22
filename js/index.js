firebase.auth().onAuthStateChanged(user => {
    const loginBtn = document.getElementById('login-btn');
    if (user) {
        loginBtn.style.display = 'none';
        // Add user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'dropdown ms-2';
        userMenu.innerHTML = `
            <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle"></i>
            </button>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
            </ul>
        `;
        loginBtn.parentNode.appendChild(userMenu);
    } else {
        loginBtn.style.display = 'inline-block';
        // Remove user menu if exists
        const userMenu = document.querySelector('.dropdown.ms-2');
        if (userMenu) userMenu.remove();
    }
});

function logout() {
    firebase.auth().signOut().then(() => {
        console.log('User logged out');
        // The onAuthStateChanged will handle the UI update
    }).catch(error => {
        console.log('Logout error', error);
    });
}