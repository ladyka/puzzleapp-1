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
        ImgCache.init();

        page.base('');
        page('/index', index);
        page('/play/:id', play);
        page();
        document.getElementById('app_section').innerHTML = '' +
            '<div id="splash"><img src="img/splash.png"></div>' +
            '<div class="spinner">' +
            '<div class="bounce1"></div>' +
            '<div class="bounce2"></div>' +
            '<div class="bounce3"></div></div>' +
            '<div id="progress_dialog"></div>';


        var progress_dialog = $('#progress_dialog');

        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory+'levels.json',
            function (fileEntry) {
                cache_levels(fileEntry,progress_dialog);
            },
            function(){
                var jTransfer = new FileTransfer();
                jTransfer.download('http://pastebin.com/raw/cKPcFcpJ', cordova.file.cacheDirectory + 'levels.json',
                    function (entry) {
                        cache_levels(entry,progress_dialog);
                    },
                    function (error) {
                        progress_dialog.text('JSON не загружен, проверьте подключение к Интернету и перезапустите приложение');
                    },
                    true
                );
            }
        );
        //page.redirect('/index');
        function cache_levels(entry,progress_dialog){
            //var s = entry.nativeURL;
            progress_dialog.text('JSON загружен');
            entry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {

                    var levels = JSON.parse(this.result);
                    //if (level) { alert('объект уровня null, что-то случилось при чтении файла'); page('/index');}
                    var progress = 0;
                    var all_parts = 0;
                    levels.forEach(function(element,index){
                        all_parts += element.parts.length;
                    });
                    var interval = 100/all_parts;
                    levels.forEach(function(element,index) {
                        element.parts.forEach(function(element,index) {
                            var i2 = index;
                            ImgCache.isCached(element.ref, function (path, success) {
                                if (success) {
                                    console.log('already cached');
                                    progress += interval;
                                    progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
                                    if(parseInt(progress) == 100){
                                        document.getElementById('app_section').innerHTML = '' +
                                            '<div id="splash"><img src="img/splash.png"></div>' +
                                            '<div id="start-button"><a href="/index">Играть</a></div>';
                                    }
                                }
                                else {
                                    ImgCache.cacheFile(element.ref,
                                        function () {
                                            console.log('cached');
                                            progress += interval;
                                            progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
                                            if(parseInt(progress) ==100){
                                                document.getElementById('app_section').innerHTML = '' +
                                                    '<div id="splash"><img src="img/splash.png"></div>' +
                                                    '<div id="start-button"><a href="/index">Играть</a></div>';
                                            }
                                        },
                                        function () {
                                            console.log('cache problem');
                                            alert('Возникла проблема при кэшировании, провертье подключение к Интернету и перезапустите приложение');
                                            return;
                                        }
                                    );
                                }
                            });
                        });

                    });
                };
                reader.readAsText(file);
            });
        }
    }
};


