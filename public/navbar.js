export { manageNavbar };

function manageNavbar() {
    //navlinks
    const tableLink = document.querySelector('.table-link');
    const filtersLink = document.querySelector('.filters-link');

    filtersLink.addEventListener('click', () => {
        //show filters window
        if (!filtersLink.classList.contains('nav-link-active')) {
            filtersLink.classList.add('nav-link-active');
            tableLink.classList.remove('nav-link-active');
        }
    });
    tableLink.addEventListener('click', () => {
        //show table window
        if (!tableLink.classList.contains('nav-link-active')) {
            tableLink.classList.add('nav-link-active');
            filtersLink.classList.remove('nav-link-active');
        }
    });
}