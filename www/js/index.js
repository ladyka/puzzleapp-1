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
		page('/index/:id', index);
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
		ImgCache.init(function(){

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
			)
		});
		//page.redirect('/index');
		/*
		 window.resolveLocalFileSystemURL(cordova.file.applicationDirectory+'www/', function(dir) {
		 dir.getFile("levels.json", {create:true}, function(file) {
		 file.createWriter( function(fileWriter) {
		 //fileWriter.seek(fileWriter.length);
		 var jsons = JSON.stringify(levels);
		 var blob = new Blob([jsons], {type:'text/plain'});
		 fileWriter.write(blob);
		 alert("ok, in theory i worked");
		 }, function(error){alert('damn son  -  '+error)});
		 });
		 });
		 */
		function cache_levels(entry,progress_dialog){
			var db = openDatabase('Levels','1.0','Levels',10000);
			db.transaction(function (tx) {
				tx.executeSql('CREATE TABLE IF NOT EXISTS lv_data (level_id INTEGER UNIQUE, progress INTEGER, full VARCHAR, empty VARCHAR )',
					null, function(tx,result){console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")},function(e){console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSsss")});
				//tx.executeSql("INSERT INTO lv_data (level_id, parts) VALUES (1,'maybe bullshit?' ) ");
				//alert('inserted');
			});
			progress_dialog.text('JSON загружен');
			entry.file(function (file) {
				var reader = new FileReader();
				reader.onloadend = function (e) {

					var levels = JSON.parse(this.result);
					//if (level) { alert('объект уровня null, что-то случилось при чтении файла'); page('/index');}
					var progress = 0;
					var all_parts = 0;
					levels.forEach(function(element,index){
						all_parts += element.parts.length+2;

					});
					var interval = 100/all_parts;
					//alert(interval+'       '+all_parts + '    === '+ interval*all_parts);
					levels.forEach(function(element,index) {
						db.transaction(function (tx) {
							tx.executeSql("INSERT OR IGNORE INTO lv_data VALUES("+index+", 0,'"+ element.full+"', '"+element.empty+"');", [], function (tx, results) {
								//var len = results.rows.length, i;
								console.log(results);
								//alert('done with '+index );
							},function(){alert('err')});
						});
						localStorage.setItem(index, JSON.stringify({progress:0,full:element.full,empty:element.empty}));

						//кэшируем шаблон

						ImgCache.isCached(element.empty, function (path, success) {
							if (success) {
								progress += interval;
								progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
								if(parseInt(progress) == 99){
									document.getElementById('app_section').innerHTML = '' +
										'<div id="splash"><img src="img/splash.png"></div>' +
										'<div id="start-button"><a href="/index/0">Играть</a></div>';
								}
							}
							else {
								ImgCache.cacheFile(element.empty,
									function () {
										progress += interval;
										progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
										if(parseInt(progress) ==99){
											document.getElementById('app_section').innerHTML = '' +
												'<div id="splash"><img src="img/splash.png"></div>' +
												'<div id="start-button"><a href="/index/0">Играть</a></div>';
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


						//кэшируем кусочки

						element.parts.forEach(function(element,index) {
							var i2 = index;
							ImgCache.isCached(element.ref, function (path, success) {
								if (success) {
									progress += interval;
									progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
									if(parseInt(progress) == 99){
										document.getElementById('app_section').innerHTML = '' +
											'<div id="splash"><img src="img/splash.png"></div>' +
											'<a href="/index/0"><img src="img/ButtonPlay.png"></a>';
									}
								}
								else {
									ImgCache.cacheFile(element.ref,
										function () {
											progress += interval;
											progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
											if(parseInt(progress) ==99){
												document.getElementById('app_section').innerHTML = '' +
													'<div id="splash"><img src="img/splash.png"></div>' +
													'<a href="/index/0"><img src="img/ButtonPlay.png"></a>';
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
						//кэшируем полную картинку

						ImgCache.isCached(element.full, function (path, success) {
							if (success) {
								progress += interval;
								progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
								if(parseInt(progress) == 99){
									document.getElementById('app_section').innerHTML = '' +
										'<div id="splash"><img src="img/splash.png"></div>' +
										'<a href="/index/0"><img src="img/ButtonPlay.png"></a>';
								}
							}
							else {
								ImgCache.cacheFile(element.full,
									function () {
										progress += interval;
										progress_dialog.text('Загрузка кэша '+parseInt(progress)+'%');
										if(parseInt(progress) ==99){
											document.getElementById('app_section').innerHTML = '' +
												'<div id="splash"><img src="img/splash.png"></div>' +
												'<a href="/index/0"><img style="width:20% " src="img/ButtonPlay.png"></a>';
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
				};
				reader.readAsText(file);
			});
		}
	}
};


function index(ctx) {
	var id = ctx.params.id;
	var app_section = document.getElementById('app_section');
	app_section.innerHTML = '';

	var db = openDatabase('Levels','1.0','Levels',10000);
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM lv_data', [], function (tx, results) {
			/*
			 var s;
			 for(var i = 0; i< results.rows.length;i++) {
			 s += 'id: '+results.rows.item(i).level_id+', progress: '+ results.rows.item(i).progress+"\n";
			 }
			 alert(s);
			 */
			window.resolveLocalFileSystemURL(cordova.file.applicationDirectory+'www/maps.json',
				function (fileEntry) {
					fileEntry.file(
						function (file) {
							var reader = new FileReader();
							reader.onloadend = function (e) {
								//console.log(this.result);
								var map = JSON.parse(this.result)[id];
								var heightRatio = screen.height/map.height;
								var widthRatio = screen.width/map.width;
								$('#app_section').append('<div id="map"><img src="'+cordova.file.applicationDirectory+'www/img/'+map.img+'"></div>');
								var map_el = document.getElementById('map');

								$('#map').css({
									width: map.width * widthRatio,
									height: map.height * widthRatio,
									top: screen.height/2 - map.height/2,
									left: 0
								});
								map.levels.forEach(function(element,index){
									var level_link = $('#app_section')[0].appendChild(document.createElement('a'));
									level_link.setAttribute('href','/play/' + index);
									var img = new Image(50);
									img.style.position = 'absolute';
									img.style.left = element.x * widthRatio - 10+ 'px';
									img.style.top = (screen.height / 2 - map.height / 2 + element.y) * widthRatio - 30+ 'px';
									img.onload = function(){
										level_link.appendChild(img);
									};
									if(results.rows.item(index)){
										if(results.rows.item(index).progress == 0){
											img.src = cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(results.rows.item(index).empty);
										}
										else {
											img.src = cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(results.rows.item(index).full);
										}
									}
								});

							};
							reader.readAsText(file);
						},
						function(){
							alert('Фон не найден');
						}
					);
				}
			);
		});
	});

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
					var levels = JSON.parse(this.result);
					if (levels[lid]!=null) {
						parseLevel(levels[lid]);
					}else {
						alert('Уровень с данным индексом не найден'); page('/index/0');
					}
				};
				reader.readAsText(file);
			})
		},
		function (e) {
			alert("ошибка файловой системы: " + e);
			page('/index/0');
		}
	);

	function parseLevel(lv) {
		//if (lv==null) { alert('объект уровня null, что-то случилось при чтении файла'); page('/index/0');}
		var img1 = new Image();
		img1.onload = function(){
			var santah = this.height;
			var santaw = this.width;
			var magic_ratio = screen.height*0.45/santah;

			app_section.innerHTML += '<div class="parts" id="main" ></div>';
			var main = $('#main');
			main.append(img1);
			//$('#main img').attr('src',cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(lv.empty));

			main.css({
				height: '45%'
			});
			santah =parseInt($('#main img').css('height'));
			santaw =parseInt($('#main img').css('width'));


			main.css({
				top:screen.height/2 - santah/2,
				left:screen.width/2 - santaw/2
			});

			var sector = 360/lv.parts.length;
			var angle = 0;
			var radius = (screen.height/2 - santah/2)/2 + santah/2;

			function each(parts,i){
				if(i=== undefined){
					i=0
				}
				if(i<parts.length) {
					var img = new Image();
					img.onload = function(){
						var parth = this.height;
						var partw = this.width;
						var div = app_section.appendChild(document.createElement('div'));
						div.setAttribute('id',parts[i].id);
						div.setAttribute('class','draggable parts');
						var part = $('#' + parts[i].id);
						part.append(img);
						$('#'+parts[i].id+' img').css({height:'100%'});
						part.css({
							height: parth * magic_ratio
						});
						var initial_y = screen.height / 2 + radius * Math.cos(angle * Math.PI / 180) - parth * magic_ratio / 2;
						var initial_x = screen.width / 2 + radius * Math.sin(angle * Math.PI / 180) - partw * magic_ratio / 2;
						part.css({
							top: initial_y,
							left: initial_x
						});

						$('.draggable').draggable();

						part.on('mouseup', function (e) {

							var range = 30;
							var x = screen.width / 2 - santaw / 2 + parts[i].x * magic_ratio;
							var y = screen.height / 2 - santah / 2 + parts[i].y * magic_ratio;
							if (e.target.x > (x - range) && e.target.x < (x + range) && e.target.y > (y - range) && e.target.y < (y + range)) {
								part.css({
									top: y,
									left: x
								});
								part.off('mouseup');
								part.draggable('destroy');
								check(lv.parts.length, lv.id);
							}
							else {
								part.css({
									top: initial_y,
									left: initial_x
								})
							}
						});
						angle += sector;

						each(parts, i + 1);
					};
					img.src = cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(parts[i].ref);
				}
			}
			each(lv.parts);
		};
		img1.src = cordova.file.cacheDirectory + ImgCache.private.getCachedFilePath(lv.empty);
	}
	function check(n, id) {
		done++;
		if (done == n) {
			done = 0;
			$('<div id="win">Уровень пройден!' +
				'<div id="win_buttons">' +
				'<a href="/index/0"><img src="'+cordova.file.applicationDirectory+'www/img/ButtonBack.png'+'"></a>' +
				'<a href="/play/'+id+'"><img src="'+cordova.file.applicationDirectory+'www/img/ButtonActive.png'+'"></a></div>')
				.appendTo('#app_section');
			$('#win').css('top', screen.height/2);
			$('#win').css('left', screen.width/4);
			$('#win').css('left', screen.width/4);

			var db = openDatabase('Levels','1.0','Levels',10000);
			db.transaction(function (tx) {
				tx.executeSql("UPDATE OR IGNORE lv_data SET progress=1 WHERE level_id=" + (id-1), [], function (tx, results) {
					//alert('?');
				});
			});
		}

	}
}