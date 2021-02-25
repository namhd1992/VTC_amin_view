//page variable
var editing_item = null;
var item_name = "Event Game";
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
var listItems = [];
var itemChange = [];
var itemRemove = [];

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

_send_info.data = {
	limit: 1000,
	offset: 0
};

var load_page = function () {

	CKEDITOR.replace('tutorial');
	
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
			"url": base_request_url + "/admin/event-game/get",
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
                console.log(json)
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
			{ title: "Event Type", data: "eventType" },
			{ title: "Gift Lost", data: "gaveGift" },
			{
				title: "Status",
				data: null,
				render: function (data, type, full, meta) {
					if (full.status == true) {
						data = "<div class='active_status'> Active </div>";
					} else {
						data = "<div class='inactive_status'> Inactive </div>";
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
					return return_str;
				}
			}
        ],
        "aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "2%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "20%", 'aTargets': [1] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [2] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [3] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [4] },
			{ responsivePriority: 2, "sWidth": "10%", 'aTargets': [5] },
			{ responsivePriority: 1, "sWidth": "10%", 'aTargets': [6] },
        ],
        "autoWidth": true,
		"lengthChange": true,
		"info": false,
		"bSort": true,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {

			// ========================= FORM EDIT EVENT GAME=========================
			
			$(".btn_edit_item").click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_item = obj_temp.id;
				eventGame = obj_temp;

				// generate data to form edit
				$('#modal_add_edit .modal-title').html("Edit " + eventGame.name);
				$(".txt_add_edit_item_name").val(eventGame.name);
				
				$("#select_event_type").val(eventGame.eventType);
				$("#single_select_game").val(eventGame.serviceId);
				if (CKEDITOR.instances.tutorial !== undefined) {
					CKEDITOR.instances.tutorial.destroy();
				}
				CKEDITOR.replace('tutorial');
				CKEDITOR.instances.tutorial.setData(eventGame.playTutorial);
				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_from_date').val(moment.unix(eventGame.fromDate / 1000).format(format.value));
				$('.txt_add_edit_item_to_date').val(moment.unix(eventGame.toDate / 1000).format(format.value));
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				$('#modal_add_edit').modal('show');

				$('.detail_items , .button_add_item').remove();
				$.each( obj_temp.itemEvents, function (key, item) {
					// if (key != obj_temp.itemEvents.length - 1) {
						var stt = key + 1;
						var html_str = "";
						html_str += '<div class="form-group detail_items">';
						html_str += '<div class="col-xs-1" style="margin-left: 110px;">' + stt + '</div>';
						html_str += '<div class="col-xs-5" id="item_name">' + item.item.name + '</div>';
						html_str += '<div class="col-xs-3">';
						html_str += '<input type="number" class="item_price form-control" min="1" placeholder="Price" value="' + item.item.price + '">';
						html_str += '<input type="hidden" class="item_id" value="' + item.item.id + '" />';
						html_str += '</div>';
						html_str += '<div class="col-sx-1"><a class="btn btn-icon-only red btn_delete_item"><i class="fa fa-remove"></i></a></div>';
						html_str += '</div>';
						if (key == obj_temp.itemEvents.length - 1) {
							html_str += '<div class="col-xs-9 button_add_item"><a style="width:20%;margin-left:378px;font-size:17px;" class="btn btn-icon-only green btn_add_more_item"><i class="fa fa-plus"></i></a></div>';
						}
					
						$('.item_group').append(html_str);
						$('.btn_delete_item').click(function () {
							$(this).parent().parent().hide();
							$(this).parent().parent().addClass("remove_items");
							$(this).parent().parent().removeClass("detail_items");
						});

						$(".btn_add_more_item").click(function(){
							var html_str = "";
							html_str += '<div class="form-group detail_items">';
							html_str += '<div class="col-xs-1" style="margin-left: 110px;"></div>';
							html_str += '<div class="col-xs-5">';
							html_str += '<select class="form-control select_new_item select2">';
							if (listItems != null){
								html_str += '<option value="0">Lựa Chọn Item</option>';
								$.each(listItems , function(key, value){
									html_str += '<option value="' + value.shopingItem.id + '">' + value.shopingItem.name + '</option>';
								});
							}
							html_str += '</select>';
							html_str += '</div>';
							html_str += '<div class="col-xs-3">';
							html_str += '<input type="number" class="item_price form-control" min="1" placeholder="Price">';
							html_str += '<input type="hidden" class="item_id" />';
							html_str += '</div>';
							html_str += '<div class="col-sx-1"><a class="btn btn-icon-only red btn_delete_item"><i class="fa fa-remove"></i></a></div>';
							
							html_str += '</div>';
							$(this).parent().before(html_str);

							$('.select_new_item').change(function(){
								$(this).parent().next().children().next().val($(this).val()) ;
							});

							$('.btn_delete_item').click(function () {
								var itemId = $(this).parent().prev().children().next().val();
								$(this).parent().parent().remove();
							});
					});
				});
			});

			$('.btn_delete_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				deleted_obj = obj_temp;
				deleted_id = obj_temp.id;
				$("#modal_confirm").modal("show");
			});
		},
	});

	// Call to API Update Event Game
	$('#modal_add_edit .btn_modal_save_update').click(function(){
		updateOrCreateEventGame(URL_UPDATE_EVENT_GAME, editing_item);
	});

	// ========================= FORM ADD NEW EVENT GAME=========================

	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Add new " + item_name);
		$('#add_edit_event_game_form').trigger("reset");
		$(".txt_add_edit_package_gift").each(function () {
			if ($(".txt_add_edit_package_gift").length == 1) {
				$(".txt_add_edit_package_gift").val("");
				return;
			}
			$(".txt_add_edit_package_gift").parent(".col-xs-3:last-child").remove();
		});
		$('#single_select_type_award').val("XU");
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('#modal_add_edit').modal('show');

		// Call to API Add Event Game
		$("#modal_add_edit .btn_modal_save_new").click(function () {
			updateOrCreateEventGame(URL_CREATE_EVENT_GAME, null);
		})
	});

	//event for modal
	$('.btn_confirm_yes').click(function () {
		$.ajax({
			url: base_request_url + "/admin/event-game/delete?eventId=" + deleted_id,
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

	// ========================= CALL TO API SERVER =========================

	// $.ajax({
	// 	url: base_request_url + "/admin/shopingItem?itemType=3",
	// 	type: "GET",
	// 	data: _send_info.data,
	// 	contentType: "application/json",
	// 	dataType: "json",
	// 	beforeSend: function (xhr) {
	// 		xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
	// 	},
	// 	success: function (data) {
	// 		if (data.status == '01') {
	// 			listItems = data.data;
	// 		} else {
	// 			show_toast_notif("error", "Fail", data.message, function () { });
	// 		}
	// 	},
	// 	error: function (err) {
	// 		console.log(err.error());
	// 	}
	// });

	function updateOrCreateEventGame(URL, item_id){
		var packageGiftData = "";
		$(".txt_add_edit_package_gift").each(function(){
			if ($(this).val() == "" || $(this).val() == 0){
				$(this).parent().remove();
			} else {
				var string = $(this).val();
				string = string.replace(".","");
				packageGiftData += string + ",";
			}
		});

		// get item update price
		itemChange = [];
		$.each($(".detail_items"), function(){
			var group = $(this).children().next().next();
				var item = {
						"id" : group.children().next().val(),
						"newPrice" : group.children().val()
					}
				itemChange.push(item);
		});
		
		// get item remove out event
		itemRemove = [];
		$.each($(".remove_items"), function(){
			var group = $(this).children().next().next();
				itemRemove.push($(this).children().next().next().children().next().val());
		});
		
		//del item in list item remove if add new it
		$.each(itemChange , function(k1, v1){
			$.each(itemRemove , function(k2, v2){
					if (v1.id == v2){
						itemRemove.splice(k2,1);
					}
			});
		});
		console.log("itemChange", itemChange);
		console.log("itemRemove", itemRemove);

		_send_info.data = {
			"id": item_id,
			"name": $(".txt_add_edit_item_name").val(),
			"serviceId": $(".txt_add_edit_service_id").val(),
			"urlBaseEvent": $(".txt_add_edit_base_url").val(),
			"giftEvent": $('#single_select_type_award option:selected').val(),
			"oncePoint" : $(".txt_add_edit_once_point").val(),
			"ratioGift": $(".ratio_gift").val(),
			"packageGift": packageGiftData.slice(0,-1),
			"limitGift": $(".value_limit_award").val(),
			"gaveGift" : $(".txt_add_edit_gift_lost").val(),
			"playTutorial" : CKEDITOR.instances.tutorial.getData(),
			"fromDate": new moment($(".txt_add_edit_item_from_date").val(), "YYYY-MM-D").unix() * 1000,
			"toDate": new moment($(".txt_add_edit_item_to_date").val(), "YYYY-MM-D").unix() * 1000,
			"status": $(".select_status option:selected").val(),
			"itemUpdates" : itemChange,
			"itemRemoveIds" : itemRemove
		};

		if ($('#single_select_type_award option:selected').val() == "SHOPING") {
			_send_info.data.packageGift = 0; 
		}

		console.log(_send_info.data);

		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + URL,
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
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.message, function () { });
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
			console.log(_send_info.data);
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});
	}
		
	
	// ========================== SUPORT AND OTHER ACTION ========================

	// add new and remove package gift
	$("#single_select_type_award").change(function(){
		if ($(this).val() == "SHOPING") {
			$(".form_item_group").show();
			$(".form_package_gift").hide();
			$(".ratio_gift").attr("disabled" , "disable");
			$(".ratio_gift").val(1);
		} else {
			$(".form_item_group").hide();
			$(".form_package_gift").show();
			$(".ratio_gift").removeAttr("disabled");
		}
	});


	$("#add_package_gift").click(function(){
		$(".parent_package_gift").append("<div class='col-xs-3'><input type='text' class='txt_add_edit_package_gift form-control' name='parkageGift'></div>");
	})
	$("#remove_package_gift").click(function(){
		if ($(".txt_add_edit_package_gift").length == 1) {
			$(".txt_add_edit_package_gift").val("");
			return;
		}
		$(".txt_add_edit_package_gift").parent(".col-xs-3:last-child").remove();
	})

	// button reset gift lost because user 
	$("#reset_gift_lost").click(function(){
		$(".txt_add_edit_gift_lost").val(0);
	})

	// change limit , if unlimit -> disable input limit
	$("#single_select_limit").change(function(){
		if ($("#single_select_limit").val() == "") {
			$(".value_limit_award").attr("disabled","disable");
			$(".value_limit_award").val(0);
		} else {
			$(".value_limit_award").removeAttr("disabled");
		}
		
	});

	// select game or other service -> service id
	$("#single_select_game").change(function(){
		var serviceId = $("#single_select_game").val();
		if (serviceId != 0) {
			$(".txt_add_edit_service_id").attr("disabled","disable")
		} else {
			$(".txt_add_edit_service_id").removeAttr("disabled")
		}
		console.log(serviceId);
		$(".txt_add_edit_service_id").val(serviceId);
	});
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
			$(data.data).each(function (key, item) {
				$("#single_select_game").append("<option value='" + item.scoinGameId + "'> " + item.name + "</option>");
			});
		},
		error: function (err) {
			console.log(err.error());
		}
	});
	
	// config date time fromdate and todate
	$(".form_datetime").datetimepicker({
				autoclose: true,
				todayBtn: true,
				isRTL: App.isRTL(),
				format: "yyyy-mm-dd hh:ii",
				pickerPosition: (App.isRTL() ? "bottom-right" : "top-right")
	});

}

jQuery(document).ready(function () {
	Page_script.init();
	load_page();

});