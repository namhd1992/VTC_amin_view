//page variable
var deleted_id = 0;
var item_name = "Channel";
var item_names = "Channels";
var editing_channel = null;
var tag_array = [];
var package_array = [];
var channel_array = [];
var page_datatable = null;
var search_value = "";
var typingTimer;
var doneTypingInterval = 500;
var is_requesting = false;
var typing_input;

var Page_script = function () {
	return {
		//main function
		init: function () { },
	};
}();

var load_page = function () {

	//page function
	var remove_tag = function (id) {
		tag_array.splice(tag_array.indexOf(id), 1);
	};
	// var remove_package = function(id) {
	//     package_array.splice(package_array.indexOf(id), 1);
	// }

	var drawTable = function (table_selector, data) {
		for (var i = 0; i < data.length; i++) {
			drawRow(table_selector, data[i]);
		}
	};

	var drawRow = function (table_selector, rowData) {
		var row = $("<tr />");
		$(table_selector).append(row);
		row.append($("<td>" + rowData.id + "</td>"));
		row.append($("<td>" + rowData.firstName + "</td>"));
		row.append($("<td>" + rowData.lastName + "</td>"));
	};

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
		});

		// copy Bootstrap validation states to Select2 dropdown
		//
		// add .has-waring, .has-error, .has-succes to the Select2 dropdown
		// (was #select2-drop in Select2 v3.x, in Select2 v4 can be selected via
		// body > .select2-container) if _any_ of the opened Select2's parents
		// has one of these forementioned classes (YUCK! ;-))
		$(".select2").on("select2:open", function () {
			if ($(this).parents("[class*='has-']").length) {
				var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);
				for (var i = 0; i < classNames.length; ++i) {
					if (classNames[i].match("has-")) {
						$("body > .select2-container").addClass(classNames[i]);
					}
				}
			}

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
						"searchValue": $(typing_input).val()
					};
					$("#single_select").html("");
					$.ajax({
						url: base_request_url + "/admin/tags",
						type: "GET",
						data: _send_info.data,
						contentType: "application/json",
						dataType: "json",
						beforeSend: function (xhr) {
							xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
						},
						success: function (data) {
							console.log("success");
							var tags_arr = [];
							$(data.dataArr).each(function (key, item) {
								$("#single_select").append("<option value='" + item.id + "'> " + item.name + "</option>");
							});
						},
						error: function (err) {
							console.log("error");
							console.log(err.error());
						}
					});
				}, doneTypingInterval);
			});

		});

		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
		$("#single_select").change(function () {
			if ($.inArray($("#single_select").val(), tag_array) == -1) {
				tag_array.push($("#single_select").val());
				$(".current_tags").append(" <span tag_id='" + $("#single_select").val() + "' class='tag label label-info'><i class='fa fa-tags'></i> " + $("#single_select option:selected").text() + "<span class='remove_tag' data-role='remove'></span></span>");
				$(".current_tags .remove_tag").click(function () {
					remove_tag($(this).parent().attr("tag_id"));
					$(this).parent().remove();
				});
			}
		});
		// $("#single_select_packages").change(function() {
		//     if ($.inArray($("#single_select_packages").val(), package_array) == -1) {
		//         package_array.push($("#single_select_packages").val());
		//         $(".current_packages").append(" <span package_id='" + $("#single_select_packages").val() + "' class='tag label label-warning'><i class='fa fa-gamepad'></i> " + $("#single_select_packages option:selected").text() + "<span class='remove_tag' data-role='remove'></span></span>");
		//         $(".current_packages .remove_packages").click(function() {
		//             remove_package($(this).parent().attr("package_id"));
		//             $(this).parent().remove();
		//         });
		//     }
		// });
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	//get all packages
	_send_info.data = {
		"limit": 10,
		"offset": 0
	};
	$.ajax({
		url: base_request_url + "/admin/tags",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			var tags_arr = [];
			$(data.dataArr).each(function (key, item) {
				$("#single_select").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log("error");
			console.log(err.error());
		}
	});

	//ajax get all channels
	_send_info.data = {};
	page_datatable = $('#page_datatable').DataTable({
		ajax: {
			"url": base_request_url + "/admin/channel",
			"type": "GET",
			"data": function () {
				var d = {};
				d.limit = _per_page;
				d.offset = _per_page * (_current_page - 1);
				if (search_value != null) {
					d.searchValue = search_value;
				}
				return d;
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
					$(".loading_icon").show();
					_current_page = parseInt($(e.target).attr("page"));
					page_datatable.ajax.reload();
				});
				$(".loading_icon").hide();
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
		columns: [
			{ title: "ID", data: "id" },
			{ title: "Name", data: "name" },
			{ title: "Followers", data: "numberFollower" },
			{ title: "News", data: "numberNews" },
			{
				title: "Tags",
				data: null,
				render: function (data, type, full, meta) {
					var tags_data = 0;
					$(full.tagsList).each(function (key, item) {
						if (item.tagType === null) {
							tags_data += 1;
						}
					});
					return "<i class='fa fa-tags'></i> " + tags_data;
				}
			},
			{
				title: "Status",
				data: null,
				render: function (data, type, full, meta) {
					var status_data = null;
					if (full.status == "active") {
						status_data = "<div class='active_status' >" + full.status + "</div>";
					} else if (full.status == "inactive") {
						status_data = "<div class='inactive_status' >" + full.status + "</div>";
					}
					return status_data;
				}
			},
			{
				title: "Actions",
				data: null,
				render: function (data, type, full, meta) {
					var action_data = "";
					action_data = "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "' ><i class='icon-wrench'></i> Edit </a>";
					action_data += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "' ><i class='icon-trash'></i> Delete </a>";
					return action_data;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "30%", 'aTargets': [1] },
			{ "sWidth": "10%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "5%", 'aTargets': [4] },
			{ "sWidth": "10%", 'aTargets': [5] },
			{ "sWidth": "20%", 'aTargets': [6] },
		],
		"autoWidth": false,
		"searching": false,
		"lengthChange": false,
		"bPaginate": false,
		"info": false,
		"bSort": false,
		"filter": false,
		"fnDrawCallback": function (oSettings) {
			//event for ajax component
			$('.btn_edit_item').click(function () {
				tag_array = [];
				package_array = [];
				var channel_obj_temp = JSON.parse($(this).attr("item_obj"));
				editing_channel = channel_obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + channel_obj_temp.name);
				$('#modal_add_edit .txt_add_edit_channel_name').val(channel_obj_temp.name);
				$('#modal_add_edit .txt_add_edit_channel_image').val(channel_obj_temp.defaultImage);
				$('#modal_add_edit .btn_modal_save').html("Publish change");
				$(".current_tags").html(" ");
				$(".current_packages").html(" ");
				$.each(channel_obj_temp.tagsList, function (key, item) {
					if (item.tagType === null) {
						$(".current_tags").append(" <span class='tag label label-info'><i class='fa fa-tags'></i> " + item.name + "<span class='remove_tag' data-role='remove'></span></span>");
						tag_array.push(item.id);
					} else if (item.tagType == "game") {
						// $(".current_packages").append(" <span class='tag label label-warning'>" + item.name + "<span class='remove_package' data-role='remove'></span></span>");
						$(".current_packages").append(" <span class='tag label label-warning'><i class='fa fa-gamepad'></i> " + item.name + "</span>");
						package_array.push(item.id);
					}
				});
				$(".current_tags .remove_tag").click(function () {
					remove_tag($(this).parent().attr("tag_id"));
					$(this).parent().remove();
				});

				$(".current_packages .remove_package").click(function () {
					remove_package($(this).parent().attr("package_id"));
					$(this).parent().remove();
				});
				$('#modal_add_edit .btn_modal_save_update').attr("item_id", $(this).attr("item_id"));
				$('.btn_delete_item').attr("item_id", $(this).attr("item_id"));
				$('.btn_delete_item').show();
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				jQuery(".select_status option").filter(function () {
					return $.trim($(this).val()) == channel_obj_temp.status;
				}).prop('selected', true);
				$('.select_status').selectpicker('refresh');
				if (channel_obj_temp.status == 'active') {
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

	//event for modal
	$(".btn_confirm_yes").click(function () {
		_send_info.data = {
			"channelIds": [deleted_id]
		};
		$.ajax({
			url: base_request_url + "/admin/channel",
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
				show_toast_notif("success", "Successfully", "Deleted: '" + $(".txt_add_edit_channel_name").val() + "'", function () {
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

	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		search_value = "";
		$(".search_input").val("");
		page_datatable.ajax.reload(null, false);
	});
	$('.btn_modal_save_new').click(function () {
		_send_info.data = {
			"name": $(".txt_add_edit_channel_name").val(),
			"status": $(".select_status option:selected").val(),
			"description": "no description",
			"defaultImage": $(".txt_add_edit_channel_image").val(),
			"listTags": $.merge(tag_array, package_array)
		};
		$.ajax({
			url: base_request_url + "/admin/channel",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$('#modal_add_edit').modal('hide');
				_send_info.data = {};
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == "T") {
					show_toast_notif("success", "Successfully", "Created: '" + $(".txt_add_edit_channel_name").val() + "'", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Error", "'" + data.onlyMessage + "'", function () {
						//action when click on notif
					});
				}
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
					//action when click on notif
				});
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		_send_info.data = {
			"id": $(this).attr("item_id"),
			"name": $(".txt_add_edit_channel_name").val(),
			"status": $(".select_status option:selected").val(),
			"description": "no description",
			"defaultImage": $(".txt_add_edit_channel_image").val(),
			"listTags": $.merge(tag_array, package_array)
		};
		$.ajax({
			url: base_request_url + "/admin/channel",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_add_edit').modal('hide');
				_send_info.data = {};
				page_datatable.ajax.reload(null, false);
				show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_channel_name").val() + "'", function () {
					//action when click on notif
				});
			},
			error: function (error) {
				$('#modal_add_edit').modal('hide');
				show_toast_notif("error", "Error", "'" + error.responseText + "'", function () {
					//action when click on notif
				});
			},
		});
	});
	$('.btn_add_new_item').click(function () {
		tag_array = [];
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit .txt_add_edit_channel_name').val("");
		$('#modal_add_edit .txt_add_edit_channel_image').val("");
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$(".current_tags").html(" ");
		$(".current_packages").html(" ");
		$('#modal_add_edit').modal('show');
	});
	$('.btn_update_position').click(function () {
		$(".loading_icon").show();
		_send_info.data = {
			"limit": 100000,
			"offset": 0
		};
		$.ajax({
			url: base_request_url + "/admin/channel",
			type: "GET",
			data: _send_info.data,
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				$("#items").html("");
				$(data.dataArr).each(function (key, item) {
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
				console.log("error");
				console.log(err.error());
				$(".loading_icon").hide();
			}
		});
	});
	$('.select_status').change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});
	$('.btn_modal_save_position').click(function () {
		$(".loading_icon").show();
		var updated_position = {};
		var position = 1;
		$('.channel_position').each(function (key, item) {
			updated_position[$(item).attr("item_id")] = position;
			position++;
		});
		$.ajax({
			url: base_request_url + "/admin/channelPosition",
			type: "POST",
			data: JSON.stringify(updated_position),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				_send_info.data = {};
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == "T") {
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
};

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
});