function index() {
    /*
     var db = openDatabase('Levels','1.0','Levels',10000);
     db.transaction(function (tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS lv_data (id INTEGER PRIMARY KEY, level_id INTEGER, parts TEXT )');
     //tx.executeSql("INSERT INTO lv_data (level_id, parts) VALUES (1,'maybe bullshit?' ) ");
     alert('inserted');
     });
     db.transaction(function (tx) {
     tx.executeSql('SELECT * FROM lv_data', [], function (tx, results) {
     var len = results.rows.length, i;
     for (i = 0; i < len; i++){
     alert(results.rows.item(i).parts);
     }
     });
     });
     */
    var app_section = document.getElementById('app_section');
    app_section.innerHTML = '';
    for(var i = 0; i<2; i++) {
        app_section.innerHTML += '<div id="start-button"><a href="/play/' + i + '">Уровень '+i+'</a></div>';
    }
    /*
     var fileTransfer = new FileTransfer();
     fileTransfer.download('http://freepacman.ru/images/play-game.png', cordova.file.cacheDirectory + 'start.png',
     function (entry) {
     var s = entry.nativeURL;
     app_section.innerHTML += '<img src="' + s.substr(8) + '">';

     },
     function (error) {
     alert('картинка не загрузилась, на кнопке обычный текст (можно взять из кэша)\nКод ошибки:  ' + error.code);
     //app_section.innerHTML = '<div id="start-button"><a href="/play"><h1>Играть</h1></a></div>';
     },
     true
     );

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


function play(ctx) {

    var lid = parseInt(ctx.params.id);
    var done = 0;


    var app_section = document.getElementById('app_section');
    app_section.innerHTML = '';

    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory + 'levels.json',
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
            page('/index');
        }
    );

    function parseLevel(lv) {
        if (!lv) { alert('объект уровня null, что-то случилось при чтении файла'); page('/index');}

        app_section.innerHTML += '<div class="parts" id="main" ><img src="' + lv[lid].main.ref + '" ></div>';
        lv[lid].parts.forEach(function (element) {
            ImgCache.isCached(element.ref, function(path, success) {
                if(success) {
                    app_section.innerHTML += '<div class="draggable parts" id="' + element.id + '" >' +
                        '<img src="' + cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(element.ref) + '"></div>';
                }
                else {
                    ImgCache.cacheFile(element.ref,
                        function () {
                            app_section.innerHTML += '<div class="draggable parts" id="' + element.id + '" >' +
                                '<img src="' + cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(element.ref) + '"></div>';
                            //alert('done '+ImgCache.private.getCachedFileFullPath(element.ref));
                        },
                        function () {
                            alert('cache problem')
                        }
                    );
                }
            });
        });
        setTimeout(function () {

            var main = document.getElementById('main');

            var santaw = main.offsetWidth / window.devicePixelRatio;
            var santah = main.offsetHeight / window.devicePixelRatio;

            main.setAttribute('style', 'top:' + ((screen.height / 2) - santah / 2) + 'px' +
                '; left:' + ((screen.width / 2) - santaw / 2) + 'px');
            var santax = main.offsetLeft;
            var santay = main.offsetTop;
            $('#app_section').css('display', 'block');
            $('.parts img').css({
                width: function (index, value) {
                    return parseFloat(value) / window.devicePixelRatio;
                }
            });
            $('.draggable').draggable();


            lv[lid].parts.forEach(function (element,index) {
                var top_bar = Math.floor(lv[lid].parts.length/2)-1;
                var bottom_bar = lv[lid].parts.length - top_bar;

                var iniy,inix;
                if(index<=top_bar){
                    $('#'+element.id).css('position', 'absolute');
                    inix = (index)*screen.width/(top_bar+1)+(parseFloat($('#'+element.id).css('width'))/window.devicePixelRatio)/2;
                    $('#'+element.id).css('left', inix );
                    iniy = santay/2 - (parseFloat($('#'+element.id).css('height'))/window.devicePixelRatio)/2;
                    $('#'+element.id).css('top', iniy );
                }
                else {
                    $('#'+element.id).css('position', 'absolute');
                    inix = (index-top_bar)*screen.width/bottom_bar-(parseFloat($('#'+element.id).css('width'))/window.devicePixelRatio)/2;
                    $('#'+element.id).css('left', inix );
                    iniy =santay + santah+(screen.height- santay - santah)/2 - (parseFloat($('#'+element.id).css('height'))/window.devicePixelRatio)/2;
                    $('#'+element.id).css('top', iniy );
                }

                /*
                 var sector = 360/lv[lid].parts.length;
                 var angle = 0;
                 var radius = screen.width/4;
                 angle +=sector;
                 var tan = Math.tan(angle * Math.PI/180);
                 var inix = Math.sqrt(radius*radius/(tan+1));
                 var iniy = inix*tan;
                 alert('sector: ${sector} \n angle: ${angle} \n tan: ${tan} \n inix: ${inix} \n iniy: ${iniy}');
                 $('#'+element.id).css('position', 'absolute');
                 $('#'+element.id).css('top', iniy);
                 $('#'+element.id).css('left', inix);
                 */
                $('#'+element.id).on('mouseup', function(e){

                    var x = santax + (element.x / window.devicePixelRatio);
                    var y = santay + (element.y / window.devicePixelRatio);
                    if (e.target.x > (x - 100) && e.target.x < (x + 100) && e.target.y > (y - 100) && e.target.y < (y + 100)) {
                        $('#'+element.id).css('position', 'absolute');
                        $('#'+element.id).css('top', y);
                        $('#'+element.id).css('left', x);
                        $('#'+element.id).off('mouseup');
                        $('#'+element.id).draggable('destroy');
                        check(lv[lid].parts.length);
                    }
                    else {
                        if(index<=top_bar){
                            $('#'+element.id).css('position', 'absolute');
                            $('#'+element.id).css('left', inix );
                            $('#'+element.id).css('top', iniy );
                        }
                        else {
                            $('#'+element.id).css('position', 'absolute');
                            $('#'+element.id).css('left', inix );
                            $('#'+element.id).css('top', iniy );
                        }

                    }
                });
            });
        }, 1000);


    }
    function check(n) {
        done++;
        if (done == n) {
            done = 0;
            $('<div id="win">Уровень пройден!<p><a href="/index" >Вернуться в главное меню</a></p></div>')
                .appendTo('#app_section');
            var win = document.getElementById('win');
            var winh = win.offsetHeight;
            var winw = win.offsetWidth;
            win.setAttribute('style', 'display: block;position:absolute; z-index:111; top:' + ((screen.height / 2) - winh / 2) + 'px' +
                '; left:' + ((screen.width / 2) - winw / 2) + 'px');
        }

    }
}