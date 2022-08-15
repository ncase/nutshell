let clickme = document.querySelector("#clickme");
clickme.onclick = (e)=>{
    setTimeout(()=>{
        e.target.select();
    },1);
}
/*clickme.onmouseout = (e)=>{
    e.target.blur();
}*/

let fullURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell@1.0.0/nutshell.js',
    minURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell@1.0.0/nutshell.min.js',
    fullOrMin = (new URL(window.location.href)).searchParams.get('url'),
    resource = (fullOrMin=='full') ? fullURL : minURL;
clickme.value = `<script src="${resource}"></script>`;