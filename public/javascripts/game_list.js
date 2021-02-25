//page variable
var editing_item = null;
var item_name = "Game";
var item_names = "Games";
var deleted_id = null;
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";
var tag_array = [];
var img_array = [];
var flagNewImage = false;
var imageLogo = null;
var imageCover = null;
var imageScreenshot = null;
var linkImage = null;

var Page_script = function () {
	return {
		//main function
		init: function () {
		},
	};
}();

function str_pad(n) {
	return String("00" + n).slice(-2);
}

//ajax get all game
_send_info.data = {
	limit: 1000,
	offset: 0
};
$.ajax({
	url: base_request_url + "/anonymous/splayTag",
	type: "GET",
	data: _send_info.data,
	contentType: "application/json",
	dataType: "json",
	success: function (data) {
		$(".loading_icon").hide();
		$(data.data).each(function (key, item) {
			$("#single_select_game_tag").append("<option value='" + item.id + "'> " + item.name + "</option>");
		});
		load_autocomplete_component();
	},
	error: function (err) {
		console.log(err.error());
	}
});

var load_page = function () {
	var remove_tag = function (id) {
		tag_array.splice(tag_array.indexOf(parseInt(id)), 1);
	};
	var remove_img = function (img) {
		img_array.splice(img_array.indexOf(img), 1);
	};

	//ajax get all datatable items
	_send_info.data = {
		"limit": _per_page,
		"offset": _per_page * (_current_page - 1),
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/splayGame",
			"type": "GET",
			"data": function (d) {
				if (search_value != null && search_value != "") {
					d.searchValue = search_value;
				}
				d.limit = _per_page;
				d.offset = _per_page * (_current_page - 1);
			},
			"contentType": "application/json",
			"dataType": "json",
			"dataSrc": function (json) {
				var i = 0;
				$(".datatable_paging").html("");
				if (json.totalRecords > _per_page) {
					for (i = 1; i <= Math.ceil(json.totalRecords / _per_page); i++) {
						if (i == _current_page) {
							$(".datatable_paging").append("<span class='datatable_paging_number_active' page=" + i + ">" + i + "</span>");
						} else {
							if (i == 1 || i == Math.ceil(json.totalRecords / _per_page) || i == (_current_page - 1) || i == (_current_page - 2) || i == (_current_page + 2) || i == (_current_page + 1)) {
								if (i == 1 && _current_page > 4) {
									$(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
									$($(".datatable_paging_number")[0]).after("<span class='paging_truncate'>...</span>");
								} else if (i == Math.ceil(json.totalRecords / _per_page) && _current_page < (Math.ceil(json.totalRecords / _per_page) - 3)) {
									$(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
									$($(".datatable_paging_number")[$(".datatable_paging_number").length - 1]).before("<span class='paging_truncate'>...</span>");
								} else {
									$(".datatable_paging").append("<span class='datatable_paging_number' page=" + i + ">" + i + "</span>");
								}
							}
						}
					}
				} else {
					$(".datatable_paging").html("<span class='datatable_paging_number_active' page=" + 1 + ">" + 1 + "</span>");
				}
				$(".datatable_paging_number").click(function (e) {
					_current_page = parseInt($(e.target).attr("page"));
					page_datatable.ajax.reload();
				});
				if (json.data != null) {
					return json.data;
				} else {
					return [];
				}
			},
			"beforeSend": function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			"error": function (xhr, error, thrown) {
				if (JSON.parse(xhr.responseText).error == "invalid_token") {
					localStorage.removeItem("user_data");
					document.location.replace("login");
				}
			},
		},
		responsive: true,
		"columns": [
			{ title: "ID", data: "id" },
			{ title: "Name", data: "name" },
			{
				title: "Status",
				data: null,
				render: function (data, type, full, meta) {
					if (full.status == "active") {
						data = "<div class='active_status'>" + full.status + "</div>";
					} else {
						data = "<div class='inactive_status'>" + full.status + "</div>";
					}
					return data;
				}
			},
			{
				title: "Create On",
				data: null,
				render: function (data, type, full, meta) {
					var str_date = moment(full.createOn).format("YYYY-MMMM-D HH:mm");
					return str_date;
				}
			},
			{
				title: "Update On",
				data: null,
				render: function (data, type, full, meta) {
					var str_date = moment(full.updateOn).format("YYYY-MMMM-D HH:mm");
					return str_date;
				}
			},
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					var return_str = "";
					return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					return_str += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return return_str;
				}
			}
		],
		"aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "2%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [1] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [2] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [3] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [4] },
			{ responsivePriority: 1, "sWidth": "10%", 'aTargets': [5] },
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {
			$("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function () {
				return this.nodeType != 1;
			}).replaceWith("");

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				// console.log(obj_temp);
				editing_item = obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
				$('#modal_add_edit .logo_img').css("background-image","url(" + obj_temp.defaultImage + ")");
				$('#modal_add_edit .txt_add_edit_item_link_logo').html(obj_temp.defaultImage);
				$('#modal_add_edit .cover_img').css("background-image","url(" + obj_temp.bigImage + ")");
				$('#modal_add_edit .txt_add_edit_item_link_cover').html(obj_temp.bigImage);
				$('#modal_add_edit .txt_add_edit_item_screenshot').val(obj_temp.screenShot);
				$('#modal_add_edit .txt_add_edit_item_channel_id').val(obj_temp.youtubeChannelId);
				$('#modal_add_edit .txt_add_edit_item_search_key').val(obj_temp.youtubeDefaultSearch);
				$('#modal_add_edit .txt_add_edit_item_download').val(obj_temp.downloadTurns);
				$('#modal_add_edit .txt_add_edit_item_fb').val(obj_temp.fanpageFB);
				$('#modal_add_edit .txt_add_edit_item_group_fb').val(obj_temp.groupFB);
				$('#modal_add_edit #single_select_game_type').val(obj_temp.gameType);
				$('.txt_add_edit_item_webgame_url').val(obj_temp.webgameUrl);
				$('#modal_add_edit #single_select_sub_title').val(obj_temp.subTitle);
				$('#modal_add_edit .txt_add_edit_item_android').val(obj_temp.urlDownloadAndroid);
				$('#modal_add_edit .txt_add_edit_item_ios').val(obj_temp.urlDownloadIos);
				$('#modal_add_edit .txt_add_edit_item_pc').val(obj_temp.urlDownloadPC);
				$('#modal_add_edit .txt_add_edit_item_scoin_id').val(obj_temp.scoinGameId);
				$('#modal_add_edit .txt_add_edit_item_des').val(obj_temp.description);
				$('.image_item').html("");
				if ($('#modal_add_edit #single_select_game_type').val() == "WEBGAME") {
					$('.group-webgame-url').show();
				} else {
					$('.group-webgame-url').hide();
				}

				if (CKEDITOR.instances.des !== undefined) {
					CKEDITOR.instances.des.destroy();
				}
				CKEDITOR.replace('des', {
					height: '300px',
				});
				CKEDITOR.instances.des.setData(obj_temp.description);
				$(".current_tags").html("");
				tag_array = [];
				$.each(obj_temp.tagsList, function (key, item) {
					$(".current_tags").append(" <span class='tag label label-info' tag_id=" + item.id + "><i class='fa fa-tags'></i> " + item.name + "<span  class='remove_tag' data-role='remove'></span></span>");
					tag_array.push(item.id);
				});
				$(".image_item").html("");
				img_array = [];
				if (obj_temp.screenShot !== null) {
					$.each(obj_temp.screenShot.split(","), function (key, item) {
						if (item !== "") {
							$(".image_item").append(" <img class='remove_image' src='" + item + "' />");
							img_array.push(item);
						}
					});
				}
				// console.log(tag_array);
				$(".remove_image").click(function () {
					remove_img($(this).attr("src"));
					console.log("img_array", img_array )
					flagNewImage = true;
					deleteImageGame($(this).attr("src"))
					$(this).remove();
				});
				$(".current_tags .remove_tag").click(function () {
					remove_tag($(this).parent().attr("tag_id"));
					$(this).parent().remove();
				});
				$('#modal_add_edit .txt_add_edit_item_publisher').val(obj_temp.publisher);
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				$(".select_status option").filter(function () {
					return $.trim($(this).val()) == obj_temp.status;
				}).prop('selected', true);
				$('.select_status').selectpicker('refresh');
				if (obj_temp.status == 'active') {
					$('.select_status button').css('background-color', '#32c5d2');
				} else {
					$('.select_status button').css('background-color', 'red');
				}
				load_autocomplete_component();
				$('.btn_delete_item').show();
				$('.btn_delete_item').attr("item_id", obj_temp.id);
				$('#modal_add_edit').modal('show');
			});
			$('.btn_delete_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				deleted_obj = obj_temp;
				deleted_id = obj_temp.id;
				$("#modal_confirm").modal("show");
			});
		},
	});

	$('#modal_add_edit #single_select_game_type').change(function () {
		if ($(this).val() == "WEBGAME") {
			$('.group-webgame-url').show();
		} else {
			$('.group-webgame-url').hide();
		}
	})

	$(".txt_add_edit_item_file_logo").change(function(){
		var image = this.files[0];
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
			imageLogo = this.files[0];
			$('#modal_add_edit .txt_add_edit_item_image_logo').css("background-image","url(" + URL.createObjectURL(imageLogo) + ")");
			flagNewImage = true;
			$(".txt_add_edit_item_file_logo").val('');
		} else {
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
			imageLogo = null;
		}
	});

	$(".btn_modal_upload_image_logo").click(function (){
		uploadImageGame(imageLogo,"logo");
		if (linkImage == null){
			show_toast_notif("error", "Lỗi Tải Ảnh", "Chưa chọn ảnh", function () { });
		} else {
			$('#modal_add_edit .txt_add_edit_item_link_logo').html(linkImage);
			linkImage = null;
		}
	});

	$(".txt_add_edit_item_file_cover").change(function(){
		var image = this.files[0];
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
			imageCover = this.files[0];
			$('#modal_add_edit .txt_add_edit_item_image_cover').css("background-image","url(" + URL.createObjectURL(imageCover) + ")");
			flagNewImage = true;
			$(".btn_modal_upload_image_cover").val('');
		} else {
			imageCover = null;
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
		}
	});

	$(".btn_modal_upload_image_cover").click(function (){
		uploadImageGame(imageCover,"cover");
		if (linkImage == null){
			show_toast_notif("error", "Lỗi Tải Ảnh", "Chưa chọn ảnh", function () { });
		} else {
			$('#modal_add_edit .txt_add_edit_item_link_cover').html(linkImage);
			linkImage = null;
		}
	});

	$(".btn_modal_upload_image_screenshot").click(function (){
		flagNewImage = true;
		uploadImageGame($(".txt_add_edit_item_image_screenshot")[0].files[0],"");
		img_array.push(linkImage)
		$('#modal_add_edit .image_item').append("<img class='remove_image' src='" + linkImage + "' />");
		$(".remove_image").click(function () {
			remove_img($(this).attr("src"));
			console.log("img_array", img_array)
			flagNewImage = true;
			deleteImageGame($(this).attr("src"))
			$(this).remove();
		});
	});
	

	$(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function () {
		if ($(this).parents("[class*='has-']").length) {
			var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);

			for (var i = 0; i < classNames.length; ++i) {
				if (classNames[i].match("has-")) {
					$("body > .select2-container").addClass(classNames[i]);
				}
			}
		}
	});

	load_autocomplete_component = function () {
		$.fn.select2.defaults.set("theme", "bootstrap");
		var placeholder = "Type to search";
		$(".select2, .select2-multiple").select2({
			placeholder: placeholder,
			width: null
		});

		$(".select2-allow-clear").select2({
			allowClear: true,
			placeholder: placeholder,
			width: null
		});

		function formatRepo(repo) {
			if (repo.loading) return repo.text;

			var markup = "<div class='select2-result-repository clearfix'>" +
				"<div class='select2-result-repository__avatar'><img src='" + repo.owner.avatar_url + "' /></div>" +
				"<div class='select2-result-repository__meta'>" +
				"<div class='select2-result-repository__title'>" + repo.full_name + "</div>";

			if (repo.description) {
				markup += "<div class='select2-result-repository__description'>" + repo.description + "</div>";
			}

			markup += "<div class='select2-result-repository__statistics'>" +
				"<div class='select2-result-repository__forks'><span class='glyphicon glyphicon-flash'></span> " + repo.forks_count + " Forks</div>" +
				"<div class='select2-result-repository__stargazers'><span class='glyphicon glyphicon-star'></span> " + repo.stargazers_count + " Stars</div>" +
				"<div class='select2-result-repository__watchers'><span class='glyphicon glyphicon-eye-open'></span> " + repo.watchers_count + " Watchers</div>" +
				"</div>" +
				"</div></div>";
			return markup;
		}

		function formatRepoSelection(repo) {
			return repo.full_name || repo.text;
		}

		$(".js-data-example-ajax").select2({
			width: "off",
			ajax: {
				url: "https://api.github.com/search/repositories",
				dataType: 'json',
				delay: 250,
				data: function (params) {
					return {
						q: params.term,
						page: params.page
					};
				},
				processResults: function (data, page) {
					return {
						results: data.items
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) {
				return markup;
			},
			minimumInputLength: 1,
			templateResult: formatRepo,
			templateSelection: formatRepoSelection
		});

		$("button[data-select2-open]").click(function () {
			$("#" + $(this).data("select2-open")).select2("open");
		});

		$(":checkbox").on("click", function () {
			$(this).parent().nextAll("select").prop("disabled", !this.checked);
			if ($(this).val() == 1 && $(this).parent().hasClass("checked")) {
				$(".appname_group").show();
				$(".txt_add_edit_item_package_android").attr("name", "androidPackage");
				$(".txt_add_edit_item_package_ios").attr("name", "iosSchemes");
			} else if ($(this).val() == 1 && !$(this).parent().hasClass("checked")) {
				$(".appname_group").hide();
				$(".txt_add_edit_item_package_android").attr("name", "");
				$(".txt_add_edit_item_package_ios").attr("name", "");
			}
			if ($(this).val() == 3 && $(this).parent().hasClass("checked")) {
				$(".share_group").show();
				$(".txt_add_edit_item_share").attr("name", "urlShareFB");
			} else if ($(this).val() == 3 && !$(this).parent().hasClass("checked")) {
				$(".share_group").hide();
				$(".txt_add_edit_item_share").attr("name", "");
			}
		});

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});

		$("#single_select_game_tag").change(function () {
			if ($.inArray(parseInt($("#single_select_game_tag").val()), tag_array) == -1) {
				tag_array.push(parseInt($("#single_select_game_tag").val()));
				$(".current_tags").append(" <span tag_id='" + $("#single_select_game_tag").val() + "' class='tag label label-info'><i class='fa fa-tags'></i> " + $("#single_select_game_tag option:selected").text() + "<span class='remove_tag' data-role='remove'></span></span>");
				$(".current_tags .remove_tag").click(function () {
					remove_tag($(this).parent().attr("tag_id"));
					$(this).parent().remove();
				});
			}
		});
	};

	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});

	//event for modal
	$(".btn_add_new_item").click(function () {
		$(".image_item").html("");
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$(".logo_img").css("background-image","");
		$(".cover_img").css("background-image","");
		$(".view_link").text("");
		linkImage = null;
		$('#modal_add_edit input:text').val("");
		$('#modal_add_edit textarea').val("");
		$(".select_status option").filter(function () {
			return $.trim($(this).val()) == "active";
		}).prop('selected', true);
		if (CKEDITOR.instances.des !== undefined) {
			CKEDITOR.instances.des.destroy(true);
		}
		CKEDITOR.replace('des');
		$('.select_status').selectpicker('refresh');
		$('.select_status button').css('background-color', '#32c5d2');
		load_autocomplete_component();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});
	$('.btn_update_position').click(function () {
		$(".loading_icon").show();
		_send_info.data = {
			"limit": 100000,
			"offset": 0
		};
		$.ajax({
			url: base_request_url + "/admin/splayGame",
			type: "GET",
			data: _send_info.data,
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$("#items").html("");
				$(data.data).each(function (key, item) {
					$("#items").append("<li item_id=" + item.id + " class='list channel_position'>" + item.name + "</li>");
				});
				$("#items").sortable({
					placeholder: "highlight",
					start: function (event, ui) {
						ui.item.toggleClass("highlight");
					},
					stop: function (event, ui) {
						ui.item.toggleClass("highlight");
					}
				});
				$("#items").disableSelection();
				$('#modal_update_position').modal('show');
				$(".loading_icon").hide();
			},
			error: function (err) {
				console.log(err.error());
				$(".loading_icon").hide();
			}
		});
	});
	$('.btn_confirm_yes').click(function () {
		$.ajax({
			url: base_request_url + "/admin/splayGame?splayGameId=" + deleted_id,
			type: "DELETE",
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_confirm').modal('hide');
				_send_info.data = {};
				page_datatable.ajax.reload();
				$('#modal_add_edit').modal('hide');
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function () {
				});
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
				});
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required");
			return;
		}

		if ($("#single_select_game_type").val() == "WEBGAME"
				&& $('.txt_add_edit_item_webgame_url').val() == "") {
			show_toast_notif("error", "Unable to create " + item_name, item_name + " Chưa điềm URL webgame");
			return;
		}
		
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"defaultImage": $(".txt_add_edit_item_link_logo").text(),
			"bigImage": $(".txt_add_edit_item_link_cover").text(),
			"fanpageFB": $(".txt_add_edit_item_fb").val(),
			"groupFB": $(".txt_add_edit_item_group_fb").val(),
			"urlDownloadIos": $(".txt_add_edit_item_ios").val(),
			"urlDownloadAndroid": $(".txt_add_edit_item_android").val(),
			"urlDownloadPC": $(".txt_add_edit_item_pc").val(),
			"youtubeChannelId": $(".txt_add_edit_item_channel_id").val(),
			"youtubeDefaultSearch": $(".txt_add_edit_item_search_key").val(),
			"downloadTurns": $(".txt_add_edit_item_download").val(),
			"gameType": $("#single_select_game_type").val(),
			"webgameUrl" : $('.txt_add_edit_item_webgame_url').val(),
			"subTitle": $("#single_select_sub_title").val(),
			"scoinGameId": $(".txt_add_edit_item_scoin_id").val(),
			"publisher": $("#single_select_publisher").val(),
			"description": CKEDITOR.instances.des.getData().toString().replace(/\&quot;/g,''),
			"screenShot": img_array.toString(),
			"tagList": tag_array,
			"status": $(".select_status option:selected").val()
		};
		console.log("img_array.toString() : ", img_array.toString());
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/splayGame",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () {
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
				});
				$(".loading_icon").hide();
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " name is required");
			return;
		}

		if ($("#single_select_game_type").val() == "WEBGAME"
				&& $('.txt_add_edit_item_webgame_url').val() == "" ) {
			show_toast_notif("error", "Unable to create " + item_name, item_name + " Chưa điềm URL webgame");
			return;
		}
		_send_info.data = {
			"id": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"defaultImage": $(".txt_add_edit_item_link_logo").text(),
			"bigImage": $(".txt_add_edit_item_link_cover").text(),
			"groupFB": $(".txt_add_edit_item_group_fb").val(),
			"fanpageFB": $(".txt_add_edit_item_fb").val(),
			"urlDownloadIos": $(".txt_add_edit_item_ios").val(),
			"youtubeChannelId": $(".txt_add_edit_item_channel_id").val(),
			"youtubeDefaultSearch": $(".txt_add_edit_item_search_key").val(),
			"urlDownloadAndroid": $(".txt_add_edit_item_android").val(),
			"urlDownloadPC": $(".txt_add_edit_item_pc").val(),
			"downloadTurns": $(".txt_add_edit_item_download").val(),
			"gameType": $("#single_select_game_type").val(),
			"webgameUrl" : $('.txt_add_edit_item_webgame_url').val(),
			"subTitle": $("#single_select_sub_title").val(),
			"scoinGameId": $(".txt_add_edit_item_scoin_id").val(),
			"publisher": $("#single_select_publisher").val(),
			"screenShot": img_array.toString(),
			"tagList": tag_array,
			"description": CKEDITOR.instances.des.getData().toString().replace(/\&quot;/g,''),
			"status": $(".select_status option:selected").val()
		};
		// console.log("description.toString() : ", _send_info.data.description);
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/splayGame",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () {
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () {
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
				});
				$(".loading_icon").hide();
			},
		});
	});
	$('.select_status').change(function () {
		if ($(this).val() != "") {
			if ($(this).val() == 'active') {
				$('.select_status button').css('background-color', '#32c5d2');
			} else if ($(this).val() == 'inactive') {
				$('.select_status button').css('background-color', 'red');
			}
			$(".hidden_item_status").val($(this).val());
		}
	});
	$('.btn_modal_save_position').click(function () {
		$(".loading_icon").show();
		var updated_position = [];
		var position = 1;
		$('.channel_position').each(function (key, item) {
			updated_position.push({ "id": $(item).attr("item_id"), "position": position });
			position++;
		});
		$.ajax({
			url: base_request_url + "/admin/splayGamePosition",
			type: "PUT",
			data: JSON.stringify({ "dataRequest": updated_position }),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				_send_info.data = {};
				page_datatable.ajax.reload(null, false);
				if (data.status == "01") {
					show_toast_notif("success", "Successfully", "Positions are updated", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Error", "'" + data.onlyMessage + "'", function () {
						//action when click on notif
					});
				}
				$('#modal_update_position').modal('hide');
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
					//action when click on notif
				});
				$(".loading_icon").hide();
			},
		});
	});
	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		$('.search_input').val("");
		search_value = "";
		page_datatable.ajax.reload(null, false);
	});
	$(".form_datetime").datetimepicker({
		autoclose: true,
		isRTL: App.isRTL(),
		format: "yyyy-MM-dd HH:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});

	$('.btn_modal_upload').click(function () {
		$(".loading_icon").show();
		var formData = new FormData($('#form_upload')[0]);
		$.ajax({
			url: base_request_url + "/admin/uploadFile",
			type: "POST",
			data: formData,
			cache: false,
			contentType: false,
			timeout: 3000000,
			processData: false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Uploaded ");
					img_array.push(data.dataObj);
					$('#modal_add_edit .image_item').append("<img src='" + data.dataObj + "' />");
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage);
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
				$(".loading_icon").hide();
			}
		});
	});
};

