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
var imageCarosel = null;
var linkImage = null;
var flagNewImage = false;

var Page_script = function () {
	return {
		//main function
		init: function () { },
	};
}();

function str_pad(n) {
	return String("00" + n).slice(-2);
}

var load_page = function () {
	CKEDITOR.replace('content');

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

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
			"url": base_request_url + "/admin/carousel",
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
		"columns": [
			{ title: "ID", data: "id" },
			{ title: "Name", data: "name" },
			{
				title: "Image",
				data: null,
				render: function (data, type, full, meta) {
					var data = null;
					if (full.typeCarousel == "TEXT") {
						data = full.name;
					} else {
						data = "<div class='carousel_img' style='background-image:url(" + full.urlImage +")'></div>";

					}
					return data;
				}
			},
			{
				title: "Link Image & Content",
				data: null,
				render: function (data, type, full, meta) {
					var data = null;
					if (full.typeCarousel == "TEXT") {
						data = full.content;
					} else {
						data = "<div title='" + full.content + "' class='link_image'>" + full.urlImage + "</div>";
					}
								
					return data + " <button class='btn blue copy_link_image'>Copy Link</button>";
				}
			},
			{ title: "Type Carousel", data: "typeCarousel" },
			{ title: "Position", data: "position" },
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
			{ "sWidth": "2%", 'aTargets': [0] },
			{ "sWidth": "10%", 'aTargets': [1] },
			{ "sWidth": "15%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "10%", 'aTargets': [4] },
			{ "sWidth": "5%", 'aTargets': [5] },
			{ "sWidth": "5%", 'aTargets': [6] },
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

			$(".copy_link_image").click(function(){
				var $temp = $("<input>");
				$("body").append($temp);
				console.log($(this).prev().text());
				$temp.val($(this).prev().text()).select();
				document.execCommand("copy");
				$temp.remove();

			});

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				$('#add_carousel_form').trigger("reset");
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				console.log(obj_temp);
				editing_item = obj_temp.id;

				$("#single_select_carousel_type").val(obj_temp.typeCarousel);
				if($("#single_select_carousel_type").val() == "IMAGE") {
					$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
					$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
					$('#modal_add_edit .txt_add_edit_item_image').css("background-image","url('" + obj_temp.urlImage + "')");
					$('#modal_add_edit .txt_add_edit_item_thumb').html(obj_temp.content);
					$('#modal_add_edit .txt_add_edit_item_url').val(obj_temp.urlView);
					$('#modal_add_edit .txt_add_edit_item_position').val(obj_temp.position);
					$('#modal_add_edit .btn_modal_save_new').hide();
					$('#modal_add_edit .btn_modal_save_update').show();
					$("#carousel_image").show();
					$("#carousel_text_highlights").hide();
				} else if($("#single_select_carousel_type").val() == "TEXT") {
					$(".txt_add_edit_item_content").val(obj_temp.content);
					$("#carousel_image").hide();
					$("#carousel_text_highlights").show();
					if (CKEDITOR.instances.content !== undefined) {
						CKEDITOR.instances.content.destroy();
					}
					CKEDITOR.replace('content');
					CKEDITOR.instances.content.setData(obj_temp.content);
				}

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

	$(".txt_add_edit_item_file").change(function(){
		var image = this.files[0];
		console.log(image.type);
		if(image =! null 
			&& (image.type == "image/jpeg" 
				|| image.type == "image/png"
				|| image.type == "image/jpg"
				|| image.type == "image/gif")){
				$('#modal_add_edit .txt_add_edit_item_image').css("background-image","url(" + URL.createObjectURL(this.files[0]) + ")");
				imageCarosel = this.files[0];
				flagNewImage = true;
		} else {
			show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
		}
		
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
		if ($(this).attr("id") == "single_select_publisher") {
			//event for search field
			typing_input = $('.select2-search__field')[0];
			$(typing_input).on("keypress", function () {
				console.log("press");
				clearTimeout(typingTimer);
				typingTimer = setTimeout(function () {
					//ajax get all tags
					_send_info.data = {
						"limit": 10,
						"offset": 0,
						"searchValue": $(typing_input).val(),
						"roleName": "publisher"
					};
					searching_value_timeout = $(typing_input).val();
					$("#single_select_publisher").html("");
					$.ajax({
						url: base_request_url + "/admin/user",
						type: "GET",
						data: _send_info.data,
						contentType: "application/json",
						dataType: "json",
						beforeSend: function (xhr) {
							xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
						},
						success: function (data) {
							console.log(data);
							var tags_arr = [];
							$(data.dataArr).each(function (key, item) {
								var publisher = "";
								if (item.username == null) {
									publisher = item.fullName;
								} else {
									publisher = item.username;
								}
								$("#single_select_publisher").append("<option value='" + item.id + "'> " + publisher + "</option>");
							});
							load_autocomplete_component();
							$("#single_select_publisher").select2("open");
							$($('.select2-search__field')[0]).val(searching_value_timeout);
						},
						error: function (err) {
							console.log("error");
							console.log(err.error());
						}
					});
				}, doneTypingInterval);
			});
		}
	});

	load_autocomplete_component = function () {
		// Set the "bootstrap" theme as the default theme for all Select2
		// widgets.
		//
		// @see https://github.com/select2/select2/issues/2927
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

		// @see https://select2.github.io/examples.html#data-ajax
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
						q: params.term, // search term
						page: params.page
					};
				},
				processResults: function (data, page) {
					// parse the results into the format expected by Select2.
					// since we are using custom formatting functions we do not need to
					// alter the remote JSON data
					return {
						results: data.items
					};
				},
				cache: true
			},
			escapeMarkup: function (markup) {
				return markup;
			}, // let our custom formatter work
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

		// copy Bootstrap validation states to Select2 dropdown
		//
		// add .has-waring, .has-error, .has-succes to the Select2 dropdown
		// (was #select2-drop in Select2 v3.x, in Select2 v4 can be selected via
		// body > .select2-container) if _any_ of the opened Select2's parents
		// has one of these forementioned classes (YUCK! ;-))

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
	};
	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#add_carousel_form').trigger("reset");
		$(".view_link").hide();
		$('.txt_add_edit_item_image').css("background-image","none");
		$('#modal_add_edit textarea').val("");
		$(".select_status option").filter(function () {
			return $.trim($(this).val()) == "active";
		}).prop('selected', true);
		$('.select_status').selectpicker('refresh');
		$('.select_status button').css('background-color', '#32c5d2');
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});
	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});

	//event for modal
	$('.btn_confirm_yes').click(function () {
		$.ajax({
			url: base_request_url + "/admin/carousel?id=" + deleted_id,
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
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function () { });
			},
			error: function (error) {
				show_toast_notif("error", "C", "'" + error.responseText + "'", function () { });
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		
		if ($("#single_select_carousel_type").val() == "IMAGE"){
			
			if ($(".txt_add_edit_item_name").val() == "") {
				show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required");
				return;
			}

			if ($(".txt_add_edit_item_url").val() == "") {
				show_toast_notif("error", "Chưa nhập direct url kìa đại ca");
				return;
			}

			if(!flagNewImage){
				show_toast_notif("error", "Chưa chọn ảnh kìa đại ca");
				return;
			}

			linkImage = null;
			$(".loading_icon").show();
			uploadImageCarousel();
			if(linkImage == null){
				show_toast_notif("error", "Có lỗi khi upload ảnh");
				return;
			}
			_send_info.data = null;
			_send_info.data = {
				"typeCarousel" : $("#single_select_carousel_type").val(),
				"name": $(".txt_add_edit_item_name").val(),
				"urlImage": linkImage,
				"content": linkImage,
				"urlView": $(".txt_add_edit_item_url").val(),
				"position": $(".txt_add_edit_item_position").val(),
				"status": $(".select_status option:selected").val()
			};
		} else if ($("#single_select_carousel_type").val() == "TEXT"){
			if (CKEDITOR.instances.content.getData() == "") {
				show_toast_notif("error", "Chưa nhập content kìa đại ca");
				return;
			}
			$(".loading_icon").show();
			_send_info.data = null;
			_send_info.data = {
				"typeCarousel" : $("#single_select_carousel_type").val(),
				"name": NAME_TEXT_HIGHLIGHTS,
				"content": CKEDITOR.instances.content.getData(),
				"position": $(".txt_add_edit_item_position").val(),
				"status": $(".select_status option:selected").val()
			};
			console.log("content", CKEDITOR.instances.content.getData());
		}

		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/carousel",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == "01") {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () { });
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		if ($("#single_select_carousel_type").val() == "IMAGE"){
			if ($(".txt_add_edit_item_name").val() == "") {
				show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required");
				return;
			}

			if ($(".txt_add_edit_item_url").val() == "") {
				show_toast_notif("error", "Chưa nhập direct url kìa đại ca");
				return;
			}
			
			linkImage = null;
			uploadImageCarousel();
			if (linkImage == null){
				linkImage = $(".txt_add_edit_item_thumb").html();
			}
			
			_send_info.data = {

				"id": editing_item,
				"name": $(".txt_add_edit_item_name").val(),
				"urlImage": linkImage,
				"content": linkImage,
				"urlView": $(".txt_add_edit_item_url").val(),
				"typeCarousel" : $("#single_select_carousel_type").val(),
				"position": $(".txt_add_edit_item_position").val(),
				"status": $(".select_status option:selected").val()
			};
		} else if ($("#single_select_carousel_type").val() == "TEXT"){
			if (CKEDITOR.instances.content.getData() == "") {
				show_toast_notif("error", "Chưa nhập content kìa đại ca");
				return;
			}
			$(".loading_icon").show();
			_send_info.data = null;
			_send_info.data = {
				"id": editing_item,
				"typeCarousel" : $("#single_select_carousel_type").val(),
				"name": NAME_TEXT_HIGHLIGHTS,
				"content": CKEDITOR.instances.content.getData(),
				"position": $(".txt_add_edit_item_position").val(),
				"status": $(".select_status option:selected").val()
			};
			console.log("content", CKEDITOR.instances.content.getData());
		}
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/carousel",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == "01") {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () { });
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
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
};

function objectifyForm(formArray) {
	//serialize data function
	var returnArray = {};
	for (var i = 0; i < formArray.length; i++) {
		returnArray[formArray[i]['name']] = formArray[i]['value'];
	}
	return returnArray;
}

function uploadImageCarousel(){
	if(flagNewImage) {
		
		var formData = new FormData();
		formData.append('image', imageCarosel);
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
				// page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					console.log(data);
					// show_toast_notif("success", "Successfully", "Upload image success");
					linkImage = data.data;
					deleteImageCarousel();
				} else {
					show_toast_notif("error", "Fail", "Upload Image Unsuccess");
				}
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.message + "'");
			},
		});
	} 
}

