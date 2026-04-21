function getParam(param){
    return (new URL(window.location.href)).searchParams.get(param);
}

function getSearchParam(){
    return getParam(searchParam);
}

function addEvents(dt) {
    dt.on('search.dt', saveSearchParam);
    $(window).on('popstate', loadParams);
}

function removeEvents(dt) {
    dt.off('search.dt', saveSearchParam);
    $(window).off('popstate', loadParams);
}

function saveSearchParam(e, settings) {
    const url = new URL(window.location.href);
    dtUpdateParam(url, searchParam, e.dt.search());
    dtSaveParams(url);
}

function updateParam(url, param, value) {
    if (value === undefined) {
        url.searchParams.delete(param);
    } else {
        url.searchParams.set(param, value);
    }
}

function saveParams(url) {
    if (window.location.href !== url.href) {
        history.pushState(undefined, '', url.href);
    }
}

function loadParams(e) {
    $(':focus').blur(); // Otherwise old values are retained
    $.fn.dataTable.tables({api: true}).iterator('table', function(table, i) {
        removeEvents(this);
        this.search(getSearchParam());
        this.draw();
        addEvents(this);
    });
}
