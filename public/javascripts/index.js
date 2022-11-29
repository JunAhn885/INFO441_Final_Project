async function init(){
    let urlInput = document.getElementById("urlInput");
    urlInput.onkeyup = previewUrl;
    urlInput.onchange = previewUrl;
    urlInput.onclick = previewUrl;

    await loadIdentity();
    loadPosts();
}