//page variable
var editing_item = null;
var item_name = "Checkin";
var item_names = "Checkin";
var deleted_id = null;
var search_value = null;
var page_datatable = null;
var deleted_obj = null;
var load_autocomplete_component = null;
_current_page = 1;
var doneTypingInterval = 500;
var typingTimer;
var searching_value_timeout = "";

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

	page_datatable = $('#page_datatable').DataTable({
		"ajax": {
			"url": base_request_url + "/admin/checkinItem",
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
			{ title: "Day", data: "day" },
			{ title: "Name", data: "awardName" },
			{ title: "Point", data: "awardPoint" },
			{ title: "Bonus", data: "pointBonus" },
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
					return return_str;
				}
			}
		],
		"aoColumnDefs": [
			{ "sWidth": "10%", 'aTargets': [0] },
			{ "sWidth": "20%", 'aTargets': [1] },
			{ "sWidth": "10%", 'aTargets': [2] },
			{ "sWidth": "10%", 'aTargets': [3] },
			{ "sWidth": "30%", 'aTargets': [4] },
			{ "sWidth": "20%", 'aTargets': [5] },
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
				editing_item = obj_temp.day;
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.awardName);
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.awardName);
				$('#modal_add_edit .txt_add_edit_item_award').val(obj_temp.awardPoint);
				$('#modal_add_edit .txt_add_edit_item_bonus').val(obj_temp.pointBonus);
				$('#modal_add_edit .txt_add_edit_item_day').val(obj_temp.day);
				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_from_date').val(moment.unix(obj_temp.fromDate / 1000).format(format.value));
				$('.txt_add_edit_item_to_date').val(moment.unix(obj_temp.toDate / 1000).format(format.value));
				$('#modal_add_edit .btn_modal_save_new').hide();
				$('#modal_add_edit .btn_modal_save_update').show();
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
					console.log("press");
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
								console.log("success");
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
			return $.trim($(this).val()) == "true";
		}).prop('selected', true);
		$('.select_daily').selectpicker('refresh');
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$("#modal_add_edit").modal("show");
	});
	$('.date-picker').datepicker({
		rtl: App.isRTL(),
		orientation: "left",
		autoclose: true
	});

	//event for modal
	$('.btn_modal_save_update').click(function () {
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update " + item_name, item_name + " name is required");
			return;
		}
		_send_info.data = {
			"awardName": $(".txt_add_edit_item_name").val(),
			"day": parseInt($(".txt_add_edit_item_day").val()),
			"awardPoint": $('.txt_add_edit_item_award').val(),
			"pointBonus": $(".txt_add_edit_item_bonus").val(),
		};
		$(".loading_icon").show();
		$.ajax({
			url: base_request_url + "/admin/checkinItem",
			type: "PUT",
			data: JSON.stringify(_send_info.data),
			contentType: "application/json",
			dataType: "json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.onlyMessage == 'Success') {
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
		format: "yyyy-MM-dd HH:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});
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

jQuery(document).ready(function () {
	Page_script.init();
	load_page();

});