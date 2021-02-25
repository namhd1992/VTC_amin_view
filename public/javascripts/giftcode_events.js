//page variable
var editing_item = null;
var item_name = "Giftcode Event";
var item_names = "Giftcode Events";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
_current_page = 1;
var search_value = null;

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

var load_page = function () {
	$(".loading_icon").show();
	//ajax get all datatable items
	_send_info.data = {
		"limit": _per_page,
		"offset": _per_page * (_current_page - 1),
	};

	$('.bs-select').selectpicker({
		iconBase: 'fa',
		tickIcon: 'fa-check'
	});

	var remove_channel = function (id) {
		channel_arr.splice(channel_arr.indexOf(id), 1);
	};

	page_datatable = $('#page_datatable').DataTable({
		ajax: {
			"url": base_request_url + "/admin/giftcodeEvent",
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
		responsive: true,
		columns: [
			{ title: "ID", data: "giftcodeEvent.id" },
			{ title: "Title", data: "title" },
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
			{ title: "Total", data: "giftcodeEvent.numberGiftcode" },
			{
				title: "Left",
				data: null,
				render: function (data, type, full, meta) {
					var string = full.giftcodeEvent.numberGiftcode - full.giftcodeEvent.numberGiftcodeLost;
					return string;
				}
			},
			{ title: "Given", data: "giftcodeEvent.numberGiftcodeLost" },
			{
				title: "Active on",
				data: null,
				render: function (data, type, full, meta) {
					var format = getSetting(_setting_data, "date_format");
					var news_date = moment.unix(full.giftcodeEvent.dateStartEvent / 1000).format(format.value);
					return news_date;
				}
			},
			{
				title: "Action",
				data: null,
				render: function (data, type, full, meta) {
					var return_str = "";
					if (checkFunction("giftcodeEventManager")) {
						return_str += "<a class='btn_edit_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-wrench'></i> Edit </a>";
					}
					if (checkFunction("giftcodeEventManager")) {
						return_str += "<a class='btn_delete_item' item_id='" + full.id + "' item_obj='" + JSON.stringify(full) + "'><i class='icon-trash'></i> Delete </a>";
					}
					return return_str;
				}
			}
		],
		"aoColumnDefs": [
			{ responsivePriority: 1, "sWidth": "5%", 'aTargets': [0] },
			{ responsivePriority: 2, "sWidth": "20%", 'aTargets': [1] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [2] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [3] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [4] },
			{ responsivePriority: 2, "sWidth": "5%", 'aTargets': [5] },
			{ responsivePriority: 2, "sWidth": "15%", 'aTargets': [6] },
			{ responsivePriority: 1, "sWidth": "10%", 'aTargets': [7] },
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
				$(".txt_add_edit_item_channel").attr("name", "channelId");
				$('.hidden_add_edit_item_condidion').attr("name", "conditionId");
				$('#modal_add_edit .modal-title').html("Edit " + item_name + " " + obj_temp.title);
				// $('.file_add_edit_item_giftcode').parent().parent().hide();
				// $('.file_add_edit_item_giftcode').attr("name", "");
				$('#modal_add_edit .txt_add_edit_item_name').val(obj_temp.title);
				$('#modal_add_edit .txt_add_edit_item_android').val(obj_temp.giftcodeEvent.urlDownloadAndroid);
				$('#modal_add_edit .txt_add_edit_item_price').val(obj_temp.giftcodeEvent.price);
				$('#modal_add_edit .txt_add_edit_item_vip').val(obj_temp.giftcodeEvent.vipLevel);
				if (obj_temp.giftcodeEvent.inGame != null) {
					$('#single_select_game').val(obj_temp.giftcodeEvent.inGame.id);
				}
				$('#single_select_showing').val(obj_temp.giftcodeEvent.showing);
				$('#modal_add_edit .txt_add_edit_item_ios').val(obj_temp.giftcodeEvent.urlDownloadiOS);
				$('#modal_add_edit .area_add_edit_item_message_notify').val(obj_temp.giftcodeEvent.messageNotifi);
				$('#modal_add_edit .txt_add_edit_item_download_game').val(obj_temp.giftcodeEvent.gameDownloadName);
				$('#modal_add_edit .txt_add_edit_item_image_item_url').val(obj_temp.itemImage);
				$('.cb_add_edit_item_condition span').each(function (key, item) {
					if ($($(item).find("input")[0]).val() != "4") {
						$(item).removeClass("checked");
					}
				});
				$(obj_temp.giftcodeEvent.giftcodeCondition).each(function (key, item) {
					$("input[type=checkbox][value=" + item.id + "]").parent().addClass("checked");
					$("input[type=checkbox][value=" + item.id + "]").attr("checked", "checked");
					$(".group_condition").hide();
					if (item.name == "Download game") {
						$(".group_download").show();
						$(".txt_add_edit_item_package_android").attr("name", "androidPackage");
						$(".txt_add_edit_item_package_ios").attr("name", "iosSchemes");
						$(".txt_add_edit_item_package_android").val(obj_temp.giftcodeEvent.androidPackage);
						$(".txt_add_edit_item_package_ios").val(obj_temp.giftcodeEvent.iosSchemes);
					}
					if (item.name == "Share link facebook") {
						$(".group_share").show();
						$(".txt_add_edit_item_share").attr("name", "urlShareFB");
						$(".txt_add_edit_item_share").val(obj_temp.giftcodeEvent.urlShareFB);
					}
					if (item.name == "Login Game") {
						$(".group_login").show();
						$(".single_select_game_login").attr("name", "scoinGameId");
					}
				});
				$('#select2-single_select-container').html("");
				channel_arr = [];
				$(".current_channels").html("");
				$(".txt_add_edit_item_channel").val("");
				if (obj_temp.channelsId[0] != undefined) {
					channel_arr.push(obj_temp.channelsId[0]);
					$(".current_channels").html(" <span channel_id='" + obj_temp.channelsId[0] + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select option[value=" + obj_temp.channelsId[0] + "]").html() + "<span class='remove_channel' data-role='remove'></span></span>");
					$(".txt_add_edit_item_channel").val(obj_temp.channelsId[0]);
					$(".current_channels .remove_channel").click(function () {
						$(".txt_add_edit_item_channel").val("");
						remove_channel($(this).parent().attr("channel_id"));
						$(this).parent().remove();
					});
				}
				$('#modal_add_edit .txt_add_edit_item_image_url').val(obj_temp.defaultImage);
				$('#modal_add_edit .area_add_edit_item_desc').val(obj_temp.content);

				var format = getSetting(_setting_data, "date_format");
				$('.txt_add_edit_item_dateStart').val(moment.unix(obj_temp.giftcodeEvent.dateStartEvent / 1000).format(format.value));
				$('.txt_add_edit_item_dateEnd').val(moment.unix(obj_temp.giftcodeEvent.dateEndEvent / 1000).format(format.value));
				$(".form_datetime").datetimepicker({
					autoclose: true,
					isRTL: App.isRTL(),
					format: "yyyy-MM-dd hh:ii",
					pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
				});
				$(".hidden_giftcode_id").remove();
				$("#add_giftcode_form").append("<input type='hidden' class='hidden_giftcode_id' name='giftcodeEventId' value='" + obj_temp.giftcodeEvent.id + "' />");
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
				$('.btn_delete_item').attr("item_id", obj_temp.giftcodeEvent.id);
				$('#modal_add_edit').modal('show');
			});
			$('.btn_delete_item').click(function () {
				var obj_temp = JSON.parse($(this).attr("item_obj"));
				deleted_id = obj_temp.giftcodeEvent.id;
				$("#modal_confirm").modal("show");
			});
		},
	});
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
			if ($(this).val() == 1 && $(this).parent().hasClass("checked")) {
				$(".group_download").show();
				$(".txt_add_edit_item_package_android").attr("name", "androidPackage");
				$(".txt_add_edit_item_package_ios").attr("name", "iosSchemes");
			} else if ($(this).val() == 1 && !$(this).parent().hasClass("checked")) {
				$(".group_download").hide();
				$(".txt_add_edit_item_package_android").attr("name", "");
				$(".txt_add_edit_item_package_ios").attr("name", "");
			}
			if ($(this).val() == 8 && $(this).parent().hasClass("checked")) {
				$(".group_share").show();
				$(".txt_add_edit_item_share").attr("name", "urlShareFB");
			} else if ($(this).val() == 8 && !$(this).parent().hasClass("checked")) {
				$(".group_share").hide();
				$(".txt_add_edit_item_share").attr("name", "");
			}
			if ($(this).val() == 6 && $(this).parent().hasClass("checked")) {
				$(".group_login").show();
				$(".single_select_game_login").attr("name", "scoinGameId");
			} else if ($(this).val() == 6 && !$(this).parent().hasClass("checked")) {
				$(".group_login").hide();
				$(".single_select_game_login").attr("name", "");
			}
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
				channel_arr = [];
				channel_arr.push($("#single_select").val());
				$(".current_channels").html(" <span channel_id='" + $("#single_select").val() + "' class='tag label label-primary'><i class='fa fa-folder'></i> " + $("#single_select option:selected").text() + "<span class='remove_channel' data-role='remove'></span></span>");
				$(".txt_add_edit_item_channel").val($("#single_select").val());
				$(".current_channels .remove_channel").click(function () {
					$(".txt_add_edit_item_channel").val("");
					remove_channel($(this).parent().attr("channel_id"));
					$(this).parent().remove();
				});
			}
		});

		$("#single_select_showing").change(function (event) {
			if (event.target.value == 1) {
				$(".cb_condition_label").hide();
				$(".cb_app").show();
			}
			if (event.target.value == 2) {
				$(".cb_condition_label").hide();
				$(".cb_web").show();
			}
			if (event.target.value == 3) {
				$(".cb_condition_label").hide();
				$(".cb_app_web").show();
			}
			if (event.target.value == 4) {
				$(".cb_condition_label").hide();
				$(".cb_plugin").show();
			}
			$(".cb_add_edit_item_condition input").uniform();
		});
	};

	//get all conditions
	_send_info.data = {};
	$.ajax({
		url: base_request_url + "/admin/giftcodeCondition",
		type: "GET",
		contentType: "application/json",
		dataType: "json",
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
		},
		success: function (data) {
			$(data.dataArr).each(function (key, item) {
				switch (item.name) {
					case "Download game":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Like fanpage":
						// $(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Share post facebook":
						// $(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Login Splay":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Check UDID":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Login Game":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web cb_plugin"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Comment post facebook":
						// $(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_web"><input type="checkbox" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Share link facebook":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_web cb_app cb_app_web"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Update profile":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web cb_plugin"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Save game":
						$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_plugin"><input type="checkbox" value="' + item.id + '" />' + item.name + '</label>');
						break;
					case "Phone number validated":
					$(".cb_add_edit_item_condition").append('<label class="cb_condition_label cb_app_web cb_app cb_web cb_plugin"><input type="checkbox" class="cb_condition" value="' + item.id + '" />' + item.name + '</label>');
						break;
					default:
				}
			});
			$(".cb_add_edit_item_condition input").uniform();
			$(".cb_add_edit_item_condition .cb_condition").change(function () {
				console.log($(this).val());
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});
	//ajax get all channels
	_send_info.data = {
		limit: 1000,
		offset: 0
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
			$(data.dataArr).each(function (key, item) {
				$("#single_select").append("<option value='" + item.id + "'> " + item.name + "</option>");
			});
			load_autocomplete_component();
		},
		error: function (err) {
			console.log(err.error());
		}
	});

	//ajax get all game
	_send_info.data = {
		limit: 1000,
		offset: 0
	};
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
			$(".loading_icon").hide();
			$(data.data).each(function (key, item) {
				$("#single_select_game").append("<option value='" + item.id + "'> " + item.name + "</option>");
				$("#single_select_game_login").append("<option value='" + item.scoinGameId + "'> " + item.name + "</option>");
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
		$(':input[type="number"]').val(0);
		$('.hidden_add_edit_item_condidion').attr("name", "conditionId");
		$(".txt_add_edit_item_channel").attr("name", "channelId");
		$('.cb_add_edit_item_condition span').each(function (key, item) {
			if ($($(item).find("input")[0]).val() != "4") {
				$(item).removeClass("checked");
			}
		});
		$('.current_channels').html("");
		$('.file_add_edit_item_giftcode').parent().parent().show();
		$('.file_add_edit_item_giftcode').attr("name", "giftCodeFile");
		channel_arr = [];
		$('#modal_add_edit .btn_modal_save_new').show();
		$('#modal_add_edit .btn_modal_save_update').hide();
		$('.hidden_giftcode_id').remove();
		if (!checkFunction("giftcodeEventManager")) {
			$('.btn_delete_item').hide();
		}
		$("#modal_add_edit").modal("show");
		$(".cb_condition_label").hide();
		$(".cb_app").show();
	});
	$('#page_datatable').on('order.dt', function () {
	})
		.on('search.dt', function () {
		})
		.on('page.dt', function () {
		})
		.dataTable();
	//event for modal
	$('.btn_confirm_yes').click(function () {
		$(".loading_icon").show();
		_send_info.data = {
			"giftcodeEventId": deleted_id
		};
		$.ajax({
			url: base_request_url + "/admin/giftcodeEvent",
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
				show_toast_notif("success", "Successfully", "Deleted: '" + $(".txt_add_edit_item_name").val() + "'");
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Error", "'" + error.responseText + "'");
				$(".loading_icon").hide();
			},
		});
	});
	$('.btn_modal_save_new').click(function () {
		$(".loading_icon").show();
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to create event", "Event name is required");
			return;
		}
		if ($(".txt_add_edit_item_image_url").val() == "") {
			show_toast_notif("error", "Unable to create event", "Image is required");
			return;
		}
		if ($(".area_add_edit_item_desc").val() == "") {
			show_toast_notif("error", "Unable to create event", "Description is required");
			return;
		}
		if ($('.txt_add_edit_item_dateStart').val() == "" || $('.txt_add_edit_item_dateEnd').val() == "") {
			show_toast_notif("error", "Unable to create event", "Date range is required");
			return;
		}
		if ($('.file_add_edit_item_giftcode').val() == "") {
			show_toast_notif("error", "Unable to create event", "Giftcode file is required");
			return;
		}
		if ($(".txt_add_edit_item_channel").val() == "") {
			$(".txt_add_edit_item_channel").attr("name", "");
		}
		var condition_download = false;
		var condition_share = false;
		var condition = "";
		$(".cb_condition").each(function (key, item) {
			if ($(item).parent().hasClass("checked")) {
				condition += item.value + ",";
				if (item.value == 1) {
					condition_download = true;
				}
				if (item.value == 3) {
					condition_share = true;
				}
			}
		});
		if (($('.txt_add_edit_item_package_android').val() == "" && $('.txt_add_edit_item_package_ios').val() == "") && condition_download) {
			show_toast_notif("error", "Unable to create event", "Should containt Android package name or iOS URL Schemes");
			return;
		}
		if ($('.txt_add_edit_item_share').val() == "" && condition_share) {
			show_toast_notif("error", "Unable to create event", "Share link is required");
			return;
		}
		condition = condition.replace(/,\s*$/, "");
		$('.hidden_add_edit_item_condidion').val(condition);
		var start_date = new Date($('.txt_add_edit_item_dateStart').val());
		var end_date = new Date($('.txt_add_edit_item_dateEnd').val());
		$('.hidden_start_date').val(new moment($(".txt_add_edit_item_dateStart").val(), "YYYY-MMMM-D hh:mm").unix() * 1000);
		$('.hidden_end_date').val(new moment($(".txt_add_edit_item_dateEnd").val(), "YYYY-MMMM-D hh:mm").unix() * 1000);
		var formData = new FormData($('#add_giftcode_form')[0]);
		var current_date = new Date().getTime();
		if (start_date.getTime() > end_date.getTime()) {
			show_toast_notif("error", "Unable to create event", "Date range is invalid");
			return;
		}
		$.ajax({
			url: base_request_url + "/admin/giftcodeEvent",
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
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Created '" + $(".txt_add_edit_item_name").val() + "'");
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage);
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
				$(".loading_icon").hide();
			},
		});
	});
	$('.btn_modal_save_update').click(function () {
		$(".loading_icon").show();
		if ($(".txt_add_edit_item_name").val() == "") {
			show_toast_notif("error", "Unable to update event", "Event name is required");
			return;
		}
		if ($(".txt_add_edit_item_image_url").val() == "") {
			show_toast_notif("error", "Unable to update event", "Image is required");
			return;
		}
		if ($(".area_add_edit_item_desc").val() == "") {
			show_toast_notif("error", "Unable to update event", "Description is required");
			return;
		}
		if ($('.txt_add_edit_item_dateStart').val() == "" || $('.txt_add_edit_item_dateEnd').val() == "") {
			show_toast_notif("error", "Unable to update event", "Date range is required");
			return;
		}
		if ($('.file_add_edit_item_giftcode').val() == "") {
			$('.file_add_edit_item_giftcode').attr("name", "");
		}
		if ($(".txt_add_edit_item_channel").val() == "") {
			$(".txt_add_edit_item_channel").attr("name", "");
		}
		var condition = "";
		$(".cb_condition").each(function (key, item) {
			if ($(item).parent().hasClass("checked")) {
				condition += item.value + ",";
			}
		});
		condition = condition.replace(/,\s*$/, "");
		$('.hidden_add_edit_item_condidion').val(condition);
		if (condition == "") {
			$('.hidden_add_edit_item_condidion').attr("name", "");
		} else {
			$('.hidden_add_edit_item_condidion').attr("name", "conditionId");
		}
		if ($(".txt_add_edit_item_channel").val() == "") {
			$(".txt_add_edit_item_channel").attr("name", "");
		} else {
			$(".txt_add_edit_item_channel").attr("name", "channelId");
		}
		var start_date = new Date($('.txt_add_edit_item_dateStart').val());
		var end_date = new Date($('.txt_add_edit_item_dateEnd').val());
		$('.hidden_start_date').val(new moment($(".txt_add_edit_item_dateStart").val(), "YYYY-MMMM-D hh:mm").unix() * 1000);
		$('.hidden_end_date').val(new moment($(".txt_add_edit_item_dateEnd").val(), "YYYY-MMMM-D hh:mm").unix() * 1000);
		var current_date = new Date().getTime();
		if (start_date.getTime() > end_date.getTime()) {
			show_toast_notif("error", "Unable to update event", "Date range is invalid");
			return;
		}
		var formData = new FormData($('#add_giftcode_form')[0]);
		$.ajax({
			url: base_request_url + "/admin/updateGiftcodeEvent",
			type: "POST",
			data: formData,
			cache: false,
			timeout: 3000000,
			contentType: false,
			processData: false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
			},
			success: function (data) {
				page_datatable.ajax.reload(null, false);
				if (data.statusCode == 'T') {
					show_toast_notif("success", "Successfully", "Updated '" + $(".txt_add_edit_item_name").val() + "'");
					$('#modal_add_edit').modal('hide');
				} else {
					show_toast_notif("error", "Fail", data.onlyMessage);
				}
				$(".loading_icon").hide();
			},
			error: function (error) {
				show_toast_notif("error", "Successfully", "Error '" + error.responseText + "'");
				$(".loading_icon").hide();
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
	if (!checkFunction("giftcodeEventManager")) {
		$(".btn_add_new_item").remove();
	}
	$(".area_add_edit_item_desc").keydown(function () {
		$(".character_left").html(200 - parseInt($(this).val().length));
		if (200 - parseInt($(this).val().length) < 0) {
			$(".character_left").css("color", "red");
		} else {
			$(".character_left").css("color", "green");
		}
	});
	$(".search_submit").click(function () {
		search_value = $(".search_input").val();
		page_datatable.ajax.reload(null, false);
	});
	$(".search_clear").click(function () {
		$(".search_input").val("");
		search_value = "";
		page_datatable.ajax.reload(null, false);
	});
	$(".form_datetime").datetimepicker({
		autoclose: true,
		isRTL: App.isRTL(),
		format: "yyyy-MM-dd hh:ii",
		pickerPosition: (App.isRTL() ? "bottom-right" : "bottom-left")
	});
};

function formDataToJSON(formElement) {
	var formData = new FormData(formElement),
		convertedJSON = {},
		it = formData.entries(),
		n;

	while (n = it.next()) {
		if (!n || n.done) break;
		convertedJSON[n.value[0]] = n.value[1];
	}

	return convertedJSON;
}

jQuery(document).ready(function () {
	Page_script.init();
	load_page();
});