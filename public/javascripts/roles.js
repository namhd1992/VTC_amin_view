//page variable
var editing_item = null;
var item_name = "Role";
var item_names = "Roles";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
_current_page = 1;
var load_autocomplete_component;

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
		"offset": 0,
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});
	var remove_channel = function (id, name) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
		$('#single_select').append('<option value=' + id + '>' + name + '</option>');
		// $('#single_select option[value=' + id + ']').remove();
		load_autocomplete_component();
	};

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/groupRole",
			"type": "GET",
			"data": function (d) {
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
				title: "Status",
				data: null,
				render: function (data, type, full, meta) {
					if (full.status == "active") {
						data = "<div class='active_status'>" + full.status + "</div>";
					} else {
						data = "<div class='inactive_status'>inactive</div>";
					}
					return data;
				}
			},
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					data = "";
					data += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					data += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return data;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "50%", 'aTargets': [1] },
			{ "sWidth": "20%", 'aTargets': [2] },
			{ "sWidth": "20%", 'aTargets': [3] },
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bPaginate": false,
		"bFilter": false,
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
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_item = obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);

				$(".current_channels").html("");
				channel_arr = [];
				$.each(obj_temp.functionList, function (key, item) {
					channel_arr.push(parseInt(item.id));
					$(".current_channels").append(" <span channel_id='" + item.id + "' channel_name='" + item.functionName + "' class='tag label label-warning'><i class='fa fa-wrench'></i> " + item.functionName + "<span class='remove_channel' data-role='remove'></span></span>");
					$(".txt_add_edit_item_channel").val(item.functionName);
					$('#single_select option[value=' + item.id + ']').remove();
				});
				load_autocomplete_component();
				$(".current_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_channel").val("");
					remove_channel(parseInt($(this).parent().attr("channel_id")), $(this).parent().attr("channel_name"));
					$(this).parent().remove();
				});

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
				$('.btn_delete_item').show();
				$('.btn_delete_item').attr("item_id", obj_temp.id);
				$('#modal_add_edit').modal('show');
			});
			$('.btn_delete_item').click(function () {
				deleted_id = parseInt($(this).attr("item_id"));
				$("#modal_confirm").modal("show");
			});
		},
	});

	//auto complete
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

	};
	$("#single_select").change(function (e) {
		var selected_val = parseInt($("#single_select").val());
		if ($.inArray(selected_val, channel_arr) == -1) {
			channel_arr.push(selected_val);
			$(".current_channels").append("<span channel_id='" + selected_val + "' channel_name='" + $("#single_select option:selected").text() + "' class='tag label label-warning'><i class='fa fa-wrench'></i> " + $("#single_select option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
			$(".txt_add_edit_item_channel").val(selected_val);
			$(".current_channels .remove_channel").click(function () {
				$(".txt_add_edit_item_channel").val("");
				remove_channel(parseInt($(this).parent().attr("channel_id")), $(this).parent().attr("channel_name"));
				$(this).parent().remove();
			});
			setTimeout(function () {
				$('#single_select option[value=' + selected_val + ']').remove();
				load_autocomplete_component();
			}, 1000);
		}
	});

	//ajax get all channels
	_send_info.data = {
		limit: 10000,
		offset: 0
	};
	$.ajax({
		url: base_request_url + "/admin/function",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				$("#single_select").append("<option value='" + item.id + "'> " + item.functionName + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit input:text').val("");
		$('#modal_add_edit textarea').val("");
		$('.hidden_add_edit_item_condidion').attr("name", "conditionId");
		$(".txt_add_edit_item_channel").attr("name", "channelId");
		$('.cb_add_edit_item_condition span').removeClass("checked");
		$('.current_channels').html("");
		$('.file_add_edit_item_giftcode').parent().parent().show();
		$('.file_add_edit_item_giftcode').attr("name", "giftCodeFile");
		channel_arr = [];
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('.hidden_giftcode_id').remove();
		$('.btn_delete_item').hide();
		$("#modal_add_edit").modal("show");
	});
	$('#page_datatable').on('order.dt', function () { })
		.on('search.dt', function (a) { })
		.dataTable();
};

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});
	//event for modal
	$('.btn_confirm_yes').click(function () {
		_send_info.data = {
			"id": deleted_id
		};
		$.ajax({
			url: base_request_url + "/admin/groupRole",
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
				show_toast_notif("success", "Successfully", "Deleted: '" + deleted_id + "'", function () {
					//action when click on notif
				});
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
					//action when click on notif
				});
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"functionList": channel_arr
		};
		$.ajax({
			url: base_request_url + "/admin/groupRole",
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
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Error", "Unable to create role", function () {
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
			"id": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"functionList": channel_arr
		};
		$.ajax({
			url: base_request_url + "/admin/groupRole",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$('#modal_add_edit').modal('hide');
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "' please re-login to update permissions", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Error", "Unable to update role", function () {
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
	$('.select_status').change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});
});