function uploadImageGoogleDriver(image, typeImage){
    if(flagNewImage 
        && image != null
        && image != undefined) {
		var formData = new FormData();
		formData.append('file', image);
		
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/uploadFile",
			type: "POST",
			data: formData,
			cache: false,
			async: false,
			contentType: false,
			timeout: 3000000,
			processData: false,
			
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
                    $(".loading_icon").hide();
					// console.log(data);
					show_toast_notif("success", "Successfully", "Upload image success");
					linkImage = data.dataObj;
				} else {
                    $(".loading_icon").hide();
                    show_toast_notif("error", "Fail", "Upload Image Unsuccess");
				}
			},
			error: function (error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.message + "'");
			},
		});
    } else {
        $(".loading_icon").hide();
        return null;
    }
    
}

function uploadImageGame(image, typeImage){
	if(flagNewImage 
        && image != null
        && image != undefined) {
		var formData = new FormData();
		formData.append('image', image);

		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/uploadImage",
			type: "POST",
			data: formData,
			cache: false,
			async: false,
			contentType: false,
			timeout: 3000000,
			processData: false,
			
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				if (data.status == '01') {
					linkImage = data.data;
					if(typeImage == "logo" && $('#modal_add_edit .txt_add_edit_item_link_logo').html() !== "") {
						deleteImageGame($('#modal_add_edit .txt_add_edit_item_link_logo').html());
					}

					if (typeImage == "cover" && $('#modal_add_edit .txt_add_edit_item_link_cover').html() !== ""){
							deleteImageGame($('#modal_add_edit .txt_add_edit_item_link_cover').html());
					}
					
					$(".loading_icon").hide();
					show_toast_notif("success", "Successfully", "Add new image success");
					
				} else {
					$(".loading_icon").hide();
					show_toast_notif("error", "Fail", "Upload Image Unsuccess");
				}
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.message + "'");
				$(".loading_icon").hide();
			},
		});
	} 
}

function deleteImageGame(urlImage){
	if(flagNewImage) {

		_send_info.data = {
			"urlImage" : urlImage
		}

		$.ajax({
			url: base_request_url + "/admin/deleteImage",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			cache: false,
			async: false,
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					flagNewImage = false;
					$(".loading_icon").hide();
					show_toast_notif("success", "Successfully", "Add new and Delete old image success");
				} else {
					show_toast_notif("error", "Fail", "Delete Image Unsuccess");
					$(".loading_icon").hide();
				}
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.message + "'");
				$(".loading_icon").hide();
			},
		});
	} 
}

function objectifyForm(formArray) {
	//serialize data function
	var returnArray = {};
	for (var i = 0; i < formArray.length; i++) {
		returnArray[formArray[i]['name']] = formArray[i]['value'];
	}
	return returnArray;
}

jQuery(document).ready(function () {
	Page_script.init();
	load_page();

});