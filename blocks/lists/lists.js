/*
document.addEventListener("DOMContentLoaded", function ()){
    const buildListSelect = document.querySelector("[name = 'buildList']");

    const sections = {
        childPages: document.querySelector("[name = 'childPages']"),
        fixedList: document.querySelector("[name = 'fixedList']"),
        search: document.querySelector("[name = 'search']"),
        tags: document.querySelector("[name = 'tags']"),
    };

    function updateVisibility(){
        const selectedValue = buildListSelect.value;
        Object.keys(sections).forEach(key => {
            if(sections[key]){
                sections[key].style.display = (key === selectedValue) ? "block" : "none";
            }
        });
    }
    buildListSelect.addEventListener("change", updateVisibility);
    updateVisibility();



}*/
