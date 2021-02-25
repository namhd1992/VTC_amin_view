//page variable
var editing_item = null;
var item_name = "Followed Game";
var item_names = "Followed Games";
var deleted_id = null;
var channel_arr = [];
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
		"limit": 10,
		"offset": 0,
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});
	var remove_channel = function (id) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
	};
	var copyToClipboard = function (text) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val(text).select();
		document.execCommand("copy");
		$temp.remove();
	};
	var add_android_package = function (package_name) {
		$(".android_package_item").append('<input type="text" class="txt_add_edit_android_package form-control extent_package" placeholder="Enter text" value="' + package_name + '">');
		$(".android_package_item").append('<a class="btn btn-icon-only purple btn_rm_android_package extent_package"><i class="fa fa-times"></i></a>');
		$(".btn_rm_android_package").click(function () {
			$(this).prev().remove();
			$(this).remove();
		});
	};
	var add_ios_package = function (package_name) {
		$(".ios_package_item").append('<input type="text" class="txt_add_edit_ios_package form-control extent_package" placeholder="Enter text" value="' + package_name + '">');
		$(".ios_package_item").append('<a class="btn btn-icon-only purple btn_rm_ios_package extent_package"><i class="fa fa-times"></i></a>');
		$(".btn_rm_ios_package").click(function () {
			$(this).prev().remove();
			$(this).remove();
		});
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
				channel_arr.push($("#single_select").val());
				$(".current_channels").append(" <span channel_id='" + $("#single_select").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".current_channels .remove_channel").click(function () {
					remove_channel($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});
			}
		});
	};

	//ajax get all channels
	_send_info.data = {};
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
			$(data.dataArr).each(function (key, item) {
				$("#single_select").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	page_datatable = $('#page_datatable').DataTable({
		ajax: {
			"url": base_request_url + "/admin/package",
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
		columns: [
			{ title: "ID", data: "id" },
			{ title: "Name", data: "name" },
			{
				title: "Android",
				data: null,
				render: function (data, type, full, meta) {
					var render_string = "";
					if (full.packageAndroid != "" && full.packageAndroid != null) {
						$(full.packageAndroid.split(",")).each(function (key, item) {
							if (item !== "") {
								render_string += "<div class='wrap_package_icon tooltip-top' title='Click to copy' data-tooltip='" + item + "'><i class='package_icon_icon fa fa-android'></i></div> ";
							}
						});
					}
					return render_string;
				}
			},
			{
				title: "iOS",
				data: null,
				render: function (data, type, full, meta) {
					var render_string = "";
					if (full.packageIOS != "" && full.packageIOS != null) {
						$(full.packageIOS.split(",")).each(function (key, item) {
							if (item !== "") {
								render_string += "<div class='wrap_package_icon tooltip-top' title='Click to copy' data-tooltip='" + item + "'><i class='package_icon_icon fa fa-apple'></i></div> ";
							}
						});
					}
					return render_string;
				}
			},
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
			{ "sWidth": "15%", 'aTargets': [1] },
			{ "sWidth": "15%", 'aTargets': [2] },
			{ "sWidth": "20%", 'aTargets': [3] },
			{ "sWidth": "5%", 'aTargets': [4] },
			{ "sWidth": "5%", 'aTargets': [5] },
			{ "sWidth": "5%", 'aTargets': [6] },
			{ "sWidth": "20%", 'aTargets': [7] },
		],
		"autoWidth": false,
		"searching": false,
		"lengthChange": false,
		"info": false,
		"bSort": false,
		"bFilter": false,
		"bPaginate": false,
		"fnDrawCallback": function (oSettings) {

			// event for all component inside datatable
			$(".wrap_package_icon").click(function () {
				copyToClipboard($(this).attr("data-tooltip"));
				show_toast_notif("info", "Copied to clipboard", "Package name '" + $(this).attr("data-tooltip") + "'", function () {
					//action when click on notif
				});
			});
			$(".wrap_package_icon").mouseover(function () {
				$(this).find(".package_icon_text").show();
			});
			$(".wrap_package_icon").mouseout(function () {
				$(this).find(".package_icon_text").hide();
			});
			$(".btn_edit_item").click(function () {
				channel_arr = [];
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				console.log(obj_temp);
				editing_item = obj_temp.id;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.name);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.name);
				$('#modal_add_edit .txt_add_edit_android_download').val(obj_temp.urlDownloadAndroid);
				$('#modal_add_edit .txt_add_edit_ios_download').val(obj_temp.urlDownloadiOS);

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
				$(".current_channels").html(" ");
				if (obj_temp.listChannels != null) {
					$.each(obj_temp.listChannels, function (key, item) {
						$(".current_channels").append(" <span class='tag label label-primary'><i class='fa fa-folder'></i> " + item.name + "<span class='remove_channel' data-role='remove'></span></span>");
						channel_arr.push(item.id);
					});
				}
				$(".current_channels .remove_channel").click(function () {
					remove_channel($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});

				//load package
				$(".extent_package").remove();
				$(obj_temp.packageAndroid.split(",")).each(function (key, item) {
					if (key === 0) {
						$('#modal_add_edit .txt_add_edit_android_package').val(item);
					}
					if (item !== "" && key !== 0) {
						add_android_package(item);
					}
				});
				$(obj_temp.packageIOS.split(",")).each(function (key, item) {
					if (key === 0) {
						$('#modal_add_edit .txt_add_edit_ios_package').val(item);
					}
					if (item !== "" && key !== 0) {
						add_ios_package(item);
					}
				});
				$('#modal_add_edit').modal('show');
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
			});
			$('.btn_delete_item').click(function () {
				deleted_id = parseInt($(this).attr("item_id"));
				$("#modal_confirm").modal("show");
			});
		}
	});
	$(".btn_add_new_item").click(function () {
		$(".extent_package").remove();
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit .txt_add_edit_item_name').val("");
		$('#modal_add_edit .txt_add_edit_ios_package').val("");
		$('#modal_add_edit .txt_add_edit_android_package').val("");
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$(".current_channels").html(" ");
		$("#modal_add_edit").modal("show");
	});
	$('#page_datatable').on('order.dt', function () { })
		.on('search.dt', function () { })
		.on('page.dt', function () { })
		.dataTable();

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
	$(".btn_confirm_yes").click(function () {
		_send_info.data = {
			"packageId": deleted_id
		};
		$.ajax({
			url: base_request_url + "/admin/package",
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
				show_toast_notif("success", "Successfully", "Deleted: " + deleted_id, function () {
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
	$(".btn_modal_save_new").click(function () {
		var package_android_str = "";
		$(".txt_add_edit_android_package").each(function (key, item) {
			package_android_str += $(item).val() + ",";
		});
		var package_ios_str = "";
		$(".txt_add_edit_ios_package").each(function (key, item) {
			package_ios_str += $(item).val() + ",";
		});
		_send_info.data = {
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"packageIOS": package_ios_str,
			"packageAndroid": package_android_str,
			"channelsId": channel_arr,
			"urlDownloadAndroid": $(".txt_add_edit_android_download").val(),
			"urlDownloadiOS": $(".txt_add_edit_ios_download").val(),
		};
		$.ajax({
			url: base_request_url + "/admin/package",
			type: "POST",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_add_edit').modal('hide');
				page_datatable.ajax.reload();
				show_toast_notif("success", "Successfully", "Item '" + $(".txt_add_edit_item_name").val() + "' is created", function () {
					//action when click on notif
				});
			}
		});
	});
	$(".btn_modal_save_update").click(function () {
		var package_android_str = "";
		$(".txt_add_edit_android_package").each(function (key, item) {
			package_android_str += $(item).val() + ",";
		});
		var package_ios_str = "";
		$(".txt_add_edit_ios_package").each(function (key, item) {
			package_ios_str += $(item).val() + ",";
		});
		_send_info.data = {
			"id": editing_item,
			"name": $(".txt_add_edit_item_name").val(),
			"status": $(".select_status option:selected").val(),
			"packageIOS": package_ios_str,
			"packageAndroid": package_android_str,
			"channelsId": channel_arr,
			"urlDownloadAndroid": $(".txt_add_edit_android_download").val(),
			"urlDownloadiOS": $(".txt_add_edit_ios_download").val(),
		};
		$.ajax({
			url: base_request_url + "/admin/package",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_add_edit').modal('hide');
				page_datatable.ajax.reload();
				show_toast_notif("success", "Successfully", "Item '" + $(".txt_add_edit_item_name").val() + "' is updated", function () {
					//action when click on notif
				});
			}
		});
	});
	$(".select_status").change(function () {
		if ($(this).val() == 'active') {
			$('.select_status button').css('background-color', '#32c5d2');
		} else if ($(this).val() == 'inactive') {
			$('.select_status button').css('background-color', 'red');
		}
	});
	$(".btn_add_more_android_package").click(function () {
		add_android_package("");
	});
	$(".btn_add_more_ios_package").click(function () {
		add_ios_package("");
	});
};

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
});