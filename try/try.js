/* Get all these editors started! */
let quill = new Quill('#editor-rich-textbox', {
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote'],
            ['link', { 'list': 'bullet' }, { 'list': 'ordered'}],
            ['image']
        ]
    },
    theme: 'snow'
});
let codemirror_md = CodeMirror(document.querySelector('#editor-md'), {
    //lineNumbers: true,
    tabSize: 4,
    lineWrapping: true,
    mode: 'markdown'
});
let codemirror_html = CodeMirror(document.querySelector('#editor-html'), {
    //lineNumbers: true,
    tabSize: 4,
    lineWrapping: true,
    mode: 'xml'
});
codemirror_md.setSize(600, 440);
codemirror_html.setSize(600, 440);

/* Load from MD file & set editors */
let showdownConverter = new showdown.Converter();
let loadFromMarkdownFile = (src)=>{

    // Get it!
    fetch(src)
        .then(response => {
            if(!response.ok) alert('Uh oh, 404?! Double check your internet connection.');
            else return response.text();
        })
        .then(data => {

            // Markdown & pretty HTML
            let rawMD = data,
                rawHTML = showdownConverter.makeHtml(rawMD).replace(/\sid=".*"/ig,""),
                prettyHTML = html_beautify(rawHTML);

            // Set editors
            quill.setContents( quill.clipboard.convert(rawHTML), 'silent');
            codemirror_md.setValue(rawMD);
            codemirror_html.setValue(prettyHTML);

            // Refresh preview!
            refreshPreview();

        })

};

/* Refresh that Nutshell preview */
let output = document.querySelector("#try-nutshell-output");
let refreshPreview = ()=>{
    switch(currentTool){
        case 'rich':
            output.innerHTML = quill.root.innerHTML;
            break;
        case 'md':
            let md = codemirror_md.getValue(),
                html = showdownConverter.makeHtml(md);
            output.innerHTML = html;
            break;
        case 'html':
            output.innerHTML = codemirror_html.getValue();
            break;
    }
    Nutshell.start(output);
};

/* Switch tool... */
let currentTool = 'rich'; // rich / md / html
let editor_rich = document.querySelector("#editor-rich"),
    editor_md   = document.querySelector("#editor-md"),
    editor_html = document.querySelector("#editor-html");
let switchTool = (tool, dontUpdatePreview)=>{

    // Hide all
    editor_rich.style.display = 'none';
    editor_md.style.display = 'none';
    editor_html.style.display = 'none';

    // Switch to...
    currentTool = tool;
    switch(currentTool){
        case 'rich': editor_rich.style.display = 'block'; break;
        case 'md':
            editor_md.style.display = 'block';
            codemirror_md.refresh();
            break;
        case 'html':
            editor_html.style.display = 'block';
            codemirror_html.refresh();
            break;
    }

    // Refresh preview!
    if(!dontUpdatePreview) refreshPreview();

}

/* START */
let hash = window.location.hash.slice(1);
let filenames = ['NutshellInANutshell','GettingStarted','AdvancedFeatures'];
if(filenames.indexOf(hash)>=0){
    loadFromMarkdownFile(hash+'.md');
}else{
    loadFromMarkdownFile('GettingStarted.md');
}
switchTool('rich', true);
