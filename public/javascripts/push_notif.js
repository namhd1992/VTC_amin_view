//page variable
var editing_item = null;
var item_name = "Notification";
var item_names = "Notifications";
var deleted_id = null;
var channel_arr = [];
var channel_arr_normal = [];
var user_arr_normal = [];
var page_datatable = null;
_current_page = 1;
var search_value = null;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";

var Page_script = function () {
	return {
		//main function
		init: function () {
			handleTimePickers();
		},
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

	var remove_channel = function (id) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
	};

	var remove_channel_normal = function (id) {
		channel_arr_normal.splice(channel_arr_normal.indexOf(id), 1);
	};
	var remove_user_normal = function (id) {
		user_arr_normal.splice(user_arr_normal.indexOf(id), 1);
	};

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/notification",
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
				console.log(json);
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
			{ title: "Title", data: "title" },
			{
				title: "To",
				data: null,
				render: function (data, type, full, meta) {
					var send_to_obj = JSON.parse(full.sendTo);
					var return_string = "";
					if (send_to_obj.type == "all" || send_to_obj.type == "android" || send_to_obj.type == "ios") {
						return_string = send_to_obj.type;
					} else if (send_to_obj.type == "user") {
						return_string = "user: " + send_to_obj.name;
					} else if (send_to_obj.type == "channel") {
						return_string = "channel: " + send_to_obj.name;
					}
					return return_string;
				}
			},
			{ title: "Type", data: "notifiType" },
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					data = "";
					data = "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					data += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					return data;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "5%", 'aTargets': [0] },
			{ "sWidth": "50%", 'aTargets': [1] },
			{ "sWidth": "15%", 'aTargets': [2] },
			{ "sWidth": "15%", 'aTargets': [3] },
			{ "sWidth": "15%", 'aTargets': [4] },
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
				// console.log(obj_temp);
				$("#modal_add_edit .modal-title").html("Edit " + item_name + " " + obj_temp.title);
				$(".txt_add_edit_item_title").val(obj_temp.title);
				$(".txt_add_edit_item_message").val(obj_temp.message);

				//giftcode or not
				if (obj_temp.notifiType == "giftcode") {
					$(".cb_condition").attr("checked", "checked");
					$(".cb_condition").parent().addClass("checked");
					$(".form_group_giftcode").show();
					$(".form_group_normal").hide();
					$(".hidden_notifi_type").val("giftcode");
					$(".hidden_notifi_giftcode_send_to").attr("name", "sendTo");
					$(".hidden_notifi_giftcode_send_type").attr("name", "sendType");
					$(".radio_send_to").attr("name", "");
					$(".radio_send_type").attr("name", "");
					$("#select2-single_select_giftcode_channel-container").html("");
					var send_to_value = JSON.parse(obj_temp.sendTo);
					channel_arr = [];
					channel_arr.push(send_to_value.value);
					$(".current_channels").html("<span channel_id='" + send_to_value.value + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + send_to_value.name + "<span class='remove_channel' data-role='remove'></span></span>");
					$(".txt_add_edit_item_giftcode_channel").val(send_to_value.value);
					$(".current_channels .remove_channel").click(function () {
						$(".txt_add_edit_item_giftcode_channel").val("");
						remove_channel($(this).parent().attr("channel_id"));
						$(this).parent().remove();
					});
				} else {
					$(".cb_condition").attr("checked", "");
					$(".cb_condition").parent().removeClass("checked");
					$(".form_group_giftcode").hide();
					$(".form_group_normal").show();
					$(".hidden_notifi_type").val("normal");
					$(".hidden_notifi_giftcode_send_to").attr("name", "");
					$(".hidden_notifi_giftcode_send_type").attr("name", "");
					$(".radio_send_to").attr("name", "sendTo");
					$(".radio_send_type").attr("name", "sendType");
				}

				//send type control
				$(".radio_send_type").attr("checked", "");
				$(".radio_send_type").parent().removeClass("checked");
				$(".radio_send_type[value=" + obj_temp.sendType + "]").attr("checked", "checked");
				$(".radio_send_type[value=" + obj_temp.sendType + "]").parent().addClass("checked");
				if (obj_temp.sendType == "now") {
					$(".form_group_schedule").hide();
					$(".form_group_repeat").hide();
				} else if (obj_temp.sendType == "schedule") {
					$(".form_group_schedule").show();
					$(".form_group_repeat").hide();
					var notif_date = new Date(obj_temp.sendOn);
					var str_date = "";
					str_date += str_pad(notif_date.getDate()) + "/";
					str_date += str_pad(notif_date.getMonth() + 1) + "/";
					str_date += notif_date.getFullYear();
					$(".send_on_date").val(str_date);
					var str_time = "";
					str_time += str_pad(notif_date.getHours()) + ":";
					str_time += str_pad(notif_date.getMinutes());
					$(".send_on_time").val(str_time);
				} else if (obj_temp.sendType == "repeat") {
					$(".form_group_schedule").hide();
					$(".form_group_repeat").show();
					$(".time_repeat").val(obj_temp.timeRepeat);
					var notif_date = new Date(obj_temp.sendOn);
					var str_date = "";
					str_date += str_pad(notif_date.getDate()) + "/";
					str_date += str_pad(notif_date.getMonth() + 1) + "/";
					str_date += notif_date.getFullYear();
					$(".send_on_date_repeat").val(str_date);
					var str_time = "";
					str_time += str_pad(notif_date.getHours()) + ":";
					str_time += str_pad(notif_date.getMinutes());
					$(".send_on_time_repeat").val(str_time);
				}

				//send to control
				var send_to_value = JSON.parse(obj_temp.sendTo);
				$(".radio_send_to").attr("checked", "");
				$(".radio_send_to").parent().removeClass("checked");
				$(".radio_send_to[value=" + send_to_value.type + "]").attr("checked", "checked");
				$(".radio_send_to[value=" + send_to_value.type + "]").parent().addClass("checked");
				if (send_to_value.type == "all" || send_to_value.type == "android" || send_to_value.type == "ios") {
					$(".form_group_to_user").hide();
					$(".form_group_to_channel").hide();
				} else if (send_to_value.type == "user") {
					$(".form_group_to_user").show();
					$(".form_group_to_channel").hide();
					if ($.inArray(send_to_value.value, user_arr_normal) == -1) {
						user_arr_normal = [];
						user_arr_normal.push(send_to_value.value);
						$("#select2-single_select_normal_user-container").html("");
						$(".current_normal_user").html(" <span user_id='" + send_to_value.value + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + send_to_value.name + "<span class='remove_user' data-role='remove'></span></span>");
						$(".txt_add_edit_item_normal_user").val(send_to_value.value);
						$(".current_normal_user .remove_user").click(function () {
							$(".txt_add_edit_item_normal_user").val("");
							remove_user_normal($(this).parent().attr("user_id"));
							$(this).parent().remove();
						});
					}
				} else if (send_to_value.type == "channel") {
					$(".form_group_to_user").hide();
					$(".form_group_to_channel").show();
					if ($.inArray(send_to_value.value, channel_arr_normal) == -1) {
						channel_arr_normal = [];
						channel_arr_normal.push(send_to_value.value);
						$("#select2-single_select_normal_channel-container").html("");
						$(".current_normal_channels").html(" <span channel_id='" + send_to_value.value + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + send_to_value.name + "<span class='remove_channel' data-role='remove'></span></span>");
						$(".txt_add_edit_item_normal_channel").val(send_to_value.value);
						$(".current_normal_channels .remove_channel").click(function () {
							$(".txt_add_edit_item_normal_channel").val("");
							remove_channel_normal($(this).parent().attr("channel_id"));
							$(this).parent().remove();
						});
						$("#single_select_normal_channel").val(parseInt(send_to_value.value));
						console.log(send_to_value);
						load_autocomplete_component();
					}
				}

				$("#modal_add_edit .btn_modal_save_new").hide();
				$("#modal_add_edit .btn_modal_save_update").show();

				//set status
				jQuery(".select_status option").filter(function () {
					return $.trim($(this).val()) == obj_temp.status;
				}).prop('selected', true);
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
	$(".select2, .select2-multiple, .select2-allow-clear, .js-data-example-ajax").on("select2:open", function () {
		if ($(this).parents("[class*='has-']").length) {
			var classNames = $(this).parents("[class*='has-']")[0].className.split(/\s+/);

			for (var i = 0; i < classNames.length; ++i) {
				if (classNames[i].match("has-")) {
					$("body > .select2-container").addClass(classNames[i]);
				}
			}
		}
		if ($(this).attr("id") == "single_select_normal_user") {
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
					$("#single_select_normal_user").html("");
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
							console.log("success");
							var tags_arr = [];
							$(data.dataArr).each(function (key, item) {
								$("#single_select_normal_user").append("<option value='" + item.id + "'> " + item.username + "</option>");
							});
							load_autocomplete_component();
							$("#single_select_normal_user").select2("open");
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

	var load_autocomplete_component = function () {

		$.fn.select2.defaults.set("theme", "bootstrap");
		var placeholder = "Type to search";

		$(".select2").select2({
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



		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});

		//auto complete action
		$("#single_select_giftcode_channel").change(function () {
			if ($.inArray($("#single_select_giftcode_channel").val(), channel_arr) == -1) {
				channel_arr = [];
				channel_arr.push($("#single_select_giftcode_channel").val());
				$(".current_channels").html(" <span channel_id='" + $("#single_select_giftcode_channel").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select_giftcode_channel option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".txt_add_edit_item_channel").val($("#single_select_giftcode_channel").val());
				$(".current_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_channel").val("");
					remove_channel($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});
			}
		});

		$("#single_select_normal_channel").change(function () {
			if ($.inArray($("#single_select_normal_channel").val(), channel_arr_normal) == -1) {
				channel_arr_normal = [];
				channel_arr_normal.push($("#single_select_normal_channel").val());
				$(".current_normal_channels").html(" <span channel_id='" + $("#single_select_normal_channel").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select_normal_channel option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".txt_add_edit_item_normal_channel").val($("#single_select_normal_channel").val());
				$(".current_normal_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_normal_channel").val("");
					remove_channel_normal($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});
			}
		});

		$("#single_select_normal_user").change(function () {
			if ($.inArray($("#single_select_normal_user").val(), user_arr_normal) == -1) {
				user_arr_normal = [];
				user_arr_normal.push($("#single_select_normal_user").val());
				$(".current_normal_user").html(" <span user_id='" + $("#single_select_normal_user").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select_normal_user option:selected").text() + "<span class='remove_user' data-role='remove'></span></span>");
				$(".txt_add_edit_item_normal_user").val($("#single_select_normal_user").val());
				$(".current_normal_user .remove_user").click(function () {
					$(".txt_add_edit_item_normal_user").val("");
					remove_user_normal($(this).parent().attr("user_id"));
					$(this).parent().remove();
				});
			}
		});

		$("#single_select_normal_user").focus(function () {
			this.selectedIndex = -1;
		});

	};

	_send_info.data = {
		"limit": 10,
		"offset": 0
	};

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
			var tags_arr = [];
			$(data.dataArr).each(function (key, item) {
				$("#single_select_normal_user").append("<option value='" + item.id + "'> " + item.username + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log("error");
			console.log(err.error());
		}
	});

	//ajax get all channel
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
				$("#single_select_giftcode_channel").append("<option value='" + item.id + "'> " + item.name + "</option>");
				$("#single_select_normal_channel").append("<option value='" + item.id + "'> " + item.name + "</option>");
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
		$(".txt_add_edit_item_channel").attr("name", "channelId");
		channel_arr = [];
		channel_arr_normal = [];
		user_arr_normal = [];
		$('.current_channels').html("");
		$(".cb_condition").attr("checked", "");
		$(".cb_condition").parent().removeClass("checked");
		$(".form_group_giftcode").hide();
		$(".form_group_normal").show();
		$(".hidden_notifi_type").val("normal");
		$(".hidden_notifi_giftcode_send_to").attr("name", "");
		$(".hidden_notifi_giftcode_send_type").attr("name", "");
		$(".radio_send_to").attr("name", "sendTo");
		$(".radio_send_type").attr("name", "sendType");
		$(".radio_send_type").attr("checked", "");
		$(".radio_send_type").parent().removeClass("checked");
		$(".radio_send_type[value=now]").attr("checked", "checked");
		$(".radio_send_type[value=now]").parent().addClass("checked");
		$(".form_group_repeat").hide();
		$(".form_group_schedule").hide();
		$(".radio_send_to").attr("checked", "");
		$(".radio_send_to").parent().removeClass("checked");
		$(".radio_send_to[value=all]").attr("checked", "checked");
		$(".radio_send_to[value=all]").parent().addClass("checked");
		$(".form_group_to_channel").hide();
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});

	//ready event for datatable
	$('#page_datatable').on('order.dt', function () { }).on('search.dt', function (a) { }).dataTable();

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
			"id": deleted_id
		};
		$.ajax({
			url: base_request_url + "/admin/notification",
			type: "DELETE",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function () {
				$('#modal_confirm').modal('hide');
				_current_page = 1;
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
		var formData = objectifyForm($($('#add_item_form')[0]).serializeArray());
		console.log(formData.sendTo);
		if (formData.sendTo == "all") {
			formData.sendTo = {
				"type": "all",
				"value": "all"
			};
		} else if (formData.sendTo == "android") {
			formData.sendTo = {
				"type": "android",
				"value": "android"
			};
		} else if (formData.sendTo == "ios") {
			formData.sendTo = {
				"type": "ios",
				"value": "ios"
			};
		} else if (formData.sendTo == "user") {
			formData.sendTo = {
				"type": "user",
				"value": user_arr_normal[0]
			};
			console.log(formData.sendTo);
		} else if (formData.sendTo == "channel") {
			if (formData.notifiType == "normal") {
				formData.sendTo = {
					"type": "channel",
					"value": channel_arr_normal[0]
				};
			} else if (formData.notifiType == "giftcode") {
				formData.sendTo = {
					"type": "channel",
					"value": channel_arr[0]
				};
			}
		}
		if (formData.sendType == "schedule") {
			if (formData.notifiType == "normal") {
				var send_on_date = $(".send_on_date").val();
				var dateParts = send_on_date.split('/');
				var send_on_time = $(".send_on_time").val();
				var timeParts = send_on_time.split(':');
				var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
				formData.sendOn = date.getTime();
			} else if (formData.notifiType == "giftcode") {
				var currentdate = new Date();
				var send_on_time = $(".send_on_time_repeat_giftcode").val();
				var timeParts = send_on_time.split(':');
				var date = new Date(currentdate.getFullYear(), currentdate.getMonth(), currentdate.getDate(), timeParts[0], timeParts[1]);
				formData.sendOn = date.getTime();
			}
		} else if (formData.sendType == "repeat") {
			var send_on_date = $(".send_on_date_repeat").val();
			var dateParts = send_on_date.split('/');
			var send_on_time = $(".send_on_time_repeat").val();
			var timeParts = send_on_time.split(':');
			var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
			formData.sendOn = date.getTime();
			formData.timeRepeat = $(".time_repeat").val();
		}

		//validate
		if ($(".txt_add_edit_item_title").val() == "") {
			show_toast_notif("error", "Unable to create notification", "Title is required", function () {
				//action when click on notif
			});
			return;
		}
		if ($(".txt_add_edit_item_message").val() == "") {
			show_toast_notif("error", "Unable to create notification", "Message is required", function () {
				//action when click on notif
			});
			return;
		}
		if (formData.notifiType == "giftcode") {
			if (channel_arr.length < 1) {
				show_toast_notif("error", "Unable to create notification", "You must choose channel", function () {
					//action when click on notif
				});
				return;
			}
			if ($(".send_on_time_repeat_giftcode").val() == "") {
				show_toast_notif("error", "Unable to create notification", "Time is required", function () {
					//action when click on notif
				});
				return;
			}
		} else {
			if (formData.sendType == "schedule") {
				if ($(".send_on_date").val() == "") {
					show_toast_notif("error", "Unable to create notification", "Date is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".send_on_time").val() == "") {
					show_toast_notif("error", "Unable to create notification", "Time is required", function () {
						//action when click on notif
					});
					return;
				}
			}
			if (formData.sendType == "repeat") {
				if ($(".send_on_date_repeat").val() == "") {
					show_toast_notif("error", "Unable to create notification", "Date is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".send_on_time_repeat").val() == "") {
					show_toast_notif("error", "Unable to create notification", "Time is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".time_repeat").val() == "") {
					show_toast_notif("error", "Unable to create notification", "Repeat time is required", function () {
						//action when click on notif
					});
					return;
				}
			}
			if (formData.sendTo.type == "channel") {
				if (channel_arr_normal.length < 1) {
					show_toast_notif("error", "Unable to create notification", "You must choose channel", function () {
						//action when click on notif
					});
					return;
				}
			}
		}

		$.ajax({
			url: base_request_url + "/admin/notification",
			type: "POST",
			data: JSON.stringify(formData),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.onlyMessage == 'Success') {
					$('#modal_add_edit').modal('hide');
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_title").val() + "'", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Fail", "Error while create " + item_name, function () {
						//action when click on notif
					});
				}
			},
			error: function (error) {
				show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'", function () {
					//action when click on notif
				});
			},
		});
	});

	$('.btn_modal_save_update').click(function () {
		var formData = objectifyForm($($('#add_item_form')[0]).serializeArray());
		console.log(formData);
		if (formData.sendTo == "all") {
			formData.sendTo = {
				"type": "all",
				"value": "all"
			};
		} else if (formData.sendTo == "android") {
			formData.sendTo = {
				"type": "android",
				"value": "android"
			};
		} else if (formData.sendTo == "ios") {
			formData.sendTo = {
				"type": "ios",
				"value": "ios"
			};
		} else if (formData.sendTo == "user") {
			formData.sendTo = {
				"type": "user",
				"value": "ios"
			};
		} else if (formData.sendTo == "channel") {
			if (formData.notifiType == "normal") {
				formData.sendTo = {
					"type": "channel",
					"value": channel_arr_normal[0]
				};
			} else if (formData.notifiType == "giftcode") {
				formData.sendTo = {
					"type": "channel",
					"value": channel_arr[0]
				};
			}
		}
		if (formData.sendType == "schedule") {
			if (formData.notifiType == "normal") {
				var send_on_date = $(".send_on_date").val();
				var dateParts = send_on_date.split('/');
				var send_on_time = $(".send_on_time").val();
				var timeParts = send_on_time.split(':');
				var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
				formData.sendOn = date.getTime();
			} else if (formData.notifiType == "giftcode") {
				var currentdate = new Date();
				var send_on_time = $(".send_on_time_repeat_giftcode").val();
				var timeParts = send_on_time.split(':');
				var date = new Date(currentdate.getFullYear(), currentdate.getMonth(), currentdate.getDate(), timeParts[0], timeParts[1]);
				formData.sendOn = date.getTime();
			}
		} else if (formData.sendType == "repeat") {
			var send_on_date = $(".send_on_date_repeat").val();
			var dateParts = send_on_date.split('/');
			var send_on_time = $(".send_on_time_repeat").val();
			var timeParts = send_on_time.split(':');
			var date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
			formData.sendOn = date.getTime();
			formData.timeRepeat = $(".time_repeat").val();
		}
		formData["id"] = editing_item;

		//validate
		if ($(".txt_add_edit_item_title").val() == "") {
			show_toast_notif("error", "Unable to update notification", "Title is required", function () {
				//action when click on notif
			});
			return;
		}
		if ($(".txt_add_edit_item_message").val() == "") {
			show_toast_notif("error", "Unable to update notification", "Message is required", function () {
				//action when click on notif
			});
			return;
		}
		if (formData.notifiType == "giftcode") {
			if (channel_arr.length < 1) {
				show_toast_notif("error", "Unable to update notification", "You must choose channel", function () {
					//action when click on notif
				});
				return;
			}
			if ($(".send_on_time_repeat_giftcode").val() == "") {
				show_toast_notif("error", "Unable to update notification", "Time is required", function () {
					//action when click on notif
				});
				return;
			}
		} else {
			if (formData.sendType == "schedule") {
				if ($(".send_on_date").val() == "") {
					show_toast_notif("error", "Unable to update notification", "Date is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".send_on_time").val() == "") {
					show_toast_notif("error", "Unable to update notification", "Time is required", function () {
						//action when click on notif
					});
					return;
				}
			}
			if (formData.sendType == "repeat") {
				if ($(".send_on_date_repeat").val() == "") {
					show_toast_notif("error", "Unable to update notification", "Date is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".send_on_time_repeat").val() == "") {
					show_toast_notif("error", "Unable to update notification", "Time is required", function () {
						//action when click on notif
					});
					return;
				}
				if ($(".time_repeat").val() == "") {
					show_toast_notif("error", "Unable to update notification", "Repeat time is required", function () {
						//action when click on notif
					});
					return;
				}
			}
			if (formData.sendTo.type == "channel") {
				if (channel_arr_normal.length < 1) {
					show_toast_notif("error", "Unable to update notification", "You must choose channel", function () {
						//action when click on notif
					});
					return;
				}
			}
		}
		$.ajax({
			url: base_request_url + "/admin/notification",
			type: "PUT",
			data: JSON.stringify(formData),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.onlyMessage == 'Success') {
					$('#modal_add_edit').modal('hide');
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_title").val() + "'", function () {
						//action when click on notif
					});
				} else {
					show_toast_notif("error", "Fail", "Error", function () {
						//action when click on notif
					});
				}
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () {
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

	$(".cb_condition").change(function () {
		if ($(this).parent().hasClass("checked")) {
			$(".form_group_giftcode").show();
			$(".form_group_normal").hide();
			$(".hidden_notifi_type").val("giftcode");
			$(".hidden_notifi_giftcode_send_to").attr("name", "sendTo");
			$(".hidden_notifi_giftcode_send_type").attr("name", "sendType");
			$(".radio_send_to").attr("name", "");
			$(".radio_send_type").attr("name", "");
		} else {
			$(".form_group_giftcode").hide();
			$(".form_group_normal").show();
			$(".hidden_notifi_type").val("normal");
			$(".hidden_notifi_giftcode_send_to").attr("name", "");
			$(".hidden_notifi_giftcode_send_type").attr("name", "");
			$(".radio_send_to").attr("name", "sendTo");
			$(".radio_send_type").attr("name", "sendType");
		}
	});

	$(".radio_send_type").on("change", function (e) {
		if (e.target.value == "now") {
			$(".form_group_schedule").hide();
			$(".form_group_repeat").hide();
		} else if (e.target.value == "schedule") {
			$(".form_group_schedule").show();
			$(".form_group_repeat").hide();
		} else if (e.target.value == "repeat") {
			$(".form_group_schedule").hide();
			$(".form_group_repeat").show();
		}
	});

	$(".radio_send_to").on("change", function (e) {
		console.log(e.target.value);
		if (e.target.value == "all" || e.target.value == "android" || e.target.value == "ios") {
			$(".form_group_to_user").hide();
			$(".form_group_to_channel").hide();
		} else if (e.target.value == "user") {
			$(".form_group_to_user").show();
			$(".form_group_to_channel").hide();
		} else if (e.target.value == "channel") {
			$(".form_group_to_user").hide();
			$(".form_group_to_channel").show();
		}
	});

	$(".select2-search__field").on("click", function () {
		console.log($(this));
	});
};

var handleTimePickers = function () {

	if (jQuery().timepicker) {
		$('.timepicker-default').timepicker({
			autoclose: true,
			showSeconds: true,
			minuteStep: 1
		});

		$('.timepicker-no-seconds').timepicker({
			autoclose: true,
			minuteStep: 5
		});

		$('.timepicker-24').timepicker({
			autoclose: true,
			minuteStep: 5,
			showSeconds: false,
			showMeridian: false
		});

		// handle input group button click
		$('.timepicker').parent('.input-group').on('click', '.input-group-btn', function (e) {
			e.preventDefault();
			$(this).parent('.input-group').find('.timepicker').timepicker('showWidget');
		});
	}
	//event for modal
	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});
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