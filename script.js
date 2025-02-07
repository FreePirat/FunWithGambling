document.addEventListener("DOMContentLoaded", () => {
    // Menu Toggle
    const menu = document.querySelector('.menu');
    const button = document.querySelector('.menu-button');

    if (menu && button) {
        button.addEventListener('click', () => {
            menu.classList.toggle('open');
        });
    }

    // Avatar Handling
    let isSignedIn = false;
    const avatarButton = document.getElementById('avatarBtn');
    const avatar = document.getElementById('avatar');

    function updateAvatar() {
        if (!avatar) return;
        
        if (isSignedIn) {
            avatar.classList.remove('guest-avatar');
            avatar.classList.add('profile-avatar');
        } else {
            avatar.classList.remove('profile-avatar');
            avatar.classList.add('guest-avatar');
        }
    }

    if (avatarButton) {
        avatarButton.addEventListener('click', () => {
            alert(isSignedIn ? 'Go to your profile page.' : 'Please sign in.');
        });
    }

    updateAvatar();
});