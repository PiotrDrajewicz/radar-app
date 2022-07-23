export { manageDropdownMenu };

function manageDropdownMenu() {
    //opening and closing dropdown menu
    document.addEventListener('click', e => {
        const isDropdownButton = e.target.matches('.dropdown-button');
        //if we're not clicking on dropdown button and we're clicking inside dropdown (closest will give us here closest parent dropdown) - ignore it
        if (!isDropdownButton && e.target.closest('.dropdown') != null) return

        //opening and closing dropdown menu (we're giving dropdown element class 'active' and due to that, our dropdown menu in css is being activated (.dropdown.active>.dropdown-button+.dropdown-menu) and it's getting opacity: 1)
        let currentDropdown;
        if (isDropdownButton) {
            currentDropdown = e.target.closest('.dropdown');
            currentDropdown.classList.toggle('active');
        }

        //rotating button arrow
        // let currentDropdownButton;
        // if (e.target.closest('.dropdown') || (e.target.closest('.dropdown') && !e.target.closest('.dropdown').classList.contains('active'))) {
        //     currentDropdownButton = e.target.closest('.dropdown').querySelector('.dropdown-button');
        //     currentDropdownButton.classList.toggle('active');
        //     currentDropdownButton.classList.toggle('opened');
        // }
        // if (!e.target.closest('.dropdown')) {
        //     document.querySelectorAll('.dropdown-button').forEach(button => {
        //         button.classList.remove('active');
        //         button.classList.remove('opened');
        //     })
        // }

        let currentDropdownButton;
        if (e.target.matches('#type-dropdown-button')) {
            currentDropdownButton = e.target;
            currentDropdownButton.classList.toggle('active');
            const otherButton = document.querySelector('#airline-dropdown-button');
            otherButton.classList.remove('active');
        }
        if (e.target.matches('#airline-dropdown-button')) {
            currentDropdownButton = e.target;
            currentDropdownButton.classList.toggle('active');
            const otherButton = document.querySelector('#type-dropdown-button');
            otherButton.classList.remove('active');
        }
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-button').forEach(button => {
                button.classList.remove('active');
            })
        }

        //closing all other active dropdowns
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            if (dropdown === currentDropdown) return
            dropdown.classList.remove('active');
        })
        document.querySelectorAll('.dropdown-button.opened').forEach(dropdownButton => {
            dropdownButton.classList.remove('opened');
        })

        //moving display window
        // const displayBannedWindow = document.querySelector('.banned-display');
        let currentBannedWindow;
        if (e.target.closest('.dropdown') || (e.target.closest('.dropdown') && !e.target.closest('.dropdown').classList.contains('active'))) {
            currentBannedWindow = e.target.closest('.dropdown').querySelector('.banned-display');
            //toggling banned types window and closing other one
            if (currentBannedWindow.id === 'banned-types-display') {
                currentBannedWindow.classList.toggle('active-right');
                const otherWindow = document.getElementById('banned-airlines-display');
                otherWindow.classList.remove('active-left');
            }
            //toggling banned airlines window and closing other one
            if (currentBannedWindow.id === 'banned-airlines-display') {
                currentBannedWindow.classList.toggle('active-left');
                const otherWindow = document.getElementById('banned-types-display');
                otherWindow.classList.remove('active-right');
            }
        }

        //moving both windows to default position when clicked outside dropdowns
        if (!e.target.closest('.dropdown')) {
            // const className = /active-(left|right)/g;
            document.querySelectorAll('.banned-display').forEach(window => {
                if (window.classList.contains('active-right')) {
                    window.classList.remove('active-right');
                }
                if (window.classList.contains('active-left')) {
                    window.classList.remove('active-left');
                }
            })
        }

    })
}