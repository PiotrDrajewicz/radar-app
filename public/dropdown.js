export { manageDropdownMenu };

function manageDropdownMenu() {
    //opening and closing dropdown menu
    document.addEventListener('click', e => {
        const isDropdownButton = e.target.matches('.dropdown-button');
        //if we're not clicking on dropdown button and we're clicking inside dropdown (closest will give us here closest parent dropdown) ignore it
        if (!isDropdownButton && e.target.closest('.dropdown') != null) return

        //opening and closing dropdown menu (we're giving dropdown element class 'active' and due to that, our dropdown menu in css is being activated (.dropdown.active>.dropdown-button+.dropdown-menu) and it's getting opacity: 1)
        let currentDropdown;
        if (isDropdownButton) {
            currentDropdown = e.target.closest('.dropdown');
            currentDropdown.classList.toggle('active');
        }

        //rotating button arrow
        let currentDropdownButton;
        if (e.target.closest('.dropdown') || (e.target.closest('.dropdown') && !e.target.closest('.dropdown').classList.contains('active'))) {
            currentDropdownButton = e.target.closest('.dropdown').querySelector('.dropdown-button');
            currentDropdownButton.classList.toggle('active');
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
    })
}