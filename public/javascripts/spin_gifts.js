//page variable
var editing_item = null;
var item_name = "Spin Item";
var item_names = "Spin Items";
var deleted_id = null;
var channel_arr = [];
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var linkImage = null;
var flagNewImage = false;
var imageCarosel = null;
_current_page = 1;

var Page_script = function () {
	return {
		//main function
		init: function () {},
	};
}();

function str_pad(n) {
	return String("00" + n).slice(-2);
}

var load_page = function () {
	// CKEDITOR.replace('des', {
	// 	height: '300px',
	// });

	//ajax get all datatable items
	_send_info.data = {
		"limit": _per_page,
		"offset": _per_page * (_current_page - 1),
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	var remove_channel = function (id) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
	};

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/luckySpin-gift",
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
		"columns": [{
				title: "ID",
				data: "id"
			},
			{
				title: "Name",
				data: "name"
			},
			// {
			// 	title: "Status",
			// 	data: null,
			// 	render: function (data, type, full, meta) {
			// 		if (full.status == "active") {
			// 			data = "<div class='active_status'>" + full.status + "</div>";
			// 		} else {
			// 			data = "<div class='inactive_status'>" + full.status + "</div>";
			// 		}
			// 		return data;
			// 	}
			// },
			{
				title: "Type",
				data: "typeGift"
			},
			{
				title: "Point",
				data: "setPoint"
			},
			{
				title: "Value",
				data: "value"
			},
			{
				title: "Quantity",
				data: null,
				render: function (data, type, full, meta) {
					var string = full.quantity;
					if (full.quantity < 0) {
						string = "Unlimited";
					}
					return string;
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
		"aoColumnDefs": [{
				"sWidth": "2%",
				'aTargets': [0]
			},
			{
				"sWidth": "20%",
				'aTargets': [1]
			},
			{
				"sWidth": "5%",
				'aTargets': [2]
			},
			{
				"sWidth": "5%",
				'aTargets': [3]
			},
			{
				"sWidth": "5%",
				'aTargets': [4]
			},
			{
				"sWidth": "5%",
				'aTargets': [5]
			},
			{
				"sWidth": "15%",
				'aTargets': [6]
			},
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
			$(".btn_edit_item").on("click", function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				console.log(obj_temp);
				editing_item = obj_temp.id;
				$('#modal_add_edit input:file').val("");
				// $('#review_image_text').hide();
				$('#link_image_text').html("");
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_wheel_title').val(obj_temp.wheelTitle);
				$('#modal_add_edit .txt_add_edit_item_winning_title').val(obj_temp.winningTitle);
				$('#modal_add_edit .txt_add_edit_item_value').val(obj_temp.value);
				$('#review_image_text').attr("src",obj_temp.urlImage);
				$("#link_image_text").html(obj_temp.urlImage);
				$('#modal_add_edit .txt_add_edit_item_description').val(obj_temp.description);
				$('#modal_add_edit .hidden_item_is_default').val(obj_temp.isDefault);
				$('#modal_add_edit .hidden_item_type').val(obj_temp.type);
				// $(".select_type option").attr("disabled", "true");
				$('#modal_add_edit .txt_add_edit_item_quantity').val(obj_temp.quantity);
				// if (obj_temp.type == "REALITY") {
				// 	$('.file_add_edit_item_giftcode').parent().parent().hide();
				// 	$('.file_add_edit_item_giftcode').attr("name", "");
				// 	$('.txt_add_edit_item_quantity').parent().parent().show();
				// 	$('.txt_add_edit_item_quantity').attr("name", "quantity");
				// 	$('.txt_add_edit_item_value').parent().parent().show();
				// 	$('.txt_add_edit_item_value').attr("name", "value");
				// } else if (obj_temp.type == "GIFTCODE") {
				// 	$('.file_add_edit_item_giftcode').parent().parent().hide();
				// 	$('.file_add_edit_item_giftcode').attr("name", "");
				// 	$('.txt_add_edit_item_quantity').parent().parent().show();
				// 	$('.txt_add_edit_item_quantity').attr("name", "");
				// 	$('.txt_add_edit_item_value').parent().parent().hide();
				// 	$('.txt_add_edit_item_value').attr("name", "");
				// } else if (obj_temp.type == "XU") {
				// 	$('.file_add_edit_item_giftcode').parent().parent().hide();
				// 	$('.file_add_edit_item_giftcode').attr("name", "");
				// 	$('.txt_add_edit_item_quantity').parent().parent().show();
				// 	$('.txt_add_edit_item_quantity').attr("name", "quantity");
				// 	$('.txt_add_edit_item_value').parent().parent().show();
				// 	$('.txt_add_edit_item_value').attr("name", "value");
				// } else if (obj_temp.type == "ACTION") {
				// 	$('.file_add_edit_item_giftcode').parent().parent().hide();
				// 	$('.file_add_edit_item_giftcode').attr("name", "");
				// 	$('.txt_add_edit_item_quantity').parent().parent().show();
				// 	$('.txt_add_edit_item_quantity').attr("name", "quantity");
				// 	$('.txt_add_edit_item_value').parent().parent().hide();
				// 	$('.txt_add_edit_item_value').attr("name", "");
				// } else if (obj_temp.type == "JACKPOT") {
				// 	$('.file_add_edit_item_giftcode').parent().parent().hide();
				// 	$('.file_add_edit_item_giftcode').attr("name", "");
				// 	$('.txt_add_edit_item_quantity').parent().parent().show();
				// 	$('.txt_add_edit_item_quantity').attr("name", "quantity");
				// 	$('.txt_add_edit_item_value').parent().parent().show();
				// 	$('.txt_add_edit_item_value').attr("name", "value");
				// }
				//set type
				if (obj_temp.isDefault == 1) {
					$('.txt_add_edit_item_default_pos').parent().parent().show();
					$('.txt_add_edit_item_default_pos').attr("name", "defaultPosition");
					$('.txt_add_edit_item_default_pos').val(obj_temp.defaultPosition);
					$('.txt_add_edit_item_default_ratio').parent().parent().show();
					$('.txt_add_edit_item_default_ratio').attr("name", "defaultRatio");
					$('.txt_add_edit_item_default_ratio').val(obj_temp.defaultRatio * 100);
				} else {
					$('.txt_add_edit_item_default_pos').parent().parent().hide();
					$('.txt_add_edit_item_default_pos').attr("name", "");
					$('.txt_add_edit_item_default_ratio').parent().parent().hide();
					$('.txt_add_edit_item_default_ratio').attr("name", "");
				}
				// $(".select_type").attr("disabled", "disabled");
				$(".select_type").val(obj_temp.type);

				$(".select_big_item").val(String(obj_temp.bigItem));

				$(".select_incre option").filter(function () {
					return $.trim($(this).val()) == String(obj_temp.increPerDay);
				}).prop('selected', true);
				$('.select_incre').selectpicker('refresh');

				$(".hidden_id").remove();
				$("#add_giftcode_form").append("<input type='hidden' class='hidden_id' name='itemId' value='" + obj_temp.id + "' />");
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				jQuery(".select_status option").filter(function () {
					return $.trim($(this).val()) == obj_temp.status;
				}).prop('selected', true);
				$('.select_status').selectpicker('refresh');
				if (obj_temp.status == 'active') {
					$('.select_status button').css('background-color', '#32c5d2');
				} else {
					$('.select_status button').css('background-color', 'red');
				}
				if(obj_temp.highLights == true){
					$("[name='highlights']").bootstrapSwitch('state', ':checked');
				} else {
					$("[name='highlights']").bootstrapSwitch('state', '');
				}
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
	var load_autocomplete_component = function () {
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

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
		$("#single_select").change(function () {
			if ($.inArray($("#single_select").val(), channel_arr) == -1) {
				channel_arr = [];
				channel_arr.push($("#single_select").val());
				$(".current_channels").html(" <span channel_id='" + $("#single_select").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".txt_add_edit_item_channel").val($("#single_select").val());
				$(".current_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_channel").val("");
					remove_channel($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});
			}
		});
	};
	$(".btn_add_new_item").click(function () {
		$("#add_giftcode_form").trigger("reset");
		// $(".select_type").removeAttr("disabled");
		channel_arr = [];
		if (_user_data.data.groupRole.id == 2) {

		}
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('.hidden_giftcode_id').remove();
		// $('.btn_delete_item').hide();
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
			url: base_request_url + "/admin/adminItemOfSpin?itemId=" + deleted_id,
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
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_obj.name + "'", function () {});
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {});
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create Item", "Item name is required");
			return;
		}
		if ($(".txt_add_edit_item_quantity").val() == 0) {
			show_toast_notif("error", "Unable to create item", "Quantity must greater than 0", function () {});
			return;
		}
		if ($(".hidden_item_type").val() == "giftcode" && $(".file_add_edit_item_giftcode").val() == "") {
			show_toast_notif("error", "Unable to update item", "Giftcode file is require", function () {});
			return;
		}
		$('#add_giftcode_form').attr("enctype", "multipart/form-data");
		var formData = new FormData($('#add_giftcode_form')[0]);
		formData.defaultRatio = parseFloat(formData.defaultRatio) / 100;
		formData.highLights = $("#my-checkbox").bootstrapSwitch('state');
		formData.urlImage = $("#link_image_text").html();
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/adminItemOfSpin",
			type: "POST",
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
						//action when click on notif
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () {
						//action when click on notif
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
					//action when click on notif
				});
				$(".loading_icon").hide();
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		$('#add_giftcode_form').removeAttr("enctype");
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update item", "Item name is required", function () {});
			return;
		}
		// if ($(".txt_add_edit_item_quantity").val() == 0) {
		// 	show_toast_notif("error", "Unable to update item", "Quantity must greater than 0", function () {});
		// 	return;
		// }
		var formData = objectifyForm($($('#add_giftcode_form')[0]).serializeArray());
		formData.defaultRatio = parseFloat(formData.defaultRatio) / 100;
		formData.highLights = $("#my-checkbox").bootstrapSwitch('state');
		formData.urlImage = $("#link_image_text").html();
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/adminItemOfSpin",
			type: "PUT",
			data: JSON.stringify(formData),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () {
						//action when click on notif
					});
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () {
						//action when click on notif
					});
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
					//action when click on notif
				});
				$(".loading_icon").hide();
			},
		});
	});

	//=================UPLOAD image spin item

	$("#txt_add_edit_image_text").change(function(){
		linkImage = null;
		flagNewImage = false;
		imageCarosel = null;
		// $(".form_link_image_text").hide();
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
		uploadImage();
		$(".loading_icon").hide();
		if (linkImage == null){
			show_toast_notif("error", "Error", "Upload ảnh xảy ra lỗi", function () { });
			return;
		}
		$("#link_image_text").html(linkImage);
	});

	function uploadImage(){
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
						deleteImage();
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
	
	function deleteImage(){
		if(flagNewImage) {
	
			_send_info.data = {
				"urlImage" : $("#link_image_text").html()
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
	$('.select_type').change(function () {
		if ($(this).val() != "") {
			if ($(this).val() == "GIFTCODE") {
				$('.form-up-giftcode').show();
				$('.file_add_edit_item_giftcode').attr("name", "giftCodeFile");
				$('.form-quantity').hide();
				$('.txt_add_edit_item_quantity').attr("name", "");
				$('.txt_add_edit_item_value').hide();
				$('.txt_add_edit_item_value').attr("name", "");
			} else {
				$('.form-up-giftcode').hide();
				$('.file_add_edit_item_giftcode').attr("name", "");
				$('.form-quantity').show();
				$('.txt_add_edit_item_quantity').attr("name", "quantity");
				$('.txt_add_edit_item_value').parent().parent().show();
				$('.txt_add_edit_item_value').attr("name", "value");
			}
			$(".hidden_item_type").val($(this).val());
		}
	});
	$(".area_add_edit_item_desc").keydown(function () {
		$(".character_left").html(200 - parseInt($(this).val().length));
		if (200 - parseInt($(this).val().length) < 0) {
			$(".character_left").css("color", "red");
		} else {
			$(".character_left").css("color", "green");
		}
	});
	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		$(".search_input").val("");
		search_value = "";
		page_datatable.ajax.reload(null, false);
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

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$("[name='highlights']").bootstrapSwitch();
});