function deleteImageCarousel(){
	if(flagNewImage) {

		_send_info.data = {
			"urlImage" : $(".txt_add_edit_item_thumb").html()
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
					console.log(data);
					show_toast_notif("success", "Successfully", "Add new and Delete old image success");
				} else {
					show_toast_notif("error", "Fail", "Upload Image Unsuccess");
				}
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.message + "'");
			},
		});
	} 
}

$("#single_select_carousel_type").change(function(){
	if($(this).val() == "IMAGE") {
		$("#carousel_image").show();
		$("#carousel_text_highlights").hide();
	} else if($(this).val() == "TEXT") {
		$("#carousel_image").hide();
		$("#carousel_text_highlights").show();
		if (CKEDITOR.instances.content !== undefined) {
			CKEDITOR.instances.content.destroy();
		}
		CKEDITOR.replace('content');
		
	}
});

$("#txt_add_edit_image_text").change(function(){
	linkImage = null;
	flagNewImage = false;
	imageCarosel = null;
	$(".form_link_image_text").hide();
	var image = this.files[0];
	if(image =! null 
		&& (image.type == "image/jpeg" 
			|| image.type == "image/png"
			|| image.type == "image/jpg"
			|| image.type == "image/gif")){
			$('#review_image_text').attr("src",URL.createObjectURL(this.files[0]));
			imageCarosel = this.files[0];
			flagNewImage = true;
	} else {
		show_toast_notif("error", "Error", "Không Đúng Định Dạng Ảnh", function () { });
	}
});

$("#upload_image_text").click(function(){
	$(".loading_icon").show();
	uploadImageCarousel();
	$(".loading_icon").hide();
	if (linkImage == null){
		show_toast_notif("error", "Error", "Upload ảnh xảy ra lỗi", function () { });
		return;
	}
	$(".form_link_image_text").show();
	$("#link_image_text").html(linkImage);
});

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$("#carousel_image").show();
	$("#carousel_text_highlights").hide();
	$(".form_link_image_text").hide();
});