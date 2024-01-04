

const getQueryParmByName = (url, name) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.get(name);
}

module.exports = getQueryParmByName