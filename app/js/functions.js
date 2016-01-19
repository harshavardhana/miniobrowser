$(document).ready(function() {
    /*--------------------------
        Login
    ----------------------------*/
    $('.lci-text').blur(function () {
        var x = $(this).val();
        var p = $(this).closest('.lc-item')

        p[ x.length > 0 ? 'addClass' : 'removeClass' ]('toggled');
    });


    $(function () {
        if ($('div.fesl-row')[0]) {

            /*--------------------------
                Context Menu
            ----------------------------*/
            $.contextMenu({
                selector: 'div.fesl-row',
                callback: function(key, options) {
                    var m = "clicked: " + key;
                    window.console && console.log(m) || alert(m);
                },
                items: {
                    "download": {name: "Download", icon: "download"},
                    "edit": {name: "Edit", icon: "edit"},
                    "cut": {name: "Cut", icon: "cut"},
                   copy: {name: "Copy", icon: "copy"},
                    "delete": {name: "Delete", icon: "delete"},
                }
            });

            /*--------------------------
                Selectable
            ----------------------------*/
            $('.selectable').selectable();
        }

    })


});
