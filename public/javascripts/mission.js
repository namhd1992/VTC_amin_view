//page variable
var editing_item = null;
var item_name = "Mission";
var item_names = "Missions";
var deleted_id = null;
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
	$("[name='my-checkbox']").bootstrapSwitch();
	
});

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
	$(".group_luckyspin").css("display", "block");

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
			"url": base_request_url + "/admin/mission",
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
					console.log(json.data);
					$.each(json.data, function (key, value) {
						if(value.valueLimit == null || value.valueLimit == 0){
							value.valueLimit = "No Limited"
						}
					})
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
			{ title: "Award", data: "award" },
			{ title: "Award Limit", data: "valueLimit" },
			{
				title: "Create On",
				data: null,
				render: function (data, type, full, meta) {
					var str_date = moment(full.createOn).format("HH:mm DD/MM/YYYY");
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
			{ "sWidth": "2%", 'aTargets': [0] },
			{ "sWidth": "13%", 'aTargets': [1] },
			{ "sWidth": "3%", 'aTargets': [2] },
			{ "sWidth": "3%", 'aTargets': [3] },
			{ "sWidth": "3%", 'aTargets': [4] },
			{ "sWidth": "7%", 'aTargets': [5] },
			{ "sWidth": "7%", 'aTargets': [6] },
		],
		"autoWidth": false,
		"lengthChange": false,
		"info": false,
		"bSort": true,
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
				$('#modal_add_edit .txt_add_edit_item_type').val(obj_temp.gameType);
				$('#modal_add_edit .txt_add_edit_item_award').val(obj_temp.valueAward);
				$('#single_select_type_award').val(obj_temp.award);
				$('#single_select_action').val(obj_temp.action);
				dailyMission(1);
				switch (obj_temp.action) {
					case 1:
						$("#single_select_lucky").val(obj_temp.objectId);
						break;
					case 3:
						$("#single_select_game").val(obj_temp.objectId);
						break;
					case 4:
						$("#single_select_game").val(obj_temp.objectId);
						break;
					case 5:
						$("#single_select_game").val(obj_temp.objectId);
						break;
					case 6:
						$("#link_share").val(obj_temp.linkToShare);
						break;
					case 9:
						$("#single_select_game").val(obj_temp.objectId);
						dailyMission(9);
						break;
					case 10:
						$("#single_select_game").val(obj_temp.objectId);
						dailyMission(9);
						break;
				}
				if ($("#single_select_type_award").val() == "TURN_SPIN") {
					$("#select_spin_award").val(obj_temp.spinAwardId)
				}
				$('#single_select_limit').val(obj_temp.typeLimit);
				$('.value_limit_award').val(obj_temp.valueLimit);
				$('#modal_add_edit .txt_add_edit_item_desc').val(obj_temp.description);
				$('#modal_add_edit .txt_add_edit_item_fb_value').val(obj_temp.objectValue);
				$('#modal_add_edit .txt_add_edit_item_game_value').val(obj_temp.objectValue);
				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_from_date').val(moment.unix(obj_temp.fromDate / 1000).format(format.value));
				$('.txt_add_edit_item_to_date').val(moment.unix(obj_temp.toDate / 1000).format(format.value));
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
				//set status
				$(".select_status option").filter(function () {
					return $.trim($(this).val()) == obj_temp.status;
				}).prop('selected', true);
				$('.select_status').selectpicker('refresh');
				//set daily
				$(".select_daily option").filter(function () {
					return $.trim($(this).val()) == obj_temp.cyclic.toString();
				}).prop('selected', true);
				$('.select_daily').selectpicker('refresh');
				if (obj_temp.status == 'active') {
					$('.select_status button').css('background-color', '#32c5d2');
				} else {
					$('.select_status button').css('background-color', 'red');
				}
				load_autocomplete_component();
				$('#modal_add_edit').modal('show');

				if(obj_temp.highLights == true){
					$("[name='my-checkbox']").bootstrapSwitch('state', ':checked');
				} else {
					$("[name='my-checkbox']").bootstrapSwitch('state', '');
				}

				
			});
			$('.btn_delete_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				deleted_obj = obj_temp;
				deleted_id = obj_temp.id;
				$("#modal_confirm").modal("show");
			});
		},
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

		showTypeAction();

		$("#single_select_action").change(function () {
			showTypeAction();
			dailyMission($("#single_select_action").val());
		});

		if($("#single_select_type_award").val() == "GIFTCODE"){
			$(".type_award").hide();
			$(".giftcode_file").show();
		} else if ($("#single_select_type_award").val() == "TURN_SPIN") {
			$(".type_award").hide();
			$(".turn_spin_award").show();
		} else {
			$(".type_award").hide();
		}

		$("#single_select_type_award").change(function () {
			if($("#single_select_type_award").val() == "GIFTCODE"){
				$(".type_award").hide();
				$(".giftcode_file").show();
			} else if ($("#single_select_type_award").val() == "TURN_SPIN") {
				$(".type_award").hide();
				$(".turn_spin_award").show();
			} else {
				$(".type_award").hide();
			}
		});

		if($("#single_select_limit").val() == ""){
			$(".value_limit_award").attr("disabled","disabled");
		}

		$("#single_select_limit").change(function () {
			if($("#single_select_limit").val() == ""){
				$(".value_limit_award").attr("disabled","disabled");
				$(".value_limit_award").val("");
			} else {
				$(".value_limit_award").removeAttr("disabled");
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
			if ($(this).attr("id") == "single_select_lucky") {

				//event for search field
				typing_input = $('.select2-search__field')[0];
				$(typing_input).on("keypress", function () {
					clearTimeout(typingTimer);
					typingTimer = setTimeout(function () {
						//ajax get all tags
						_send_info.data = {
							"limit": 5,
							"offset": 0,
							"searchValue": $(typing_input).val()
						};
						searching_value_timeout = $(typing_input).val();
						$("#single_select_lucky").html("");
						$.ajax({
							url: base_request_url + "/admin/luckySpin",
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
									$("#single_select_lucky").append("<option value='" + item.id + "'> " + item.name + "</option>");
								});
								load_autocomplete_component();
								$("#single_select_lucky").select2("open");
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
		$(".js-btn-set-scaling-classes").on("click", function () {
			$("#select2-multiple-input-sm, #select2-single-input-sm").next(".select2-container--bootstrap").addClass("input-sm");
			$("#select2-multiple-input-lg, #select2-single-input-lg").next(".select2-container--bootstrap").addClass("input-lg");
			$(this).removeClass("btn-primary btn-outline").prop("disabled", true);
		});
	};

	$(".btn_add_new_item").click(function () {
		$('#modal_add_edit .modal-title').html("Create new " + item_name);
		$('#modal_add_edit input:text').val("");
		$('#modal_add_edit .txt_add_edit_item_award').val(1);
		$('#modal_add_edit textarea').val("");
		$(".select_status option").filter(function () {
			return $.trim($(this).val()) == "active";
		}).prop('selected', true);
		$('.select_status').selectpicker('refresh');
		$('.select_status button').css('background-color', '#32c5d2');
		$(".select_daily option").filter(function () {
			return $.trim($(this).val()) == "false";
		}).prop('selected', true);
		$('.select_daily').selectpicker('refresh');
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});

	

	//event for modal
	$('.btn_confirm_yes').click(function () {
		$.ajax({
			url: base_request_url + "/admin/mission?missionId=" + deleted_id,
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
		if ($(".txt_add_edit_item_desc").val().length > 200) {
			show_toast_notif("error", "Unable to create " + item_name, item_name + ", description length must < 200 characters");
			return;
		}

		switch ($('#single_select_action').val()) {
			case 1:
				if ($("#single_select_lucky").val() == "") {
					show_toast_notif("error", "Unable to create " + item_name, "Phải chọn lucky spin");
					return;
					}
				break;
			case 6:
				if ($("#link_share").val() == "") {
					show_toast_notif("error", "Unable to create " + item_name, "Phải điền link để share");
					return;
					}
				break;
			// default:
			// 	if ($("#single_select_game").val() == "") {
			// 		show_toast_notif("error", "Unable to create " + item_name, "Phải Chọn game mục tiêu ");
			// 		return;
			// 		}
			// 	break;
		}

		// get value data action
		var dataAction = getDataAction();
		var object_id = dataAction[0];
		var object_value = dataAction[1];

		//Create Mission
		_send_info.data = {
			"missionName": $(".txt_add_edit_item_name").val(),
			"description": $(".txt_add_edit_item_desc").val(),
			"action": $('#single_select_action').val(),
			"objectId": object_id,
			"objectValue": object_value,
			"linkToShare": $("#link_share").val(),
			"typeLimit" : $('#single_select_limit').val(),
			"valueLimit" : $(".value_limit_award").val(),
			"award": $("#single_select_type_award").val(),
			"spinAwardId": $("#select_spin_award").val(),
			"valueAward": $(".txt_add_edit_item_award").val(),
			"fromDate": new moment($(".txt_add_edit_item_from_date").val(), "YYYY-MMMM-D HH:mm").unix() * 1000,
			"toDate": new moment($(".txt_add_edit_item_to_date").val(), "YYYY-MMMM-D HH:mm").unix() * 1000,
			"cyclic": $(".select_daily option:selected").val(),
			"defaultImage": "default",
			"status": $(".select_status option:selected").val(),
			"highLights": $("[name='my-checkbox']").bootstrapSwitch('state')
		};

		

		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/mission",
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
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'", function () { });
					importCard(data.data);
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
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " name is required");
			return;
		}
		if ($(".txt_add_edit_item_desc").val().length > 200) {
			show_toast_notif("error", "Unable to update " + item_name, item_name + ", description length must < 200 characters");
			return;
		}

		switch ($('#single_select_action').val()) {
			case 1:
				if ($("#single_select_lucky").val() == "") {
					show_toast_notif("error", "Unable to create " + item_name, "Phải chọn lucky spin");
					return;
					}
				break;
			case 6:
				if ($("#link_share").val() == "") {
					show_toast_notif("error", "Unable to create " + item_name, "Phải điền link để share");
					return;
					}
				break;
			default:
				// if ($("#single_select_game").val() == "") {
				// 	show_toast_notif("error", "Unable to create " + item_name, "Phải Chọn game mục tiêu ");
				// 	return;
				// 	}
				// break;
		}

		// get value data action
		var dataAction = getDataAction();
		var object_id = dataAction[0];
		var object_value = dataAction[1];

		//Update Mission
		_send_info.data = {
			"missionId": editing_item,
			"missionName": $(".txt_add_edit_item_name").val(),
			"description": $(".txt_add_edit_item_desc").val(),
			"action": $('#single_select_action').val(),
			"objectId": object_id,
			"objectValue": object_value,
			"linkToShare": $("#link_share").val(),
			"typeLimit" : $('#single_select_limit').val(),
			"valueLimit" : $(".value_limit_award").val(),
			"award": $("#single_select_type_award").val(),
			"spinAwardId": $("#select_spin_award").val(),
			"valueAward": $(".txt_add_edit_item_award").val(),
			"fromDate": new moment($(".txt_add_edit_item_from_date").val(), "YYYY-MMMM-D HH:mm").unix() * 1000,
			"toDate": new moment($(".txt_add_edit_item_to_date").val(), "YYYY-MMMM-D HH:mm").unix() * 1000,
			"cyclic": $(".select_daily option:selected").val(),
			"defaultImage": "default",
			"status": $(".select_status option:selected").val(),
			"highLights": $("[name='my-checkbox']").bootstrapSwitch('state')
		};
		
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/mission",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.status == '01') {
					importCard(data.data);
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
		todayBtn: true,
		isRTL: App.isRTL(),
		format: "yyyy-MM-dd hh:ii",
		pickerPosition: (App.isRTL() ? "top-right" : "top-left")
	});
	_send_info.data = {
		limit: 1000,
		offset: 0
	}
	$.ajax({
		url: base_request_url + "/admin/luckySpin",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				$("#single_select_lucky").append("<option value='" + item.id + "'> " + item.name + "</option>");
				$("#select_spin_award").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	$.ajax({
		url: base_request_url + "/admin/auction",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				$("#single_select_auction").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	$.ajax({
		url: base_request_url + "/admin/giftcodeEvent",
		type: "GET",
		data: _send_info.data,
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				$("#single_select_giftcode").append("<option value='" + item.giftcodeEvent.id + "'> " + item.keyName + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
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
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
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



function showTypeAction() {
	switch (parseInt($("#single_select_action").val())) {
		case 1:
			$(".group_target").css("display", "none");
			$(".group_luckyspin").css("display", "block");
			break;
		case 2:
			$(".group_target").css("display", "none");
			break;
		case 3:
			$(".group_target").css("display", "none");
			$(".group_game").css("display", "block");
			break;
		case 4:
			$(".group_target").css("display", "none");
			$(".group_game").css("display", "block");
			break;
		case 5:
			$(".group_target").css("display", "none");
			break;

		case 6:
			$(".group_target").css("display", "none");
			$(".group_share_link").css("display", "block");
			break;
	}
}

$("#txt_add_edit_giftcode_file").change(function(){
	$(".txt_add_edit_giftcode_info").text(this.files[0].name);
})

function importCard(mission) {
	if(mission.award === "GIFTCODE" 
		&& $("#txt_add_edit_giftcode_file")[0].files[0] != undefined
		&& $("#txt_add_edit_giftcode_file")[0].files[0] != null){

		var formData = new FormData();
		formData.append('codeFile', $("#txt_add_edit_giftcode_file")[0].files[0]);
		formData.append('eventType', "MISSION");
		formData.append('mainEventId', mission.id);
	
		$.ajax({
			url: base_request_url + "/admin/giftcode",
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
				if (data.status == '01') {
					$("#txt_add_edit_item_giftcode_info").text("")
				} else {
					show_toast_notif("error", "Fail", data.message, function () { });
				}
			},
			error: function (error) {
			console.log(_send_info.data);
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function () { });
				$(".loading_icon").hide();
			},
		});

	}
	
}

function getDataAction() {
	switch (parseInt($("#single_select_action").val())) {
		// lucky spin
		case 1:
			return [$("#single_select_lucky").val(), null];

		//điểm danh ngày
		case 2:
			return [null, null];

		// Auction
		case 3:
			return [$("#single_select_game").val(), null];

		//giftcode
		case 4:
			return [$("#single_select_game").val(), null];

		//login game
		case 5:
			return [null, null];

		default :
			return [null, null];
	}
	
}

function dailyMission(typeMission) {

	if(typeMission == 8
		|| typeMission == 9
		|| typeMission == 10){
			$(".select_daily option").filter(function () {
				return $.trim($(this).val()) == "false";
			}).prop('selected', true);
			$('.select_daily').selectpicker('refresh');
			$(".select_daily").attr("disabled" , "disabled");
			$(".select_daily button").addClass("disabled");
		} else {
			$(".select_daily button").removeClass("disabled");
			$(".select_daily").removeAttr("disabled");
		}
	
}