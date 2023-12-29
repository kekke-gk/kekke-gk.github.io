$(function(){
    in_form = $('#raw-form [name=raw]');
    out_form = $('#converted-form [name=converted]');

    $('#conv-btn').on('click', function(){
        conv(in_form.val())
    });

    $('#copy-btn').on('click', function(){
        out_form.select();
        document.execCommand('Copy');
    });

    $('#google-btn').on('click', function(){
        const translator_url = "https://translate.google.co.jp/#view=home&op=translate&sl=en&tl=ja&text=";
        conv(in_form.val(), translator_url)
    });

    $('#deepl-btn').on('click', function(){
        const translator_url = "https://www.deepl.com/translator#en/ja/";
        conv(in_form.val(), translator_url)
    });

    $('#clear-btn').on('click', function(){
        in_form.val('');
        out_form.val('');
    });
});

function conv(text, translator_url) {
    const conved_text = conv_text(in_form.val());

    if(translator_url) {
        const request_url = translator_url + encodeURI(conved_text);
        window.open(request_url, '_blank');
    }

    out_form.val(conved_text);
}

function conv_text(text) {
    console.log(text);
    text = text.replace(/-\n/gm, '')
    text = text.replace(/- /gm, '')

    text = text.replace(/\r\n/gm, ' ')
    text = text.replace(/\n/gm, ' ')
    text = text.replace(/\r/gm, ' ')
    text = text.replace(/\s+/gm, ' ')

    text = text.replace(/Fig\./gm, 'Figure')
    text = text.replace(/Sec\./gm, 'Section')
    text = text.replace(/Eq\./gm, 'Equation')

    text = text.replace(/e\.g\./gm, 'e,g,')
    text = text.replace(/i\.e\./gm, 'i,e,')
    text = text.replace(/et al\./gm, 'et al,')
    text = text.replace(/(\d+)\.(\d+)/gm, '$1,$2')
    text = text.replace(/\.\.\./gm, ',,,')

    text = text.replace(/\./gm, '.\n\n')

    text = text.replace(/e,g,/gm, 'e.g.')
    text = text.replace(/i,e,/gm, 'i.e.')
    text = text.replace(/et al,/gm, 'et al.')
    text = text.replace(/(\d+),(\d+)/gm, '$1.$2')
    text = text.replace(/,,,/gm, '...')

    text = text.replace(/\.\n\n\s/gm, '.\n\n')
    text = text.trim()

    return text
}
