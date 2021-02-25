//page variable
var editing_item = null;
var item_name = "Article";
var item_names = "Articles";
var deleted_id = null;
var page_datatable = null;
var data_list = null;
_current_page = 1;
var search_value = null;

var Page_script = function () {
	return {
		//main function
		init: function () { },
	};
}();

var load_page = function () {

	_send_info.data = {
		"limit": 10,
		"offset": 0,
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	page_datatable = $('#page_datatable').DataTable({
		ajax: {
			"url": base_request_url + "/admin/article",
			"type": "get",
			"data": function (d) {
				var selected_status = $(".filter_link_active").attr("status_val");
				var return_data = {
					"limit": _per_page,
					"offset": _per_page * (_current_page - 1),
				};
				if (selected_status != "all") {
					return_data.status = selected_status;
				}
				if (search_value != null) {
					return_data.searchValue = search_value;
				}
				return return_data;
			},
			"contentType": "application/json",
			"dataType": "json",
			"dataSrc": function (json) {
				var selected_status = $(".filter_link_active").attr("status_val");
				data_list = json.dataArr;
				var total_all = json.totalRecords;
				var total_active = 0;
				var total_inactive = 0;
				$(data_list).each(function (key, item) {
					if (item.status == "active") {
						total_active++;
					} else {
						total_inactive++;
					}
					if (selected_status != "all") {
						if (item.status != selected_status) {
							data_list.splice(data_list.indexOf(item), 1);
						}
					}
				});
				$.ajax({
					url: base_request_url + "/admin/article?limit=1&offset=0&status=active",
					type: "get",
					contentType: "application/json",
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
					},
					success: function (data) {
						$(".filter_active").html(data.totalRecords);
					},
					error: function (error) {
						console.log(error);
					},
				});
				$.ajax({
					url: base_request_url + "/admin/article?limit=1&offset=0&status=inactive",
					type: "get",
					contentType: "application/json",
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
					},
					success: function (data) {
						$(".filter_inactive").html(data.totalRecords);
					},
					error: function (error) {
						console.log(error);
					},
				});
				$.ajax({
					url: base_request_url + "/admin/article?limit=1&offset=0",
					type: "get",
					contentType: "application/json",
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
					},
					success: function (data) {
						$(".filter_all").html(data.totalRecords);
					},
					error: function (error) {
						console.log(error);
					},
				});
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
				return data_list;
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
			title: "Img",
			data: null,
			render: function (data, type, full, meta) {
				var html_str = "";
				html_str += "<img src='" + full.defaultImage + "' />";
				return html_str;
			}
		},
		{
			title: "Title",
			data: null,
			render: function (data, type, full, meta) {
				var html_str = "";
				html_str += "<div class='title_content'>";
				html_str += full.title;
				html_str += "</div>";
				// html_str += "<a class='btn_edit_item btn btn-link' href='new_details?id=" + full.id + "' ><i class='fa fa-commenting'></i> Comment </a>";
				return html_str;
			}
		},
		{ title: "Author", data: "author" },
		{
			title: "Publisher",
			data: null,
			render: function (data, type, full, meta) {
				return full.publisher.name;
			}
		},
		{
			title: "<i class='fa fa-commenting'></i>",
			data: null,
			render: function (data, type, full, meta) {
				return full.numberComment;
			}
		},
		{
			title: "Tags",
			data: null,
			render: function (data, type, full, meta) {
				var html_str = "";
				$(full.tagsList).each(function (key, item) {
					html_str += item.name + ", ";
				});
				return html_str;
			}
		},
		{
			title: "Date",
			data: null,
			render: function (data, type, full, meta) {
				var format = getSetting(_setting_data, "date_format");
				var news_date = moment.unix(full.createOn / 1000).format(format.value);
				return news_date;
			}
		},
		{
			title: "Actions",
			data: null,
			render: function (data, type, full, meta) {
				var html_str = "";
				html_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + escape(JSON.stringify(full)) + "' ><i class='icon-wrench'></i> Edit </a>";
				return html_str;
			}
		},
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "25%", 'aTargets': [1] },
			{ "sWidth": "10%", 'aTargets': [2] },
			{ "sWidth": "7%", 'aTargets': [3] },
			{ "sWidth": "3%", 'aTargets': [4] },
			{ "sWidth": "20%", 'aTargets': [5] },
			{ "sWidth": "15%", 'aTargets': [6] },
			{ "sWidth": "5%", 'aTargets': [7] },
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
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("form-control");
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-inline");
			$("div.dataTables_wrapper div.dataTables_filter label input").addClass("input-medium");
			$("div.dataTables_wrapper div.dataTables_filter label input").attr("placeholder", 'Search...');
			$("div.dataTables_wrapper div.dataTables_filter label input").attr("id", 'inputSuccess');

			// event for all component inside datatable
			$(".btn_edit_item").click(function () {
				editing_item = $(this).attr("item_id");
				var obj_temp = findBy(data_list, editing_item, "id");
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.id);
				$('#modal_add_edit .area_add_edit_item_title').val(obj_temp.title);
				$('#modal_add_edit .txt_add_edit_item_image').val(obj_temp.defaultImage);
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
				$('#modal_add_edit').modal('show');
			});
			$('.btn_delete_item').click(function () {
				deleted_id = parseInt($(this).attr("item_id"));
				$("#modal_confirm").modal("show");
			});
		}
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
		$(".search_input").val("");
		search_value = "";
		page_datatable.ajax.reload(null, false);
	});
	$('.btn_add_new_item').click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit .txt_add_edit_channel_name').val("");
		$('#modal_add_edit .txt_add_edit_channel_image').val("");
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$(".current_tags").html(" ");
		$(".current_packages").html(" ");
		$('#modal_add_edit').modal('show');
	});
	$('.btn_modal_save_update').click(function () {
		_send_info.data = {
			"title": $(".area_add_edit_item_title").val(),
			"status": $(".select_status option:selected").val(),
			"defaultImage": $(".txt_add_edit_item_image").val(),
			"newsId": editing_item
		};
		$.ajax({
			url: base_request_url + "/admin/article",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				_send_info.data = {
					"limit": 10000,
					"offset": 0,
				};
				page_datatable.ajax.reload(null, false);
				$('#modal_add_edit').modal('hide');
				show_toast_notif("success", "Successfully", "Updated '" + editing_item + "'", function () {
					//action when click on notif
				});
			},
			error: function (error) {
				show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function () {
					//action when click on notif
				});
			},
		});
	});
	$(".filter_link").click(function () {
		$(".filter_link").removeClass("filter_link_active");
		$(this).addClass("filter_link_active");
		page_datatable.ajax.reload(null, false);
	});

	$('.select_status').change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});
});