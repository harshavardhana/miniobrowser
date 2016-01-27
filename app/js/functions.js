/*
 * Isomorphic Javascript library for Minio Browser JSON-RPC API, (C) 2016 Minio, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
            $('.selectable').selectable({
            cancel: '.dropdown'
            });
        }

    })

    /* -----------------------------
        Scrollbar
     -------------------------------*/
    // function scrollBar(selector, theme, mousewheelaxis) {
    //     $(selector).mCustomScrollbar({
    //         theme: theme,
    //         scrollInertia: 100,
    //         axis:'y',
    //         mouseWheel: {
    //             enable: true,
    //             axis: mousewheelaxis,
    //             preventDefault: true
    //         }
    //     });
    // }
    //
    // scrollBar('.fe-scroll-list', 'minimal-dark', 'y');
});
