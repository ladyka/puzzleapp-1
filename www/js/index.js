/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        page.base('');
        page('/index', index);
        page('/play', play);
        page();
        page.redirect('/index');

    }
};
// the "notfound" implements a catch-all
// with page('*', notfound). Here we have
// no catch-all, so page.js will redirect
// to the location of paths which do not
// match any of the following routes
//
function index() {
    var fileTransfer = new FileTransfer();
    var sector = document.getElementById('sector');
    fileTransfer.download('http://freepacman.ru/images/play-game.png', cordova.file.cacheDirectory + 'start.png',
        function (entry) {
            var s = entry.nativeURL;
            alert('картинка загружена, она теперь должна быть на кнопке');
            sector.innerHTML = '<div id="start-button"><a href="/play"><img src="' + s.substr(8) + '"></a></div>';

        },
        function (error) {
            alert('картинка не загрузилась, на кнопке обычный текст (можно взять из кэша)\nКод ошибки:  ' + error.code);
            sector.innerHTML = '<div id="start-button"><a href="/play"><h1>Играть</h1></a></div>';
        },
        true
    );


    var jTransfer = new FileTransfer();
    jTransfer.download('http://pastebin.com/raw/cKPcFcpJ', cordova.file.dataDirectory + 'levels.json',
        function (entry) {
            var s = entry.nativeURL;
            alert('json загружен');
        },
        function (error) {
            alert('json лох, код ошибки:  ' + error.code);
        },
        true
    );
    /*
     window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
     dir.getFile("levels.json", {create:true}, function(file) {
     file.createWriter( function(fileWriter) {
     //fileWriter.seek(fileWriter.length);
     var jsons = JSON.stringify(levels);
     var blob = new Blob([jsons], {type:'text/plain'});
     fileWriter.write(blob);
     alert("ok, in theory i worked");
     }, function(error){alert('damn son  -  '+error)});
     });
     });*/

}

function play() {
    var sector = document.getElementById('sector');
    sector.innerHTML = '';

    window.resolveLocalFileSystemURL(cordova.file.dataDirectory + 'levels.json',
        function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    var level = JSON.parse(this.result);
                    parseLevel(level);
                };
                reader.readAsText(file);
            })
        },
        function (e) {
            alert("ошибка файловой системы: " + e);
        }
    );

    function parseLevel(lv) {
        if (lv) {
            sector.innerHTML += '<div class="parts" id="main" ><img src="' + lv[0].main.ref + '" ></div>';
            lv[0].parts.forEach(function (element) {
                sector.innerHTML += '<div class="draggable parts" id="' + element.id + '" ><img src="' + element.ref + '" ></div>';
            });

            setTimeout(function () {

                var main = document.getElementById('main');

                var santaw = main.offsetWidth / window.devicePixelRatio;
                var santah = main.offsetHeight / window.devicePixelRatio;

                main.setAttribute('style', 'top:' + ((screen.height / 2) - santah / 2) + 'px' +
                    '; left:' + ((screen.width / 2) - santaw / 2) + 'px');
                var santax = main.offsetLeft;
                var santay = main.offsetTop;
                $('#section').css('display', 'block');
                $('.parts img').css({
                    width: function (index, value) {
                        return parseFloat(value) / window.devicePixelRatio;
                    }
                });
                $('.draggable').draggable();


                lv[0].parts.forEach(function (element) {
                    $('#'+element.id).on('mouseup', function(e){
                        var x = santax + (element.x / window.devicePixelRatio);
                        var y = santay + (element.y / window.devicePixelRatio);
                        if (e.target.x > (x - 100) && e.target.x < (x + 100) && e.target.y > (y - 100) && e.target.y < (y + 100)) {
                            $('#'+element.id).css('position', 'absolute');
                            $('#'+element.id).css('top', y);
                            $('#'+element.id).css('left', x);
                            $('#'+element.id).off('mouseup');
                            $('#'+element.id).draggable('destroy');
                            check();
                        }
                    })
                });
            }, 300);

        }
        else alert('объект уровня null, что-то случилось при чтении файла');
    }
}

var done = 0;

function check() {
    done++;
    if (done == 6) {
        done = 0;
        $('<div id="win">Уровень пройден!<p><a href="/index" >Вернуться в главное меню</a></p></div>')
            .appendTo('#sector');
        var win = document.getElementById('win');
        var winh = win.offsetHeight;
        var winw = win.offsetWidth;
        win.setAttribute('style', 'display: block;position:absolute; z-index:111; top:' + ((screen.height / 2) - winh / 2) + 'px' +
            '; left:' + ((screen.width / 2) - winw / 2) + 'px');
    }
}