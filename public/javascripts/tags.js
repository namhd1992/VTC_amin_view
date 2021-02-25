//page variable
var editing_item = null;
var item_name = "Tag";
var item_names = "Tags";
var deleted_id = null;
var page_datatable = null;
_current_page = 1;
var search_value = null;

var Page_script = function () {
	return {
		//main function
		init: function () { },
	};
}();

var load_page = function () {

	//ajax get all channels
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
			"url": base_request_url + "/admin/tags",
			"type": "GET",
			"data": function (d) {
				d.limit = _per_page;
				d.offset = _per_page * (_current_page - 1);
				if (search_value != null) {
					d.searchValue = search_value;
				}
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
				return json.dataArr;
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
				title: "News",
				data: null,
				render: function (data, type, full, meta) {
					return "<i class='fa fa-rss-square'></i> " + full.numberNews;
				}
			},
			{
				title: "Channels",
				data: null,
				render: function (data, type, full, meta) {
					return "<i class='fa fa-folder'></i> " + full.numberChannel;
				}
			},
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
					var string_data = "";
					string_data = "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					string_data += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return string_data;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "25%", 'aTargets': [1] },
			{ "sWidth": "10%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "10%", 'aTargets': [4] },
			{ "sWidth": "15%", 'aTargets': [5] },
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {
			$("div.dataTables_wrapper div.dataTables_filter label").contents().filter(function () {
				return this.nodeType != 1;
			}).replaceWith("");

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_item = obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
				$('#modal_add_edit .area_add_edit_item').val(obj_temp.description);
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
				$('.btn_delete_item').attr("item_id", $(this).attr("item_id"));
				$('.btn_delete_item').show();
				$('#modal_add_edit').modal('show');
			});
			$('.btn_delete_item').click(function () {
				deleted_id = parseInt($(this).attr("item_id"));
				$("#modal_confirm").modal("show");
			});
		},
		"bFilter": false,
	});
	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit .txt_add_edit_item_name').val();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('.btn_delete_item').hide();
		$("#modal_add_edit").modal("show");
	});
	$('#page_datatable').on('order.dt', function () { })
		.on('search.dt', function () { })
		.on('page.dt', function () { })
		.dataTable();
};

jQuery(document).ready(function () {
	Page_script.init();
	load_page();

	//event for modal
	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		search_value = "";
		$(".search_input").val("");
		page_datatable.ajax.reload(null, false);
	});
	$('.btn_confirm_yes').click(function () {
		_send_info.data = {
			"tagId": deleted_id
		};
		$.ajax({
			url: base_request_url + "/admin/tags",
			type: "DELETE",
			data: JSON.stringify(_send_info.data),
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
				show_toast_notif("success", "Successfully", "Deleted: '" + $('#modal_add_edit .txt_add_edit_item_name').val() + "'", function () {
					//action when click on notif
				});
			},
			error: function (error) {
				show_toast_notif("error", "Error info: ", error.responseText, function () {
					//action when click on notif
				});
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"description": $(".area_add_edit_item").val(),
		};
		$.ajax({
			url: base_request_url + "/admin/tags",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$('#modal_add_edit').modal('hide');
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'F') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("Error", "Error", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
						//action when click on notif
					});
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText, function () {
					//action when click on notif
				});
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"description": $(".area_add_edit_item").val(),
			"id": editing_item
		};
		$.ajax({
			url: base_request_url + "/admin/tags",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				page_datatable.ajax.reload(null, false);
				$('#modal_add_edit').modal('hide');
				show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'", function () {
					//action when click on notif
				});
			},
			error: function (error) {
				show_toast_notif("error", "Error", "Error info: " + error.responseText, function () {
					//action when click on notif
				});
			},
		});
	});
	$('.select_status').change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});
});