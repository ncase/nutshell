let clickme = document.querySelector("#clickme");
clickme.onclick = (e)=>{
    setTimeout(()=>{
        e.target.select();
    },1);
}
/*clickme.onmouseout = (e)=>{
    e.target.blur();
}*/

let fullURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell/nutshell.js';
let minURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell/nutshell.min.js';

//let fullURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell/nutshell.js';
//let minURL = 'https://cdn.jsdelivr.net/gh/ncase/nutshell/nutshell.min.js';

let fullOrMin = (new URL(window.location.href)).searchParams.get('url');
let resource = (fullOrMin=='full') ? fullURL : minURL;

clickme.value = `<script src="${resource}"></script>`;