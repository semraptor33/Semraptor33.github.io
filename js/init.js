$(document).ready(function(){
	// LOAD games.json

	let romEditor = new RomReader();
	let pokemonbases = [];
	let currentGame = null;
	$.getJSON("json/games.json").done(function(data){
		for(let machine in data){
			let games = data[machine];
			let html_games = "", total_games = 0;
			for(let title in games){
				let game = games[title];
				pokemonbases[title] = game;
				if(title != "global"){
					total_games++;
					html_games+=`<div class="game_option" data-value="${title}"><img src="css/images/roms/${machine}/boxart/${title}_foreground.jpg"/><h4>Pokémon ${title.replace(/\_/g, ' ')}</h4></div>`;
				}
			}
			if(total_games > 0){
				let msg = [["", "selected"], ["", "hide"]];
				let open = (machine != 'gba_roms')|0;
				$("#overflow_buttons").prepend(`<div class="overflow_button ${msg[0][1-open]}" data-machine="${machine}"><span class='upp'>${machine.replace(/\_/g, '</span> ')}</div>`);
				$("#games_overflow").prepend(`<div id="${machine}" class="${msg[1][open]}" style="width: ${total_games * 212.5}px">${html_games}<div class="clear"></div></div>`);
				romEditor.setGameBases(pokemonbases);
			}
		}
	});

	/* Game manually selected events */
	$("#games_overflow").on("mousemove", function(e){
		let ch = $(this).find("> div:not(.hide)");
		let df = (e.pageX - $(this).offset().left) / $(this).width();
		let dx = ch.width() > $(this).width() ? (df * ($(this).width() - ch.width())) : 0;
		ch.css("transform", "translateX("+ dx +"px)");
	});

	$("#games_overflow").on("click", ".game_option", function(){
		let had = $(this).hasClass("game_selected");
		$(".game_selected").removeClass("game_selected");
		$("#game_language .options div").addClass("hide");
		if(!had){
			let value = $(this).data("value");
			$(this).addClass("game_selected").parent().parent().data("selected", value);
			pokemonbases[value].language.forEach(a=>{ $("#game_language .options div[data-option=" + a + "]").removeClass("hide"); });
		}
		$("#game_language").data("value", "").find(".dropbox_title").html("-- Select the language --");
	});

	$("#system_unknown").on("click", ".overflow_button:not(.selected)", function(){
		$(".overflow_button.selected").removeClass("selected");
		$(this).addClass("selected");
		$("#games_overflow > div:not(.hide)").addClass("hide");
		$("#"+$(this).data("machine")).removeClass("hide");
	});

	$(".dropbox > .options div").on("click", function(){
		let parent = $(this).parent().parent();
		parent.find(".dropbox_title").html($(this).html());
		parent.data("value", $(this).data("option"));
	});

	/* Upload Method */
	$("#upload_drag").on("dragover", function(e){
    e.stopPropagation();
		e.preventDefault();
		$(this).addClass("hover");
	}).on("dragleave", function(e){
    e.stopPropagation();
		e.preventDefault();
		$(this).removeClass("hover");
	}).on("drop", selectFile);

	$("#upload_mini").on("click", ()=>$("#upload_input").click());
	$("#upload_input").on("change", selectFile);

	$("#upload_button").click(function(){
		if(currentGame != null){
			let info;
			if($(".game_option").hasClass("game_selected")){ // The game is selected manually.
				info = {lang: $("#game_language").data("value"), base: $("#games_overflow").data("selected")};
			}
			romEditor.loadROM(currentGame, info);
		}
	});

	$("#cancel_button").on("click", function(){
		$("#selectLightboxRom").animate({"opacity": 0}, 300, function(){
			$(this).addClass("lightbox_hide");
			$("#cancel_button").removeClass("hide");
		});
	});

	$("#new_upload").on("click", function(){
		$("#selectLightboxRom").animate({"opacity": 1}, 300,function(){
			$(this).removeClass("lightbox_hide");
		});
		$("#game_selection").removeClass("hide");
	});

	$("#rightside_menu > div[data-value]").on("click", function(e){
		e.preventDefault();
		if(romEditor.ReadOnlyMemory != undefined){
			let value = $(this).data("value");
			romEditor.changeWorkspace(value);
		}
	});

	$(".subpannel button").click(function(){
		if($(this).parent().hasClass("warp_pannel")){
			let map = parseInt($(this).parent().find("input[name=map]").val());
			let bank = parseInt($(this).parent().find("input[name=bank]").val());
			romEditor.changeMap(map, bank);
		}else{
			let value = parseInt($(this).parent().find("input[name=script]").val(), 16);
			if(value != 0x0){
				romEditor.codeResult(value);
			}
		}
		$("#mousepannel").addClass("hide");
	});

	function selectFile(e){
    e.stopPropagation();
		e.preventDefault();
		let files;
		if(Utils.isObject(e.originalEvent.dataTransfer)){
			files = e.originalEvent.dataTransfer.files;
		}else if(Utils.isObject(e.target)){
			files =  e.target.files;
		}else{
			console.error("ROMREADER: The file couldn't be accepted");
		}
		if(files.length === 1){
			let selected = files[0];
			$("#upload_drag h3").text("Game selected:");
			let split = selected.name.split(".");
			$("#upload_drag h4").text(split[0]);
			$("#upload_drag .small").text(`(*.${split[1]})`);
			currentGame = selected;
		}else{
			$("#upload_drag h3").text("Drag & Drop");
			$("#upload_drag h4").text("your Pokémon game");
			$("#upload_drag .small").text("(*.gba, *.gbc, *gb)");
			currentGame = null;
		}
		$("#upload_drag").removeClass("hover");
	}
});
