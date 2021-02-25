//page variable
var editing_item = null;
var item_name = "Auction";
var item_names = "Auctions";
var deleted_id = null;
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";
var img_array = [];
var confirmFlag = 0;

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

	//ajax get all datatable items
	_send_info.data = {
		"limit": _per_page,
		"offset": _per_page * (_current_page - 1),
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	var remove_img = function (img) {
		img_array.splice(img_array.indexOf(img), 1);
	};

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/auction",
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
				if (json.dataArr != null) {
					return json.dataArr;
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
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					var return_str = "";
					return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					return_str += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return_str += "<a class='btn_info_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-info'></i> Winner Info </a>";
					return return_str;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "2%", 'aTargets': [0] },
			{ "sWidth": "10%", 'aTargets': [1] },
			{ "sWidth": "5%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "10%", 'aTargets': [4] },
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
				console.log(obj_temp);
				editing_item = obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
				$('.image_item_image').html("<img src=" + obj_temp.defaultImage + " />");
				$('#modal_add_edit .txt_add_edit_item_item_name').val(obj_temp.itemName);
				$('#modal_add_edit .txt_add_edit_item_desc').val(obj_temp.description);
				$('#modal_add_edit .txt_add_edit_item_winning_message').val(obj_temp.winningMessage);
				$('#modal_add_edit #single_select_coin_type').val(obj_temp.coinType);
				$('#modal_add_edit .txt_add_edit_item_start_amount').val(obj_temp.amountStart);
				$('#modal_add_edit .txt_add_edit_item_price_step').val(obj_temp.priceStep);
				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_from_date').val(moment.unix(obj_temp.fromDate / 1000).format(format.value));
				$('.txt_add_edit_item_to_date').val(moment.unix(obj_temp.toDate / 1000).format(format.value));
				$("#single_select_type").val(obj_temp.type);
				$(".image_item_list_image").html("");
				img_array = [];
				if (obj_temp.listImage !== null) {
					$.each(obj_temp.listImage.split(","), function (key, item) {
						if (item !== "") {
							$(".image_item_list_image").append(" <img class='remove_image' src='" + item + "' />");
							img_array.push(item);
						}
					});
				}
				$(".remove_image").click(function () {
					remove_img($(this).attr("src"));
					$(this).remove();
				});
				load_autocomplete_component();
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

			$('.btn_info_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				auction_obj = obj_temp;
				auction_id = obj_temp.id;
				auction_amount_start = obj_temp.amountStart;
				$("#auction_product").html("<img src='"+ obj_temp.defaultImage +"' style='width:50%;margin-right:20px' >" + obj_temp.itemName);
				var getWinnerFlag = false;
				getWinnerFlag = getWinner(auction_id, getWinnerFlag);
				if(getWinnerFlag === false){
					return;
				}

				if(auction_amount_start === 0){
					$(".active-gift").hide();
					$(".success-gift").show();
				} else {
					$(".active-gift").show();
					$(".success-gift").hide();
				}

				confirmFlag = 1;
				$("#modal_gift_auction").modal("show");
				$(".btn_rollback ").click(function(){
					$("#modal_confirm").modal("show");
					$(".cancel_rollback").click(function(){
						if(confirmFlag === 1){
							$("#modal_confirm").modal("hide");
							$("#modal_gift_auction").modal("show");
							confirmFlag = 0;
						}
					})

					$(".btn_confirm_yes").click(function(){
						if(confirmFlag === 1){
							var rollBackFlag = rollback(auction_id);
							if(rollBackFlag === true){
								page_datatable.ajax.reload(null, false)
								confirmFlag = 0;
							} else {
								$("#modal_gift_auction").modal("show");
							}
							$("#modal_confirm").modal("hide");
						}
					})
				})
			});
		},
	});

	function getWinner(auction_id, getWinnerFlag) {
		$.ajax({
			url: base_request_url + "/admin/get-winner?auction_event_id=" + auction_id,
			type: "GET",
			async: false,
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				console.log(data);
				if (data.statusCode == 'T') {
					$("#winner_user_name").html(data.dataObj.userName);
					$("#winner_email").html(data.dataObj.email);
					$("#winner_phone").html(data.dataObj.phone);
					$("#winner_amount").html(data.dataObj.amount);
					getWinnerFlag = true;
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () { });
					$("#winner_user_name").html("");
					$("#winner_mail").html("");
					$("#winner_phone").html("");
					$("#winner_amount").html("");
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});
		return getWinnerFlag;
	};

	function rollback(auction_id) {
		var flag = false;
		$.ajax({
			url: base_request_url + "/admin/rollback-winner",
			type: "POST",
			async: false,
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({
				auctionId : auction_id
			}),
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				console.log(data);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "RollBack: Success", function () { });
					flag = true;
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () { });
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});
		return flag;
	};

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
	};

	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});

	//event for modal
	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		img_array = [];
		$('#modal_add_edit .image_item_image').html("");
		$('#modal_add_edit input:text').val("");
		$('#modal_add_edit textarea').val("");
		$('#modal_add_edit .txt_add_edit_item_start_amount').val(1);
		$('#modal_add_edit .txt_add_edit_item_price_step').val(1);
		$(".select_status option").filter(function () {
			return $.trim($(this).val()) == "active";
		}).prop('selected', true);
		$('.select_status').selectpicker('refresh');
		$('.select_status button').css('background-color', '#32c5d2');
		load_autocomplete_component();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});
	$('.btn_confirm_yes').click(function () {
		if(confirmFlag === 1) return;
		$.ajax({
			url: base_request_url + "/admin/auction?auctionEventId=" + deleted_id,
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
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () { });
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create " + item_name, item_name + " name is required");
			return;
		}
		var img_data = img_array.join(",");
		if(img_data == ""){
			img_data = null;
		}
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"defaultImage": $(".image_item_image img").attr("src"),
			"listImage": img_data,
			"description": $(".txt_add_edit_item_desc").val(),
			"itemName": $(".txt_add_edit_item_item_name").val(),
			"type": $("#single_select_type").val(),
			"coinType": $('#modal_add_edit #single_select_coin_type').val(),
			"amountStart": $(".txt_add_edit_item_start_amount").val(),
			"priceStep": $(".txt_add_edit_item_price_step").val(),
			"winningMessage": $(".txt_add_edit_item_winning_message").val(),
			"fromDate": new moment($(".txt_add_edit_item_from_date").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"toDate": new moment($(".txt_add_edit_item_to_date").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"status": $(".select_status option:selected").val()
		};
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/auction",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () { });
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
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " name is required");
			return;
		}
		var img_data = img_array.join(",");
		if(img_data == ""){
			img_data = null;
		}
		_send_info.data = {
			"auctionEventId": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"defaultImage": $(".image_item_image img").attr("src"),
			"listImage": img_data,
			"description": $(".txt_add_edit_item_desc").val(),
			"itemName": $(".txt_add_edit_item_item_name").val(),
			"type": $("#single_select_type").val(),
			"coinType": $('#modal_add_edit #single_select_coin_type').val(),
			"amountStart": $(".txt_add_edit_item_start_amount").val(),
			"priceStep": $(".txt_add_edit_item_price_step").val(),
			"winningMessage": $(".txt_add_edit_item_winning_message").val(),
			"fromDate": new moment($(".txt_add_edit_item_from_date").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"toDate": new moment($(".txt_add_edit_item_to_date").val(), "YYYY-MMMM-D hh:mm").unix() * 1000,
			"status": $(".select_status option:selected").val()
		};
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/auction",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage, function () { });
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
		format: "yyyy-MM-dd hh:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});
	$('.btn_modal_upload_image').click(function () {
		$(".loading_icon").show();
		var formData = new FormData($('#form_upload_image')[0]);
		console.log(formData);
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
					$('#modal_add_edit .image_item_image').html("<img src='" + data.dataObj + "' />");
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
	$('.btn_modal_upload_list_image').click(function () {
		$(".loading_icon").show();
		var formData = new FormData($('#form_upload_list_image')[0]);
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
					$('#modal_add_edit .image_item_list_image').append("<img src='" + data.dataObj + "' />");
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