export { manageNavbar };

function manageNavbar() {
    //navlinks
    const tableLink = document.querySelector('.table-link');
    const filtersLink = document.querySelector('.filters-link');
    const filtersDiv = document.getElementById('filters-div');
    const tableDiv = document.getElementById('table-div');

    filtersLink.addEventListener('click', () => {
        //show filters window
        if (!filtersLink.classList.contains('nav-link-active')) {
            filtersLink.classList.add('nav-link-active');
            tableLink.classList.remove('nav-link-active');
            filtersDiv.classList.add('shown');
            tableDiv.classList.add('hidden');
        }
    });
    tableLink.addEventListener('click', () => {
        //show table window
        if (!tableLink.classList.contains('nav-link-active')) {
            tableLink.classList.add('nav-link-active');
            filtersLink.classList.remove('nav-link-active');
            tableDiv.classList.remove('hidden');
            filtersDiv.classList.remove('shown');
        }
    });
}